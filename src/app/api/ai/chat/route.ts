import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OMNI_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const { messages, customApiKey } = await request.json();
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock / fallback response if no key is configured yet
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const fallbackReply = generateFallbackResponse(lastUserMsg);
      return NextResponse.json({ reply: fallbackReply, simulated: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: OMNI_SYSTEM_PROMPT,
    });

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const lastMsg = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMsg);
    const reply = result.response.text();

    return NextResponse.json({ reply, simulated: false });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Er ging iets mis bij het genereren van een AI-antwoord." },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("toets") || p.includes("natuurkunde")) {
    return `Voor je **Natuurkunde toets (H5 Elektriciteit)** raad ik je aan om te focussen op:\n\n1. **Wet van Ohm**: $U = I \\times R$ — zorg dat je weet hoe je naar elke variabele toe rekent.\n2. **Vermogen**: $P = U \\times I$ en $E = P \\times t$.\n3. **Serieschakeling vs Parallelschakeling**: bij serie telt de weerstand op ($R_{tot} = R_1 + R_2$), bij parallel telt de geleiding op ($1/R_{tot} = 1/R_1 + 1/R_2$).\n\n*Tip:* Je hebt vandaag het 3e uur uitval van Geschiedenis! Gebruik die 50 minuten om 3 oefenopgaven uit het boek te maken.`;
  }
  if (p.includes("cijfer") || p.includes("gemiddelde") || p.includes("wiskunde")) {
    return `Je staat momenteel een **7.8** voor Wiskunde B! 🎉\nMet een weging van 2x sta je er heel solide voor. Om op een 7.5+ te blijven staan voor je rapport, mag je op de volgende overhoring zelfs een **5.8** halen, maar als je een **7.5** scoort stijg je richting een 8!`;
  }
  return `Hoi! Ik ben **Omni AI**. Ik kan je helpen met je huiswerk, samenvattingen maken van toetsstof, of je planning optimaliseren rondom uitval en tussenuren. Wat wil je vandaag aanpakken?`;
}
