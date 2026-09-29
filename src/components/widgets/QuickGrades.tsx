"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Award, TrendingUp } from "lucide-react";
import { MagisterGrade } from "@/lib/types/magister";

interface QuickGradesProps {
  grades: MagisterGrade[];
  blurGrades?: boolean;
}

export function QuickGrades({ grades, blurGrades }: QuickGradesProps) {
  // Calculate general average
  let totalSum = 0;
  let totalWeight = 0;
  for (const g of grades) {
    if (!isNaN(g.cijfer) && g.cijfer > 0) {
      totalSum += g.cijfer * g.weegfactor;
      totalWeight += g.weegfactor;
    }
  }
  const overallAvg = totalWeight > 0 ? (totalSum / totalWeight).toFixed(1) : "0.0";

  return (
    <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-foreground">Recente Cijfers</h3>
          <p className="text-xs text-muted">
            Algemeen gemiddelde:{" "}
            <span
              className={`font-extrabold text-foreground ${
                blurGrades ? "blur-sm select-none" : ""
              }`}
            >
              {overallAvg}
            </span>
          </p>
        </div>
        <Link
          href="/cijfers"
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 group"
        >
          Alle cijfers <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {grades.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">Nog geen cijfers ingevoerd.</p>
        ) : (
          grades.slice(0, 4).map((grd) => {
            const dateStr = new Date(grd.datumIngevoerd).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
            });

            const isPassed = grd.isVoldoende;

            return (
              <div
                key={grd.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-accent/30 hover:bg-accent/60 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{grd.vak.naam}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent font-medium text-muted">
                      {grd.weegfactor}x
                    </span>
                  </div>
                  <p className="text-[11px] text-muted truncate max-w-[200px]">{grd.omschrijving}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted">{dateStr}</span>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-black text-sm ${
                      blurGrades ? "blur-md select-none" : ""
                    } ${
                      isPassed
                        ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-500 dark:text-red-400"
                    }`}
                  >
                    {grd.cijferStr}
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
