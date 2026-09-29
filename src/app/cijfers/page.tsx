"use client";

import React, { useState } from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import {
  GraduationCap,
  Calculator,
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { GradeSimulator } from "@/components/widgets/GradeSimulator";

export default function CijfersPage() {
  const { grades, settings, updateSettings } = useOmniStore();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const blur = settings.hideGradesByDefault;

  // Aggregate stats
  let totalSum = 0;
  let totalWeight = 0;
  let passedCount = 0;
  let failedCount = 0;

  // Group by subject
  const subjectMap = new Map<string, { name: string; sum: number; weight: number; count: number; grades: typeof grades }>();

  for (const g of grades) {
    if (!isNaN(g.cijfer) && g.cijfer > 0) {
      totalSum += g.cijfer * g.weegfactor;
      totalWeight += g.weegfactor;
      if (g.cijfer >= 5.5) passedCount++;
      else failedCount++;

      const sub = subjectMap.get(g.vak.code) || {
        name: g.vak.naam,
        sum: 0,
        weight: 0,
        count: 0,
        grades: [],
      };
      sub.sum += g.cijfer * g.weegfactor;
      sub.weight += g.weegfactor;
      sub.count++;
      sub.grades.push(g);
      subjectMap.set(g.vak.code, sub);
    }
  }

  const overallAvg = totalWeight > 0 ? (totalSum / totalWeight).toFixed(1) : "0.0";

  const subjectsList = Array.from(subjectMap.entries()).map(([code, val]) => ({
    code,
    name: val.name,
    avg: val.weight > 0 ? (val.sum / val.weight).toFixed(1) : "0.0",
    count: val.count,
    grades: val.grades,
  }));

  const filteredGrades =
    selectedFilter === "all"
      ? grades
      : grades.filter((g) => g.vak.code === selectedFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Cijfers & Voortgang
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Volledig gewogen cijferoverzicht met wat-moet-ik-halen simulator
          </p>
        </div>

        <button
          onClick={() => updateSettings({ hideGradesByDefault: !blur })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            blur
              ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
              : "border-border bg-accent/40 text-muted hover:text-foreground"
          }`}
        >
          {blur ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{blur ? "Camouflage Actief" : "Camouflage Modus"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Algemeen Gemiddelde</span>
            <GraduationCap className="h-4 w-4 text-indigo-500" />
          </div>
          <div
            className={`text-3xl font-black text-foreground ${blur ? "blur-md select-none" : ""}`}
          >
            {overallAvg}
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">
            Overgangsnorm ruimschoots gehaald
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Totaal Cijfers</span>
            <Award className="h-4 w-4 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-foreground">{grades.length}</div>
          <p className="text-[11px] text-muted font-medium mt-1">
            Ingevoerd in deze periode
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Voldoendes</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-500">{passedCount}</div>
          <p className="text-[11px] text-emerald-500/80 font-medium mt-1">
            {((passedCount / (grades.length || 1)) * 100).toFixed(0)}% van je toetsen
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Onvoldoendes</span>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-500">{failedCount}</div>
          <p className="text-[11px] text-red-500/80 font-medium mt-1">
            Aandachtspunt voor de simulator
          </p>
        </div>
      </div>

      {/* Embedded Grade Simulator */}
      <GradeSimulator grades={grades} blurGrades={blur} />

      {/* Subject summary badges */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Gemiddelden per vak</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {subjectsList.map((sub) => {
            const isPassing = parseFloat(sub.avg) >= 5.5;
            return (
              <button
                key={sub.code}
                onClick={() => setSelectedFilter(selectedFilter === sub.code ? "all" : sub.code)}
                className={`glass-card p-4 rounded-2xl border text-left transition-all ${
                  selectedFilter === sub.code
                    ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                    : "border-border hover:bg-accent/40"
                }`}
              >
                <div className="text-xs font-semibold text-muted truncate">{sub.name}</div>
                <div
                  className={`text-2xl font-black mt-1 ${
                    blur ? "blur-md select-none" : ""
                  } ${isPassing ? "text-emerald-500" : "text-red-500"}`}
                >
                  {sub.avg}
                </div>
                <div className="text-[10px] text-muted mt-0.5">{sub.count} cijfers</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Alle Cijfers</h2>
          {selectedFilter !== "all" && (
            <button
              onClick={() => setSelectedFilter("all")}
              className="text-xs font-semibold text-indigo-500 hover:underline"
            >
              Toon alle vakken
            </button>
          )}
        </div>

        <div className="grid gap-2.5">
          {filteredGrades.map((g) => {
            const isPassing = g.isVoldoende;
            const dateStr = new Date(g.datumIngevoerd).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={g.id}
                className="glass-card rounded-2xl p-4 border border-border flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{g.vak.naam}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent font-semibold text-muted">
                      Weging {g.weegfactor}x
                    </span>
                    <span className="text-[10px] text-muted">{g.type}</span>
                  </div>
                  <p className="text-xs text-muted">{g.omschrijving}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted hidden sm:inline">{dateStr}</span>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-base shadow-sm ${
                      blur ? "blur-md select-none" : ""
                    } ${
                      isPassing
                        ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-500 dark:text-red-400"
                    }`}
                  >
                    {g.cijferStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
