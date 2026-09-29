import { MagisterAppointment, MagisterGrade, MagisterHomework } from "../types/magister";

export function getMockAppointments(referenceDate = new Date()): MagisterAppointment[] {
  const base = new Date(referenceDate);
  const year = base.getFullYear();
  const month = base.getMonth();
  const day = base.getDate();

  // Helper om datumtijd in te stellen
  const dt = (dOffset: number, hour: number, min: number) => {
    const d = new Date(year, month, day + dOffset, hour, min, 0);
    return d.toISOString();
  };

  return [
    // Vandaag: Les 1 - Nederlands (Normaal)
    {
      id: 101,
      start: dt(0, 8, 30),
      einde: dt(0, 9, 20),
      lesuurVan: 1,
      lesuurTotMet: 1,
      duurtHeleDag: false,
      omschrijving: "Nederlands",
      lokatie: "Lokaal 204",
      status: 1, // Normaal
      type: 7,
      isVrij: false,
      inhoud: "Boektoets bespreken & Argumenteren H3",
      infoType: 1, // Huiswerk
      vakken: [{ id: 1, naam: "Nederlands" }],
      docenten: [{ docentcode: "JNS", naam: "Dhr. Jansen" }],
      lokalen: [{ naam: "204" }],
    },
    // Vandaag: Les 2 - Wiskunde B (Gewijzigd lokaal!)
    {
      id: 102,
      start: dt(0, 9, 25),
      einde: dt(0, 10, 15),
      lesuurVan: 2,
      lesuurTotMet: 2,
      duurtHeleDag: false,
      omschrijving: "Wiskunde B",
      lokatie: "Lokaal 312 (was 108)",
      status: 4, // Gewijzigd
      type: 7,
      isVrij: false,
      inhoud: "Differentiaalrekening opgaven 42 t/m 55",
      infoType: 1,
      vakken: [{ id: 2, naam: "Wiskunde B" }],
      docenten: [{ docentcode: "VMR", naam: "Mevr. Van Meer" }],
      lokalen: [{ naam: "312" }],
    },
    // Vandaag: Les 3 - Geschiedenis (UITVAL!)
    {
      id: 103,
      start: dt(0, 10, 35),
      einde: dt(0, 11, 25),
      lesuurVan: 3,
      lesuurTotMet: 3,
      duurtHeleDag: false,
      omschrijving: "Geschiedenis",
      lokatie: "Lokaal 115",
      status: 5, // Uitval
      type: 7,
      isVrij: true,
      inhoud: "Les vervalt i.v.m. vergadering docent",
      infoType: 0,
      vakken: [{ id: 3, naam: "Geschiedenis" }],
      docenten: [{ docentcode: "DBR", naam: "Dhr. De Bruin" }],
      lokalen: [{ naam: "115" }],
    },
    // Vandaag: Les 4 - Natuurkunde (Toets!)
    {
      id: 104,
      start: dt(0, 11, 30),
      einde: dt(0, 12, 20),
      lesuurVan: 4,
      lesuurTotMet: 4,
      duurtHeleDag: false,
      omschrijving: "Natuurkunde",
      lokatie: "Binas Lab 04",
      status: 1,
      type: 8, // Toets
      isVrij: false,
      inhoud: "TOETS: H5 Elektriciteit en Magnetisme (Weging 2x)",
      infoType: 2, // Proefwerk
      vakken: [{ id: 4, naam: "Natuurkunde" }],
      docenten: [{ docentcode: "BKK", naam: "Dhr. Bakker" }],
      lokalen: [{ naam: "Lab 04" }],
    },
    // Vandaag: Les 5 - Engels
    {
      id: 105,
      start: dt(0, 13, 0),
      einde: dt(0, 13, 50),
      lesuurVan: 5,
      lesuurTotMet: 5,
      duurtHeleDag: false,
      omschrijving: "Engels",
      lokatie: "Lokaal 102",
      status: 1,
      type: 7,
      isVrij: false,
      inhoud: "Speaking skills & Unit 4 Vocabulary",
      infoType: 1,
      vakken: [{ id: 5, naam: "Engels" }],
      docenten: [{ docentcode: "SMI", naam: "Mevr. Smith" }],
      lokalen: [{ naam: "102" }],
    },
    // Morgen: Scheikunde
    {
      id: 106,
      start: dt(1, 8, 30),
      einde: dt(1, 9, 20),
      lesuurVan: 1,
      lesuurTotMet: 1,
      duurtHeleDag: false,
      omschrijving: "Scheikunde",
      lokatie: "Lab 02",
      status: 1,
      type: 7,
      isVrij: false,
      inhoud: "Reactiesnelheden en evenwichten practicum",
      infoType: 1,
      vakken: [{ id: 6, naam: "Scheikunde" }],
      docenten: [{ docentcode: "KLN", naam: "Dhr. Klein" }],
      lokalen: [{ naam: "Lab 02" }],
    },
    // Morgen: Biologie
    {
      id: 107,
      start: dt(1, 9, 25),
      einde: dt(1, 10, 15),
      lesuurVan: 2,
      lesuurTotMet: 2,
      duurtHeleDag: false,
      omschrijving: "Biologie",
      lokatie: "Lokaal 210",
      status: 1,
      type: 7,
      isVrij: false,
      inhoud: "Thema Genetica & DNA replicatie",
      infoType: 1,
      vakken: [{ id: 7, naam: "Biologie" }],
      docenten: [{ docentcode: "VRL", naam: "Mevr. Vrooland" }],
      lokalen: [{ naam: "210" }],
    },
  ];
}

export function getMockGrades(): MagisterGrade[] {
  return [
    {
      id: 201,
      datumIngevoerd: "2026-09-27T10:15:00Z",
      cijferStr: "7.8",
      cijfer: 7.8,
      isVoldoende: true,
      weegfactor: 2,
      omschrijving: "H4 Kansrekening & Combinatoriek",
      vak: { id: 2, code: "wisB", naam: "Wiskunde B" },
      periode: "Periode 1",
      type: "Proefwerk",
    },
    {
      id: 202,
      datumIngevoerd: "2026-09-24T14:30:00Z",
      cijferStr: "8.5",
      cijfer: 8.5,
      isVoldoende: true,
      weegfactor: 1,
      omschrijving: "Essay: De Verlichting in Nederland",
      vak: { id: 3, code: "ges", naam: "Geschiedenis" },
      periode: "Periode 1",
      type: "Praktische Opdracht",
    },
    {
      id: 203,
      datumIngevoerd: "2026-09-20T11:00:00Z",
      cijferStr: "5.2",
      cijfer: 5.2,
      isVoldoende: false,
      weegfactor: 2,
      omschrijving: "H3 Krachten en Beweging",
      vak: { id: 4, code: "nat", naam: "Natuurkunde" },
      periode: "Periode 1",
      type: "Proefwerk",
    },
    {
      id: 204,
      datumIngevoerd: "2026-09-18T09:45:00Z",
      cijferStr: "7.2",
      cijfer: 7.2,
      isVoldoende: true,
      weegfactor: 1,
      omschrijving: "SO Grammatica en Woordenschat",
      vak: { id: 1, code: "netl", naam: "Nederlands" },
      periode: "Periode 1",
      type: "Overhoring",
    },
    {
      id: 205,
      datumIngevoerd: "2026-09-15T13:20:00Z",
      cijferStr: "8.9",
      cijfer: 8.9,
      isVoldoende: true,
      weegfactor: 2,
      omschrijving: "Literature & Reading Comprehension Exam",
      vak: { id: 5, code: "entl", naam: "Engels" },
      periode: "Periode 1",
      type: "Proefwerk",
    },
    {
      id: 206,
      datumIngevoerd: "2026-09-12T15:00:00Z",
      cijferStr: "6.4",
      cijfer: 6.4,
      isVoldoende: true,
      weegfactor: 2,
      omschrijving: "Zuren en Basen Berekeningen",
      vak: { id: 6, code: "schk", naam: "Scheikunde" },
      periode: "Periode 1",
      type: "Proefwerk",
    },
  ];
}

export function getMockHomework(): MagisterHomework[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 3);

  return [
    {
      id: 301,
      appointmentId: 104,
      vak: "Natuurkunde",
      titel: "Toets H5 Elektriciteit",
      omschrijving: "Formules leren uit Binas tabel 35, oefenopgaven 14 t/m 28 maken.",
      deadline: tomorrow.toISOString(),
      isToets: true,
      voltooid: false,
    },
    {
      id: 302,
      appointmentId: 102,
      vak: "Wiskunde B",
      titel: "Huiswerk H3.4 Differentiëren",
      omschrijving: "Opgaven 42, 45, 48 en 51 nakijken in de antwoordenbundel.",
      deadline: tomorrow.toISOString(),
      isToets: false,
      voltooid: true,
    },
    {
      id: 303,
      appointmentId: 106,
      vak: "Scheikunde",
      titel: "Voorbereiding practicum reactiesnelheid",
      omschrijving: "Lees het voorschrift op blz. 88 en beantwoord de inleidende vragen.",
      deadline: nextWeek.toISOString(),
      isToets: false,
      voltooid: false,
    },
  ];
}
