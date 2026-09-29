import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FLASHCARD_GENERATION_PROMPT, STUDY_PLANNER_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const { mode, topic, customApiKey, appointments, homework } = await request.json();
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (mode === "flashcards") {
      if (!apiKey) {
        return NextResponse.json({
          flashcards: [
            { front: "Wat is de Wet van Ohm?", back: "U = I × R (Spanning in Volt = Stroomsterkte in Ampère × Weerstand in Ohm)" },
            { front: "Wat is de eenheid van elektrisch vermogen?", back: "Watt (W), berekend als P = U × I" },
            { front: "Wat gebeurt er met de totale weerstand bij serieschakeling?", back: "De weerstanden tellen bij elkaar op: R_tot = R1 + R2 + ..." },
            { front: "Wat is elektrische lading en wat is de eenheid?", back: "Lading (symbool Q), uitgedrukt in Coulomb (C). Q = I × t" },
            { front: "Hoe staat een ampèremeter aangesloten in een schakeling?", back: "Altijd in serie met het component waarvan je de stroomsterkte wil meten." },
          ],
          simulated: true,
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${FLASHCARD_GENERATION_PROMPT}\n\nOnderwerp / Lesstof:\n${topic}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON from output
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ flashcards: parsed, simulated: false });
      }

      return NextResponse.json({ flashcards: [], error: "Kon JSON niet parsen", raw: text });
    }

    if (mode === "study_plan") {
      if (!apiKey) {
        return NextResponse.json({
          plan: [
            {
              time: "10:35 - 11:25",
              type: "Uitval / Vrij lesuur",
              recommendation: "Geschiedenis valt uit! Gebruik 35 minuten voor Natuurkunde opgaven H5 (formules oefenen) en neem 15 min pauze.",
            },
            {
              time: "14:15 - 15:00",
              type: "Na school",
              recommendation: "Wiskunde B opgaven nakijken in het antwoordenboek.",
            },
            {
              time: "19:00 - 19:40",
              type: "Avond sessie",
              recommendation: "Actieve recall met Omni Flashcards voor Natuurkunde toets morgen.",
            },
          ],
          simulated: true,
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${STUDY_PLANNER_PROMPT}\n\nRooster vandaag:\n${JSON.stringify(appointments || [])}\n\nHuiswerk & Toetsen:\n${JSON.stringify(homework || [])}`;
      const result = await model.generateContent(prompt);
      return NextResponse.json({ planText: result.response.text(), simulated: false });
    }

    return NextResponse.json({ error: "Onbekende modus" }, { status: 400 });
  } catch (error: any) {
    console.error("AI Study Hub error:", error);
    return NextResponse.json(
      { error: error?.message || "Fout bij AI studiehulp" },
      { status: 500 }
    );
  }
}
