"use client";

import React, { useState, useEffect } from "react";
import { Clock, MapPin, User, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { MagisterAppointment } from "@/lib/types/magister";

interface NextClassCardProps {
  appointments: MagisterAppointment[];
}

export function NextClassCard({ appointments }: NextClassCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter appointments for today
  const todayStr = now.toISOString().split("T")[0];
  const todayAppts = appointments
    .filter((a) => a.start.startsWith(todayStr))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Find currently ongoing or next class
  const ongoing = todayAppts.find((a) => {
    const s = new Date(a.start).getTime();
    const e = new Date(a.einde).getTime();
    const t = now.getTime();
    return t >= s && t <= e;
  });

  const nextUpcoming = todayAppts.find((a) => {
    const s = new Date(a.start).getTime();
    return s > now.getTime();
  });

  const activeAppt = ongoing || nextUpcoming;

  if (!activeAppt) {
    return (
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Status Vandaag
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Geen lessen meer vandaag 🎉</h3>
            <p className="text-sm text-muted">
              Je rooster is helemaal afgerond voor vandaag. Tijd om te ontspannen of alvast morgen voor te bereiden!
            </p>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = activeAppt.status === 5;
  const isChanged = activeAppt.status === 4;
  const isTest = activeAppt.infoType === 2 || activeAppt.infoType === 3 || activeAppt.type === 8;
  const startTime = new Date(activeAppt.start);
  const endTime = new Date(activeAppt.einde);

  const diffMs = startTime.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  let countdownText = "";
  if (ongoing) {
    const leftMins = Math.round((endTime.getTime() - now.getTime()) / 60000);
    countdownText = `Nu bezig · nog ${leftMins} min`;
  } else if (diffMins <= 0) {
    countdownText = "Begint zo direct";
  } else if (diffMins < 60) {
    countdownText = `Begint over ${diffMins} min`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    countdownText = `Begint over ${hours}u ${mins}m`;
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`glass-card rounded-2xl p-6 relative overflow-hidden border transition-all ${
        isCancelled
          ? "border-red-500/40 bg-red-500/5"
          : isTest
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 via-transparent to-pink-500/5"
      }`}
    >
      {/* Background glow subtle */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                ongoing
                  ? "bg-indigo-500 text-white animate-pulse"
                  : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {countdownText}
            </span>

            {isCancelled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                LES VERVALT (UITVAL)
              </span>
            )}

            {isChanged && !isCancelled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                Lokaal of tijd gewijzigd
              </span>
            )}

            {isTest && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-600 dark:text-pink-400">
                <Sparkles className="h-3.5 w-3.5" />
                TOETS
              </span>
            )}
          </div>

          {/* Subject Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              {activeAppt.omschrijving}
              {activeAppt.lesuurVan && (
                <span className="text-sm font-normal px-2 py-0.5 rounded bg-accent text-muted">
                  Uur {activeAppt.lesuurVan}
                </span>
              )}
            </h2>
            {activeAppt.inhoud && (
              <p className="text-sm text-muted mt-1 max-w-2xl">{activeAppt.inhoud}</p>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              {formatTime(startTime)} – {formatTime(endTime)}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-pink-500" />
              {activeAppt.lokatie || activeAppt.lokalen?.[0]?.naam || "Geen lokaal"}
            </span>

            {activeAppt.docenten?.[0] && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-500" />
                {activeAppt.docenten[0].naam || activeAppt.docenten[0].docentcode}
              </span>
            )}
          </div>
        </div>

        {/* Quick action button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Vak</span>
            <div className="text-base font-bold text-foreground">
              {activeAppt.vakken?.[0]?.naam || activeAppt.omschrijving}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
