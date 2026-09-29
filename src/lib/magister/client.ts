import { MagisterAppointment, MagisterGrade, MagisterHomework, SubjectSummary } from "../types/magister";
import { getMockAppointments, getMockGrades, getMockHomework } from "./mockData";

export interface MagisterApiOptions {
  accessToken?: string;
  schoolTenant?: string;
  isDemo?: boolean;
}

export class MagisterClient {
  private options: MagisterApiOptions;

  constructor(options: MagisterApiOptions) {
    this.options = options;
  }

  // Haal rooster afspraken op voor een datumrange
  async getAppointments(van: Date, tot: Date): Promise<MagisterAppointment[]> {
    if (this.options.isDemo || !this.options.accessToken) {
      return getMockAppointments(van);
    }

    try {
      const vanStr = van.toISOString().split("T")[0];
      const totStr = tot.toISOString().split("T")[0];

      const res = await fetch(`/api/magister/api/personen/me/afspraken?van=${vanStr}&tot=${totStr}`, {
        headers: {
          Authorization: `Bearer ${this.options.accessToken}`,
          "X-Magister-Tenant": this.options.schoolTenant || "",
        },
      });

      if (!res.ok) {
        throw new Error(`Magister status: ${res.status}`);
      }

      const json = await res.json();
      return json.Items || [];
    } catch (err) {
      console.warn("Fout bij live Magister afspraken, fallback naar cache/mock", err);
      return getMockAppointments(van);
    }
  }

  // Haal cijfers op
  async getGrades(): Promise<MagisterGrade[]> {
    if (this.options.isDemo || !this.options.accessToken) {
      return getMockGrades();
    }

    try {
      const res = await fetch(`/api/magister/api/personen/me/aanmeldingen/actief/cijfers/cijferoverzichtvooraanmelding?actievePerioden=true`, {
        headers: {
          Authorization: `Bearer ${this.options.accessToken}`,
          "X-Magister-Tenant": this.options.schoolTenant || "",
        },
      });

      if (!res.ok) {
        throw new Error(`Magister status: ${res.status}`);
      }

      const json = await res.json();
      const items = json.Items || [];
      return items.map((item: any) => ({
        id: item.CijferId || Math.random(),
        datumIngevoerd: item.DatumIngevoerd || new Date().toISOString(),
        cijferStr: item.CijferStr || String(item.Waarde),
        cijfer: parseFloat(item.Waarde) || parseFloat(item.CijferStr) || 0,
        isVoldoende: item.IsVoldoende ?? (parseFloat(item.Waarde) >= 5.5),
        weegfactor: item.Weegfactor || 1,
        omschrijving: item.Omschrijving || "Toets",
        vak: {
          id: item.Vak?.Id || 0,
          code: item.Vak?.Afkorting || "VAK",
          naam: item.Vak?.Omschrijving || "Onbekend Vak",
        },
        periode: item.Periode?.Omschrijving || "Periode 1",
        type: item.KolomKop || "Proefwerk",
      }));
    } catch (err) {
      console.warn("Fout bij live Magister cijfers, fallback naar mock", err);
      return getMockGrades();
    }
  }

  // Haal huiswerk op
  async getHomework(): Promise<MagisterHomework[]> {
    if (this.options.isDemo || !this.options.accessToken) {
      return getMockHomework();
    }

    // Vaak kan huiswerk worden geëxtraheerd uit afspraken met infoType > 0
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 14);
    const appointments = await this.getAppointments(now, future);

    return appointments
      .filter((a) => a.infoType > 0 || (a.inhoud && a.inhoud.trim().length > 0))
      .map((a) => ({
        id: a.id,
        appointmentId: a.id,
        vak: a.vakken?.[0]?.naam || a.omschrijving || "Vak",
        titel: a.omschrijving,
        omschrijving: a.inhoud || "Geen details opgegeven",
        deadline: a.start,
        isToets: a.infoType === 2 || a.infoType === 3 || a.type === 8,
        voltooid: a.afgerond || false,
      }));
  }

  // Bereken gewogen statistieken per vak
  calculateSubjectSummaries(grades: MagisterGrade[]): SubjectSummary[] {
    const map = new Map<string, { totalWeight: number; sumWeighted: number; count: number; passed: number; failed: number; name: string }>();

    for (const g of grades) {
      if (isNaN(g.cijfer) || g.cijfer <= 0) continue;
      const key = g.vak.code;
      const existing = map.get(key) || {
        totalWeight: 0,
        sumWeighted: 0,
        count: 0,
        passed: 0,
        failed: 0,
        name: g.vak.naam,
      };

      existing.totalWeight += g.weegfactor;
      existing.sumWeighted += g.cijfer * g.weegfactor;
      existing.count += 1;
      if (g.cijfer >= 5.5) {
        existing.passed += 1;
      } else {
        existing.failed += 1;
      }
      map.set(key, existing);
    }

    return Array.from(map.entries()).map(([code, val]) => ({
      vakCode: code,
      vakNaam: val.name,
      gemiddelde: val.totalWeight > 0 ? parseFloat((val.sumWeighted / val.totalWeight).toFixed(1)) : 0,
      aantalCijfers: val.count,
      voldoendes: val.passed,
      onvoldoendes: val.failed,
    }));
  }
}
