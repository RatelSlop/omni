"use client";

import React from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import { LinearDashboard } from "@/components/layouts/LinearDashboard";
import { BentoDashboard } from "@/components/layouts/BentoDashboard";
import { RefreshCw, Sparkles } from "lucide-react";

export default function HomePage() {
  const {
    mounted,
    session,
    settings,
    appointments,
    grades,
    homework,
    isLoading,
    toggleHomework,
    reload,
    openLoginModal,
  } = useOmniStore();

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-44 w-full rounded-2xl bg-accent/40 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-accent/30 animate-pulse" />
          <div className="h-64 rounded-2xl bg-accent/30 animate-pulse" />
        </div>
      </div>
    );
  }

  const todayDateStr = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground capitalize">
              Vandaag
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
              <Sparkles className="h-3 w-3" /> Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted capitalize mt-1">{todayDateStr}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => reload()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-accent/40 hover:bg-accent text-xs font-semibold text-muted hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Synchroniseren..." : "Vernieuwen"}</span>
          </button>
        </div>
      </div>

      {/* Demo Banner with direct Koppel Knop */}
      {session?.isDemo && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <p className="text-xs text-foreground/90">
              <span className="font-bold">Je bekijkt nu de interactieve demo van Omni.</span> Koppel je eigen Magister schoolaccount om je actuele rooster, lesuitval en cijfers in te laden.
            </p>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>⚡ Magister Koppelen</span>
          </button>
        </div>
      )}

      {/* Main Switchable Dashboard: Linear vs Bento */}
      {settings.layoutStyle === "bento" ? (
        <BentoDashboard
          appointments={appointments}
          grades={grades}
          homework={homework}
          blurGrades={settings.hideGradesByDefault}
          onToggleHomework={toggleHomework}
        />
      ) : (
        <LinearDashboard
          appointments={appointments}
          grades={grades}
          homework={homework}
          blurGrades={settings.hideGradesByDefault}
          onToggleHomework={toggleHomework}
        />
      )}
    </div>
  );
}
