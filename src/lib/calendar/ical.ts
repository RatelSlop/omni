import { MagisterAppointment } from "../types/magister";

function formatICalDate(isoString: string): string {
  const d = new Date(isoString);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function generateICalFeed(appointments: MagisterAppointment[], calendarTitle = "Omni Rooster"): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RatelSlop Studios//Omni Magister Companion//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarTitle}`,
    "X-WR-TIMEZONE:Europe/Amsterdam",
  ];

  for (const appt of appointments) {
    const isCancelled = appt.status === 5;
    const isChanged = appt.status === 4;
    const isTest = appt.infoType === 2 || appt.infoType === 3 || appt.type === 8;

    let summaryPrefix = "";
    if (isCancelled) summaryPrefix = "❌ [UITVAL] ";
    else if (isTest) summaryPrefix = "📝 [TOETS] ";
    else if (isChanged) summaryPrefix = "⚠️ [GEWIJZIGD] ";

    const summary = `${summaryPrefix}${appt.omschrijving || "Les"}`;
    const location = appt.lokatie || (appt.lokalen?.[0]?.naam ? `Lokaal ${appt.lokalen[0].naam}` : "");
    const description = [
      appt.inhoud ? `Huiswerk/Stof: ${appt.inhoud}` : "",
      appt.docenten?.[0]?.naam ? `Docent: ${appt.docenten[0].naam}` : "",
      appt.lesuurVan ? `Lesuur: ${appt.lesuurVan}` : "",
    ]
      .filter(Boolean)
      .join("\\n");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:omni-${appt.id}@omniweb.ratelslop.studio`);
    lines.push(`DTSTAMP:${formatICalDate(new Date().toISOString())}`);
    lines.push(`DTSTART:${formatICalDate(appt.start)}`);
    lines.push(`DTEND:${formatICalDate(appt.einde)}`);
    lines.push(`SUMMARY:${summary}`);
    if (location) lines.push(`LOCATION:${location}`);
    if (description) lines.push(`DESCRIPTION:${description}`);
    if (isCancelled) lines.push("STATUS:CANCELLED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function createGoogleCalendarUrl(appointment: MagisterAppointment): string {
  const title = encodeURIComponent(`${appointment.status === 5 ? "[UITVAL] " : ""}${appointment.omschrijving}`);
  const details = encodeURIComponent(appointment.inhoud || "Geen opmerkingen");
  const location = encodeURIComponent(appointment.lokatie || "");
  const dates = `${formatICalDate(appointment.start)}/${formatICalDate(appointment.einde)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
