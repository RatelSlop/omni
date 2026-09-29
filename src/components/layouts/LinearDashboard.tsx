"use client";

import React from "react";
import { MagisterAppointment, MagisterGrade, MagisterHomework } from "@/lib/types/magister";
import { NextClassCard } from "../widgets/NextClassCard";
import { QuickSchedule } from "../widgets/QuickSchedule";
import { QuickHomework } from "../widgets/QuickHomework";
import { QuickGrades } from "../widgets/QuickGrades";
import { GradeSimulator } from "../widgets/GradeSimulator";

interface LinearDashboardProps {
  appointments: MagisterAppointment[];
  grades: MagisterGrade[];
  homework: MagisterHomework[];
  blurGrades?: boolean;
  onToggleHomework: (id: number) => void;
}

export function LinearDashboard({
  appointments,
  grades,
  homework,
  blurGrades,
  onToggleHomework,
}: LinearDashboardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Hero Next Class Widget */}
      <NextClassCard appointments={appointments} />

      {/* 2. Dual Column: Schedule & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <QuickSchedule appointments={appointments} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <QuickHomework homework={homework} onToggle={onToggleHomework} />
          <QuickGrades grades={grades} blurGrades={blurGrades} />
        </div>
      </div>

      {/* 3. Simulator & AI Tools */}
      <div className="pt-2">
        <GradeSimulator grades={grades} blurGrades={blurGrades} />
      </div>
    </div>
  );
}
