"use client";

import React, { useState } from "react";
import { Calculator, Target, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { MagisterGrade } from "@/lib/types/magister";

interface GradeSimulatorProps {
  grades: MagisterGrade[];
  blurGrades?: boolean;
}

export function GradeSimulator({ grades, blurGrades }: GradeSimulatorProps) {
  // Extract unique subjects
  const subjectMap = new Map<string, { name: string; grades: MagisterGrade[] }>();
  for (const g of grades) {
    if (!subjectMap.has(g.vak.code)) {
      subjectMap.set(g.vak.code, { name: g.vak.naam, grades: [] });
    }
    subjectMap.get(g.vak.code)!.grades.push(g);
  }

  const subjects = Array.from(subjectMap.entries()).map(([code, data]) => {
    let sum = 0;
    let totalWeight = 0;
    for (const g of data.grades) {
      if (!isNaN(g.cijfer) && g.cijfer > 0) {
        sum += g.cijfer * g.weegfactor;
        totalWeight += g.weegfactor;
      }
    }
    const currentAvg = totalWeight > 0 ? sum / totalWeight : 0;
    return {
      code,
      name: data.name,
      currentAvg,
      totalWeight,
      sum,
      count: data.grades.length,
    };
  });

  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(
    subjects[0]?.code || "wisB"
  );
  const [targetAverage, setTargetAverage] = useState<number>(6.0);
  const [testWeight, setTestWeight] = useState<number>(2);

  const activeSubject = subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];

  // Calculation
  let neededGrade = 0;
  let isPossible = true;
  let isGuaranteed = false;

  if (activeSubject && activeSubject.totalWeight > 0) {
    // Formula: needed = (Target * (OldWeight + NewWeight) - CurrentSum) / NewWeight
    const required =
      (targetAverage * (activeSubject.totalWeight + testWeight) - activeSubject.sum) / testWeight;
    neededGrade = parseFloat(required.toFixed(1));

    if (neededGrade <= 1.0) {
      isGuaranteed = true;
      neededGrade = 1.0;
    } else if (neededGrade > 10.0) {
      isPossible = false;
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Wat Moet Ik Halen?</h3>
            <p className="text-xs text-muted">Simuleer je volgende toets met weegfactoren</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent text-muted">
          AI Simulator
        </span>
      </div>

      {/* Subject selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Kies een vak
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subjects.map((sub) => {
            const isSelected = sub.code === selectedSubjectCode;
            return (
              <button
                key={sub.code}
                onClick={() => setSelectedSubjectCode(sub.code)}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10 font-bold"
                    : "border-border bg-accent/30 hover:bg-accent/60"
                }`}
              >
                <span className="text-foreground truncate">{sub.name}</span>
                <span className={`text-[11px] mt-1 font-semibold ${blurGrades ? "blur-sm" : ""}`}>
                  Staat: <strong className={sub.currentAvg >= 5.5 ? "text-emerald-500" : "text-red-500"}>
                    {sub.currentAvg.toFixed(1)}
                  </strong>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSubject && (
        <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-muted">Streefgemiddelde</span>
                <span className="font-bold text-foreground text-sm">{targetAverage.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="5.5"
                max="9.0"
                step="0.1"
                value={targetAverage}
                onChange={(e) => setTargetAverage(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>5.5 (Voldoende)</span>
                <span>7.0 (Ruim)</span>
                <span>8.0+ (Lof)</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted block mb-1.5 font-medium">
                Weging volgende toets
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((w) => (
                  <button
                    key={w}
                    onClick={() => setTestWeight(w)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      testWeight === w
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                        : "border-border hover:bg-accent text-foreground"
                    }`}
                  >
                    {w}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-xl border border-border bg-accent/40 p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted mb-1">
              Benodigd cijfer
            </span>

            {isGuaranteed ? (
              <div className="space-y-1">
                <div className="text-3xl font-extrabold text-emerald-500">1.0 🎉</div>
                <p className="text-xs text-muted max-w-[200px]">
                  Je staat er zó goed voor dat zelfs met een 1.0 je gemiddelde boven de {targetAverage.toFixed(1)} blijft!
                </p>
              </div>
            ) : !isPossible ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-500 flex items-center justify-center gap-1">
                  <AlertCircle className="h-5 w-5" /> &gt; 10.0
                </div>
                <p className="text-xs text-muted max-w-[220px]">
                  Een {targetAverage.toFixed(1)} is met één toets van {testWeight}x wiskundig niet meer haalbaar. Focus op een {Math.min(targetAverage - 0.5, 6.0).toFixed(1)}.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div
                  className={`text-4xl font-black tracking-tight ${
                    neededGrade <= 6.0
                      ? "text-emerald-500"
                      : neededGrade <= 7.5
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                >
                  {neededGrade.toFixed(1)}
                </div>
                <p className="text-xs text-muted">
                  Haal minimaal een <strong>{neededGrade.toFixed(1)}</strong> (met {testWeight}x weging) voor een <strong>{targetAverage.toFixed(1)}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
