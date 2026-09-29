"use client";

import React from "react";
import Link from "next/link";
import { Clock, MapPin, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { MagisterAppointment } from "@/lib/types/magister";

interface QuickScheduleProps {
  appointments: MagisterAppointment[];
}

export function QuickSchedule({ appointments }: QuickScheduleProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppts = appointments
    .filter((a) => a.start.startsWith(todayStr))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-foreground">Rooster Vandaag</h3>
          <p className="text-xs text-muted">
            {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link
          href="/rooster"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group"
        >
          Volledig rooster <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {todayAppts.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">Geen lessen gepland voor vandaag.</p>
        ) : (
          todayAppts.map((appt) => {
            const isCancelled = appt.status === 5;
            const isChanged = appt.status === 4;
            const isTest = appt.infoType === 2 || appt.infoType === 3 || appt.type === 8;

            return (
              <div
                key={appt.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCancelled
                    ? "border-red-500/30 bg-red-500/5 text-muted opacity-80"
                    : isTest
                    ? "border-pink-500/40 bg-pink-500/5"
                    : "border-border bg-accent/30 hover:bg-accent/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Period number badge */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                      isCancelled
                        ? "bg-red-500/10 text-red-500 line-through"
                        : "bg-indigo-500/10 text-indigo-500"
                    }`}
                  >
                    {appt.lesuurVan || "•"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isCancelled ? "line-through text-muted" : "text-foreground"
                        }`}
                      >
                        {appt.omschrijving}
                      </span>
                      {isCancelled && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-500">
                          UITVAL
                        </span>
                      )}
                      {isTest && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-500">
                          TOETS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTime(appt.start)} – {formatTime(appt.einde)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {appt.lokatie || appt.lokalen?.[0]?.naam || "Geen lokaal"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-muted">
                    {appt.docenten?.[0]?.docentcode || ""}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
