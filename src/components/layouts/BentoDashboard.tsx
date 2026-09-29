"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Calendar, GraduationCap, CheckSquare, Zap, Clock, ArrowRight } from "lucide-react";
import { MagisterAppointment, MagisterGrade, MagisterHomework } from "@/lib/types/magister";
import { NextClassCard } from "../widgets/NextClassCard";
import { QuickSchedule } from "../widgets/QuickSchedule";
import { QuickHomework } from "../widgets/QuickHomework";
import { QuickGrades } from "../widgets/QuickGrades";
import { GradeSimulator } from "../widgets/GradeSimulator";

interface BentoDashboardProps {
  appointments: MagisterAppointment[];
  grades: MagisterGrade[];
  homework: MagisterHomework[];
  blurGrades?: boolean;
  onToggleHomework: (id: number) => void;
}

export function BentoDashboard({
  appointments,
  grades,
  homework,
  blurGrades,
  onToggleHomework,
}: BentoDashboardProps) {
  // Compute some quick bento stats
  const pendingHw = homework.filter((h) => !h.voltooid).length;
  const testsThisWeek = appointments.filter(
    (a) => a.infoType === 2 || a.infoType === 3 || a.type === 8
  ).length;

  let totalSum = 0;
  let totalWeight = 0;
  for (const g of grades) {
    if (!isNaN(g.cijfer) && g.cijfer > 0) {
      totalSum += g.cijfer * g.weegfactor;
      totalWeight += g.weegfactor;
    }
  }
  const avg = totalWeight > 0 ? (totalSum / totalWeight).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Bento: Next Class (Span 8 cols) */}
        <div className="md:col-span-8">
          <NextClassCard appointments={appointments} />
        </div>

        {/* Bento Quick Stat: Gemiddelde & Toetsen (Span 4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="glass-card flex-1 rounded-2xl p-5 border border-border flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" /> Gemiddelde
              </span>
              <div
                className={`text-3xl font-black text-foreground ${
                  blurGrades ? "blur-md select-none" : ""
                }`}
              >
                {avg}
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold">
                Op koers voor overgang
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-card flex-1 rounded-2xl p-5 border border-border flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" /> Toetsen Gepland
              </span>
              <div className="text-3xl font-black text-foreground">{testsThisWeek}</div>
              <span className="text-[11px] text-muted font-medium">Binnenkort op de planning</span>
            </div>
            <Link
              href="/ai"
              className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 hover:scale-105 transition-transform"
              title="Open AI studiehulp voor deze toetsen"
            >
              <Sparkles className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Bento Grid: Schedule + Homework & AI Prompt Tile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <QuickSchedule appointments={appointments} />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <QuickHomework homework={homework} onToggle={onToggleHomework} />
          {/* AI Banner Bento tile */}
          <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 max-w-sm">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-3 w-3" /> OMNI AI HULP
                </span>
                <h4 className="text-base font-bold text-foreground">
                  Heb je een tussenkracht of uitval?
                </h4>
                <p className="text-xs text-muted">
                  Laat Omni AI direct een leerschema genereren of flashcards maken van je volgende toets!
                </p>
              </div>
              <Link
                href="/ai"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 transition-all hover:scale-105"
              >
                Naar AI Hub <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: Grade Simulator & Quick Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <GradeSimulator grades={grades} blurGrades={blurGrades} />
        </div>
        <div className="lg:col-span-5">
          <QuickGrades grades={grades} blurGrades={blurGrades} />
        </div>
      </div>
    </div>
  );
}
