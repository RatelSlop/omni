export interface MagisterSchool {
  id: string;
  name: string;
  url: string; // e.g. "schoolnaam.magister.net"
}

export interface MagisterSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  schoolUrl: string;
  studentId?: number;
  studentName?: string;
  isDemo?: boolean;
}

export interface MagisterTeacher {
  id?: number;
  naam?: string;
  docentcode: string;
}

export interface MagisterRoom {
  naam: string;
}

export interface MagisterAppointment {
  id: number;
  start: string; // ISO 8601
  einde: string; // ISO 8601
  lesuurVan?: number;
  lesuurTotMet?: number;
  duurtHeleDag: boolean;
  omschrijving: string;
  lokatie?: string;
  status: number; // 1 = normaal, 4 = gewijzigd, 5 = uitval
  type: number; // 1 = persoonlijk, 7 = les, 8 = toets
  isVrij: boolean;
  inhoud?: string;
  infoType: number; // 0 = geen, 1 = huiswerk, 2 = proefwerk, 3 = tentamen
  afgerond?: boolean;
  vakken?: { id: number; naam: string }[];
  docenten?: MagisterTeacher[];
  lokalen?: MagisterRoom[];
  herhaling?: boolean;
}

export interface MagisterGrade {
  id: number;
  datumIngevoerd: string;
  cijferStr: string;
  cijfer: number; // parsed float
  isVoldoende: boolean;
  weegfactor: number;
  omschrijving: string;
  vak: {
    id: number;
    code: string; // bijv. "wisB"
    naam: string; // bijv. "Wiskunde B"
  };
  periode: string; // bijv. "Periode 1"
  type: "Proefwerk" | "Overhoring" | "Praktische Opdracht" | "Schoolexamen" | "Participatie";
}

export interface MagisterHomework {
  id: number;
  appointmentId: number;
  vak: string;
  titel: string;
  omschrijving: string;
  deadline: string; // ISO
  isToets: boolean;
  voltooid: boolean;
}

export interface MagisterAbsence {
  id: number;
  datum: string;
  lesuur?: number;
  vak?: string;
  reden: string;
  ongeoorloofd: boolean;
}

export interface SubjectSummary {
  vakCode: string;
  vakNaam: string;
  gemiddelde: number;
  aantalCijfers: number;
  voldoendes: number;
  onvoldoendes: number;
  kleur?: string;
}
