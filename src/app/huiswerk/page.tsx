"use client";

import React, { useState } from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function HuiswerkPage() {
  const { homework, toggleHomework } = useOmniStore();
  const [filter, setFilter] = useState<"all" | "pending" | "tests" | "completed">("pending");

  const pending = homework.filter((h) => !h.voltooid);
  const completed = homework.filter((h) => h.voltooid);

  const handleToggle = (id: number) => {
    const item = homework.find((h) => h.id === id);
    if (item && !item.voltooid) {
      // Fire confetti when completing a task
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    toggleHomework(id);
  };

  const filteredList = homework.filter((h) => {
    if (filter === "pending") return !h.voltooid;
    if (filter === "completed") return h.voltooid;
    if (filter === "tests") return h.isToets;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Huiswerk & Toetsen
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Overzicht van al je opdrachten, maakwerk en voorbereidingen
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border bg-accent/40 text-xs font-semibold">
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "pending"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Openstaand ({pending.length})
          </button>
          <button
            onClick={() => setFilter("tests")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "tests"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Toetsen
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "completed"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Afgerond ({completed.length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === "all"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Alles
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-border space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-foreground text-base">Geen taken in deze weergave</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Alles is afgerond of er is geen huiswerk opgegeven voor dit filter!
            </p>
          </div>
        ) : (
          filteredList.map((hw) => {
            const dateStr = new Date(hw.deadline).toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });

            return (
              <div
                key={hw.id}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  hw.voltooid
                    ? "border-border bg-accent/20 opacity-60"
                    : hw.isToets
                    ? "border-pink-500/40 bg-pink-500/5 hover:border-pink-500/60"
                    : "border-border hover:bg-accent/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggle(hw.id)}
                      className={`mt-1 transition-colors ${
                        hw.voltooid ? "text-emerald-500" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {hw.voltooid ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground">{hw.vak}</span>
                        {hw.isToets && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-500 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> TOETS
                          </span>
                        )}
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Deadline: {dateStr}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-semibold ${
                          hw.voltooid ? "line-through text-muted" : "text-foreground"
                        }`}
                      >
                        {hw.titel}
                      </h4>

                      <p className="text-xs text-muted max-w-2xl leading-relaxed">
                        {hw.omschrijving}
                      </p>
                    </div>
                  </div>

                  {/* AI Quick action */}
                  <Link
                    href={`/ai?topic=${encodeURIComponent(`${hw.vak}: ${hw.titel} - ${hw.omschrijving}`)}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-bold text-indigo-500 shrink-0 transition-all hover:scale-105"
                    title="Genereer flashcards en studiehulp met AI"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">AI Hulp</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
