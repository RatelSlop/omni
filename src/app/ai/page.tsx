"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOmniStore } from "@/lib/store/useOmniStore";
import {
  Sparkles,
  Bot,
  Send,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  RotateCw,
  CheckCircle,
} from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function AIHubContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const { appointments, homework, settings } = useOmniStore();

  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "planner">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hoi! Ik ben **Omni AI**, jouw persoonlijke studieassistent. Stel me gerust een vraag over moeilijke formules, woordenschat, of laat me een samenvatting maken van je toetsstof!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Flashcards State
  const [flashcardTopic, setFlashcardTopic] = useState(
    initialTopic || "Natuurkunde H5 Elektriciteit en Wet van Ohm"
  );
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCardsLoading, setIsCardsLoading] = useState(false);

  // Planner State
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [isPlannerLoading, setIsPlannerLoading] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setActiveTab("flashcards");
      setFlashcardTopic(initialTopic);
      generateFlashcards(initialTopic);
    }
  }, [initialTopic]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          customApiKey: settings.ai.useCustomKey ? settings.ai.geminiApiKey : undefined,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else if (data.error) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `⚠️ Foutje: ${data.error}` },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Kon geen verbinding maken met Omni AI." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateFlashcards = async (topicToUse?: string) => {
    const topic = topicToUse || flashcardTopic;
    if (!topic || isCardsLoading) return;

    setIsCardsLoading(true);
    setFlashcards([]);
    setCardIndex(0);
    setIsFlipped(false);

    try {
      const res = await fetch("/api/ai/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "flashcards",
          topic,
          customApiKey: settings.ai.useCustomKey ? settings.ai.geminiApiKey : undefined,
        }),
      });
      const data = await res.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCardsLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    setIsPlannerLoading(true);
    try {
      const res = await fetch("/api/ai/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "study_plan",
          appointments,
          homework,
          customApiKey: settings.ai.useCustomKey ? settings.ai.geminiApiKey : undefined,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setStudyPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlannerLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Omni AI Study Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Gemini 2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Intelligente studieassistent, actieve recall flashcards en slimme planner
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border bg-accent/40 text-xs font-bold">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "chat"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Bot className="h-3.5 w-3.5" /> Chatbot
          </button>
          <button
            onClick={() => {
              setActiveTab("flashcards");
              if (flashcards.length === 0) generateFlashcards();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "flashcards"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Flashcards
          </button>
          <button
            onClick={() => {
              setActiveTab("planner");
              if (studyPlan.length === 0) generateStudyPlan();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "planner"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Studieplanner
          </button>
        </div>
      </div>

      {/* 1. CHATBOT TAB */}
      {activeTab === "chat" && (
        <div className="glass-card rounded-2xl border border-border flex flex-col h-[650px] overflow-hidden">
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-accent/60 text-foreground border border-border rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-2 rounded-2xl bg-accent text-xs text-muted animate-pulse">
                  Omni AI is aan het nadenken...
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border bg-background/50 flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Vraag Omni AI iets over je rooster, huiswerk of toetsstof..."
              className="flex-1 rounded-xl border border-border bg-accent/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Verstuur</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 2. FLASHCARDS TAB */}
      {activeTab === "flashcards" && (
        <div className="space-y-6">
          {/* Topic Generator bar */}
          <div className="glass-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={flashcardTopic}
              onChange={(e) => setFlashcardTopic(e.target.value)}
              placeholder="Bijv: Natuurkunde H5 Elektriciteit, of Frans Vocabulaire Unit 3"
              className="flex-1 rounded-xl border border-border bg-accent/30 px-4 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => generateFlashcards()}
              disabled={isCardsLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCardsLoading ? "animate-spin" : ""}`} />
              <span>{isCardsLoading ? "Genereren..." : "Genereer Flashcards"}</span>
            </button>
          </div>

          {/* Flashcard interactive viewer */}
          {flashcards.length > 0 && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-lg h-72 rounded-3xl glass-card border border-indigo-500/30 p-8 flex flex-col justify-between cursor-pointer select-none transition-all hover:scale-[1.02] shadow-glass"
              >
                <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
                  <span>
                    Kaart {cardIndex + 1} van {flashcards.length}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-500">
                    <RotateCw className="h-3.5 w-3.5" /> Klik om te draaien
                  </span>
                </div>

                <div className="text-center my-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
                    {isFlipped ? "Antwoord / Definitie" : "Vraag / Begrip"}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    {isFlipped ? flashcards[cardIndex].back : flashcards[cardIndex].front}
                  </h3>
                </div>

                <div className="text-center text-xs text-muted">
                  {isFlipped ? "Goed gedaan! Klik om terug te draaien" : "Denk na over het antwoord..."}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={cardIndex === 0}
                  className="px-4 py-2 rounded-xl border border-border bg-accent/40 hover:bg-accent disabled:opacity-40 text-xs font-bold text-foreground"
                >
                  Vorige
                </button>
                <span className="text-xs font-bold text-muted">
                  {cardIndex + 1} / {flashcards.length}
                </span>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                  }}
                  disabled={cardIndex === flashcards.length - 1}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white shadow-sm"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PLANNER TAB */}
      {activeTab === "planner" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Slimme Tussenuren Planner</h3>
              <p className="text-xs text-muted">
                Omni AI berekent de optimale leertijd op basis van je lesuitval en opdrachten
              </p>
            </div>
            <button
              onClick={generateStudyPlan}
              disabled={isPlannerLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPlannerLoading ? "animate-spin" : ""}`} />
              <span>Opnieuw Plannen</span>
            </button>
          </div>

          <div className="grid gap-3">
            {studyPlan.map((slot, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 border border-border flex items-start gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{slot.time}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent font-semibold text-muted">
                      {slot.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{slot.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIHubPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-muted">Omni AI laden...</div>}>
      <AIHubContent />
    </Suspense>
  );
}
