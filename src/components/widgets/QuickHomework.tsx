"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, ArrowRight, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { MagisterHomework } from "@/lib/types/magister";

interface QuickHomeworkProps {
  homework: MagisterHomework[];
  onToggle: (id: number) => void;
}

export function QuickHomework({ homework, onToggle }: QuickHomeworkProps) {
  const pendingHw = homework.filter((h) => !h.voltooid);
  const completedCount = homework.filter((h) => h.voltooid).length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-foreground">Huiswerk & Toetsen</h3>
          <p className="text-xs text-muted">
            {pendingHw.length} openstaand · {completedCount} afgerond
          </p>
        </div>
        <Link
          href="/huiswerk"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group"
        >
          Alles bekijken <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {homework.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">Helemaal geen huiswerk! Lekker bezig 🎉</p>
        ) : (
          homework.slice(0, 4).map((hw) => {
            const dateStr = new Date(hw.deadline).toLocaleDateString("nl-NL", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={hw.id}
                onClick={() => onToggle(hw.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  hw.voltooid
                    ? "border-border bg-accent/20 opacity-60"
                    : hw.isToets
                    ? "border-pink-500/40 bg-pink-500/5 hover:border-pink-500/60"
                    : "border-border bg-accent/40 hover:bg-accent/70"
                }`}
              >
                <button
                  type="button"
                  className={`mt-0.5 transition-colors ${
                    hw.voltooid ? "text-emerald-500" : "text-muted hover:text-foreground"
                  }`}
                >
                  {hw.voltooid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        hw.voltooid ? "line-through text-muted" : "text-foreground"
                      }`}
                    >
                      {hw.vak}
                    </span>
                    {hw.isToets && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-500 flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> TOETS
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-0.5 truncate ${
                      hw.voltooid ? "line-through text-muted" : "text-muted"
                    }`}
                  >
                    {hw.titel || hw.omschrijving}
                  </p>
                </div>

                <span className="text-[10px] font-semibold text-muted whitespace-nowrap pt-0.5">
                  {dateStr}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
