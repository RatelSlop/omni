"use client";

import { useState, useEffect } from "react";
import { MagisterAppointment, MagisterGrade, MagisterHomework, MagisterSession } from "../types/magister";
import { OmniSettings } from "../types/settings";
import { getMockAppointments, getMockGrades, getMockHomework } from "../magister/mockData";
import { MagisterClient } from "../magister/client";

const SETTINGS_KEY = "omni_settings_v1";
const SESSION_KEY = "omni_session_v1";
const HOMEWORK_STATUS_KEY = "omni_hw_status_v1";

const defaultSettings: OmniSettings = {
  layoutStyle: "linear",
  theme: "dark",
  subjectCustomizations: {
    wisB: { color: "#3b82f6", customName: "Wiskunde B" },
    netl: { color: "#ef4444", customName: "Nederlands" },
    ges: { color: "#f59e0b", customName: "Geschiedenis" },
    nat: { color: "#8b5cf6", customName: "Natuurkunde" },
    entl: { color: "#10b981", customName: "Engels" },
    schk: { color: "#ec4899", customName: "Scheikunde" },
    bio: { color: "#14b8a6", customName: "Biologie" },
  },
  ai: {
    useCustomKey: false,
    preferredTone: "motiverend",
  },
  notificationsEnabled: true,
  hideGradesByDefault: false,
  defaultCalendarView: "day",
};

export function useOmniStore() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<MagisterSession | null>(null);
  const [settings, setSettings] = useState<OmniSettings>(defaultSettings);
  const [appointments, setAppointments] = useState<MagisterAppointment[]>([]);
  const [grades, setGrades] = useState<MagisterGrade[]>([]);
  const [homework, setHomework] = useState<MagisterHomework[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }

      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
      } else {
        // Default to demo session so the app is instantly rich and interactive!
        const demoSession: MagisterSession = {
          accessToken: "demo-token",
          expiresAt: Date.now() + 86400000,
          schoolUrl: "demo.magister.net",
          studentName: "Daan van der Meer",
          isDemo: true,
        };
        setSession(demoSession);
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
    setMounted(true);
  }, []);

  // Sync data when session changes
  useEffect(() => {
    if (!mounted) return;
    loadData();
  }, [mounted, session]);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("dark", "oled");

    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "oled") {
      root.classList.add("dark", "oled");
    }
  }, [mounted, settings.theme]);

  const loadData = async () => {
    setIsLoading(true);
    const client = new MagisterClient({
      accessToken: session?.accessToken,
      schoolTenant: session?.schoolUrl,
      isDemo: session?.isDemo ?? true,
    });

    const now = new Date();
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const future = new Date();
    future.setDate(future.getDate() + 14);

    try {
      const [appts, grds, hw] = await Promise.all([
        client.getAppointments(past, future),
        client.getGrades(),
        client.getHomework(),
      ]);

      // Merge saved completed statuses
      const hwStatuses = JSON.parse(localStorage.getItem(HOMEWORK_STATUS_KEY) || "{}");
      const mergedHw = hw.map((h) => ({
        ...h,
        voltooid: hwStatuses[h.id] ?? h.voltooid,
      }));

      setAppointments(appts);
      setGrades(grds);
      setHomework(mergedHw);
    } catch (err) {
      console.error("Error loading data:", err);
      setAppointments(getMockAppointments());
      setGrades(getMockGrades());
      setHomework(getMockHomework());
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<OmniSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
  };

  const saveSession = (newSession: MagisterSession | null) => {
    setSession(newSession);
    if (typeof window !== "undefined") {
      if (newSession) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  };

  const toggleHomework = (id: number) => {
    setHomework((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, voltooid: !h.voltooid } : h));
      const hwStatuses = JSON.parse(localStorage.getItem(HOMEWORK_STATUS_KEY) || "{}");
      const target = next.find((h) => h.id === id);
      if (target) {
        hwStatuses[id] = target.voltooid;
        localStorage.setItem(HOMEWORK_STATUS_KEY, JSON.stringify(hwStatuses));
      }
      return next;
    });
  };

  const setSubjectColor = (code: string, color: string) => {
    const current = settings.subjectCustomizations[code] || { color };
    updateSettings({
      subjectCustomizations: {
        ...settings.subjectCustomizations,
        [code]: { ...current, color },
      },
    });
  };

  const setSubjectName = (code: string, customName: string) => {
    const current = settings.subjectCustomizations[code] || { color: "#6366f1" };
    updateSettings({
      subjectCustomizations: {
        ...settings.subjectCustomizations,
        [code]: { ...current, customName },
      },
    });
  };

  return {
    mounted,
    session,
    settings,
    appointments,
    grades,
    homework,
    isLoading,
    updateSettings,
    saveSession,
    toggleHomework,
    setSubjectColor,
    setSubjectName,
    reload: loadData,
  };
}
