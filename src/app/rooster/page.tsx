"use client";

import React, { useState } from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  ExternalLink,
  Check,
} from "lucide-react";
import { createGoogleCalendarUrl } from "@/lib/calendar/ical";

export default function RoosterPage() {
  const { appointments, settings } = useOmniStore();
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [copiedFeed, setCopiedFeed] = useState(false);

  // Compute selected date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  const targetDateStr = targetDate.toISOString().split("T")[0];

  const daysOfWeek = [
    { label: "Ma", offset: getOffsetForWeekday(1) },
    { label: "Di", offset: getOffsetForWeekday(2) },
    { label: "Wo", offset: getOffsetForWeekday(3) },
    { label: "Do", offset: getOffsetForWeekday(4) },
    { label: "Vr", offset: getOffsetForWeekday(5) },
  ];

  function getOffsetForWeekday(targetWeekday: number): number {
    const today = new Date();
    const currentWeekday = today.getDay() || 7; // 1 (Mon) - 7 (Sun)
    return targetWeekday - currentWeekday;
  }

  // Filter appointments for the target day
  const dayAppointments = appointments
    .filter((a) => a.start.startsWith(targetDateStr))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  const copyWebcalLink = () => {
    const url = `${window.location.origin}/api/calendar/feed?demo=true`;
    navigator.clipboard.writeText(url);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Rooster
          </h1>
          <p className="text-xs sm:text-sm text-muted capitalize mt-1">
            {targetDate.toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Calendar Sync Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyWebcalLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-bold text-indigo-500 transition-all"
          >
            {copiedFeed ? <Check className="h-3.5 w-3.5" /> : <CalendarIcon className="h-3.5 w-3.5" />}
            <span>{copiedFeed ? "Feed Gekopieerd!" : "Abonneer in Agenda (iCal)"}</span>
          </button>
        </div>
      </div>

      {/* Weekday Switcher */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl border border-border bg-accent/40">
        <button
          onClick={() => setSelectedDayOffset((prev) => prev - 1)}
          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-accent transition-colors"
          title="Vorige dag"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 flex-1 justify-center max-w-md">
          {daysOfWeek.map((d) => {
            const isSelected = selectedDayOffset === d.offset;
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() + d.offset);
            const dayNum = dateObj.getDate();

            return (
              <button
                key={d.label}
                onClick={() => setSelectedDayOffset(d.offset)}
                className={`flex-1 py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? "bg-indigo-500 text-white font-bold shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider">{d.label}</span>
                <span className="text-sm font-extrabold">{dayNum}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedDayOffset((prev) => prev + 1)}
          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-accent transition-colors"
          title="Volgende dag"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Timetable List */}
      <div className="space-y-3">
        {dayAppointments.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-border space-y-2">
            <CalendarIcon className="h-10 w-10 text-muted mx-auto stroke-1" />
            <h3 className="font-bold text-foreground text-base">Geen lessen gepland</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Er staan geen afspraken of lessen in Magister voor deze dag. Geniet van je vrije tijd!
            </p>
          </div>
        ) : (
          dayAppointments.map((appt) => {
            const isCancelled = appt.status === 5;
            const isChanged = appt.status === 4;
            const isTest = appt.infoType === 2 || appt.infoType === 3 || appt.type === 8;
            const gCalUrl = createGoogleCalendarUrl(appt);

            return (
              <div
                key={appt.id}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  isCancelled
                    ? "border-red-500/40 bg-red-500/5 opacity-80"
                    : isTest
                    ? "border-pink-500/40 bg-pink-500/5"
                    : isChanged
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Period Badge & Details */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 flex-col items-center justify-center rounded-2xl font-black text-sm shrink-0 ${
                        isCancelled
                          ? "bg-red-500/10 text-red-500 line-through"
                          : isTest
                          ? "bg-pink-500/10 text-pink-500"
                          : "bg-indigo-500/10 text-indigo-500"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-muted">UUR</span>
                      <span>{appt.lesuurVan || "•"}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-lg font-bold ${
                            isCancelled ? "line-through text-muted" : "text-foreground"
                          }`}
                        >
                          {appt.omschrijving}
                        </h3>

                        {isCancelled && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-500">
                            UITVAL
                          </span>
                        )}

                        {isChanged && !isCancelled && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-500">
                            GEWIJZIGD
                          </span>
                        )}

                        {isTest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-500 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> TOETS
                          </span>
                        )}
                      </div>

                      {appt.inhoud && (
                        <p className="text-xs text-muted max-w-xl">{appt.inhoud}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          {formatTime(appt.start)} – {formatTime(appt.einde)}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-pink-500" />
                          {appt.lokatie || appt.lokalen?.[0]?.naam || "Geen lokaal"}
                        </span>

                        {appt.docenten?.[0] && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-emerald-500" />
                            {appt.docenten[0].naam || appt.docenten[0].docentcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:self-center">
                    <a
                      href={gCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border hover:bg-accent text-xs font-semibold text-muted hover:text-foreground transition-all"
                      title="Voeg toe aan Google Agenda"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden sm:inline">Google Cal</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
