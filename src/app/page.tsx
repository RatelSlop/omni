"use client";

import React from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import { LinearDashboard } from "@/components/layouts/LinearDashboard";
import { BentoDashboard } from "@/components/layouts/BentoDashboard";
import { RefreshCw, Sparkles } from "lucide-react";

export default function HomePage() {
  const {
    mounted,
    settings,
    appointments,
    grades,
    homework,
    isLoading,
    toggleHomework,
    reload,
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
