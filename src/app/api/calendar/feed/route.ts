import { NextRequest, NextResponse } from "next/server";
import { generateICalFeed } from "@/lib/calendar/ical";
import { getMockAppointments } from "@/lib/magister/mockData";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get("demo") === "true";
  const token = searchParams.get("token");
  const tenant = searchParams.get("tenant");

  let appointments = getMockAppointments();

  if (!isDemo && token && tenant) {
    try {
      const now = new Date();
      const past = new Date();
      past.setDate(past.getDate() - 7);
      const future = new Date();
      future.setDate(future.getDate() + 30);

      const vanStr = past.toISOString().split("T")[0];
      const totStr = future.toISOString().split("T")[0];

      const cleanTenant = tenant.replace(".magister.net", "").trim().toLowerCase();
      const res = await fetch(`https://${cleanTenant}.magister.net/api/personen/me/afspraken?van=${vanStr}&tot=${totStr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        appointments = json.Items || appointments;
      }
    } catch (err) {
      console.warn("Calendar feed live fetch failed, serving fallback", err);
    }
  }

  const icsData = generateICalFeed(appointments, "Omni Schoolrooster");

  return new NextResponse(icsData, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="omni-rooster.ics"',
      "Cache-Control": "public, max-age=900, stale-while-revalidate=1800",
    },
  });
}
