"use client";

import { create } from "zustand";
import {
  MagisterAppointment,
  MagisterGrade,
  MagisterHomework,
  MagisterSession,
} from "../types/magister";
import { OmniSettings } from "../types/settings";
import {
  getMockAppointments,
  getMockGrades,
  getMockHomework,
} from "../magister/mockData";
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

const defaultDemoSession: MagisterSession = {
  accessToken: "demo-token",
  expiresAt: Date.now() + 86400000,
  schoolUrl: "demo.magister.net",
  studentName: "Daan van der Meer",
  isDemo: true,
};

interface OmniStoreState {
  mounted: boolean;
  isLoginModalOpen: boolean;
  session: MagisterSession | null;
  settings: OmniSettings;
  appointments: MagisterAppointment[];
  grades: MagisterGrade[];
  homework: MagisterHomework[];
  isLoading: boolean;

  // Actions
  initialize: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setLoginModalOpen: (open: boolean) => void;
  updateSettings: (newSettings: Partial<OmniSettings>) => void;
  saveSession: (newSession: MagisterSession | null) => void;
  toggleHomework: (id: number) => void;
  setSubjectColor: (code: string, color: string) => void;
  setSubjectName: (code: string, customName: string) => void;
  reload: () => Promise<void>;
}

export const useOmniStore = create<OmniStoreState>((set, get) => ({
  mounted: false,
  isLoginModalOpen: false,
  session: null,
  settings: defaultSettings,
  appointments: [],
  grades: [],
  homework: [],
  isLoading: true,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),

  initialize: () => {
    if (typeof window === "undefined") return;

    let loadedSettings = defaultSettings;
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        loadedSettings = { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (e) {
      console.error("Fout bij laden settings:", e);
    }

    let loadedSession: MagisterSession = defaultDemoSession;
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        loadedSession = JSON.parse(storedSession);
      } else {
        localStorage.setItem(SESSION_KEY, JSON.stringify(defaultDemoSession));
      }
    } catch (e) {
      console.error("Fout bij laden session:", e);
    }

    // Apply theme to HTML tag
    const root = document.documentElement;
    root.classList.remove("dark", "oled");
    if (loadedSettings.theme === "dark" || loadedSettings.theme === "oled") {
      root.classList.add("dark");
    }
    if (loadedSettings.theme === "oled") {
      root.classList.add("oled");
    }

    set({
      mounted: true,
      settings: loadedSettings,
      session: loadedSession,
    });

    get().reload();
  },

  reload: async () => {
    set({ isLoading: true });
    const { session } = get();

    const client = new MagisterClient({
      accessToken: session?.accessToken,
      schoolTenant: session?.schoolUrl,
      isDemo: session?.isDemo ?? true,
    });

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

      let hwStatuses: Record<number, boolean> = {};
      try {
        hwStatuses = JSON.parse(localStorage.getItem(HOMEWORK_STATUS_KEY) || "{}");
      } catch (e) {
        console.error("Fout bij ophalen huiswerk statuses:", e);
      }

      const mergedHw = hw.map((h) => ({
        ...h,
        voltooid: hwStatuses[h.id] ?? h.voltooid,
      }));

      set({
        appointments: appts,
        grades: grds,
        homework: mergedHw,
        isLoading: false,
      });
    } catch (err) {
      console.error("Error loading Magister data:", err);
      set({
        appointments: getMockAppointments(),
        grades: getMockGrades(),
        homework: getMockHomework(),
        isLoading: false,
      });
    }
  },

  updateSettings: (newSettings: Partial<OmniSettings>) => {
    const current = get().settings;
    const updated = { ...current, ...newSettings };
    set({ settings: updated });

    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

      // Update theme classes
      if (newSettings.theme) {
        const root = document.documentElement;
        root.classList.remove("dark", "oled");
        if (newSettings.theme === "dark" || newSettings.theme === "oled") {
          root.classList.add("dark");
        }
        if (newSettings.theme === "oled") {
          root.classList.add("oled");
        }
      }
    }
  },

  saveSession: (newSession: MagisterSession | null) => {
    set({ session: newSession });
    if (typeof window !== "undefined") {
      if (newSession) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    get().reload();
  },

  toggleHomework: (id: number) => {
    const currentHw = get().homework;
    const next = currentHw.map((h) =>
      h.id === id ? { ...h, voltooid: !h.voltooid } : h
    );
    set({ homework: next });

    if (typeof window !== "undefined") {
      try {
        const hwStatuses = JSON.parse(
          localStorage.getItem(HOMEWORK_STATUS_KEY) || "{}"
        );
        const target = next.find((h) => h.id === id);
        if (target) {
          hwStatuses[id] = target.voltooid;
          localStorage.setItem(HOMEWORK_STATUS_KEY, JSON.stringify(hwStatuses));
        }
      } catch (e) {
        console.error("Fout bij opslaan huiswerk status:", e);
      }
    }
  },

  setSubjectColor: (code: string, color: string) => {
    const { settings, updateSettings } = get();
    const current = settings.subjectCustomizations[code] || { color };
    updateSettings({
      subjectCustomizations: {
        ...settings.subjectCustomizations,
        [code]: { ...current, color },
      },
    });
  },

  setSubjectName: (code: string, customName: string) => {
    const { settings, updateSettings } = get();
    const current = settings.subjectCustomizations[code] || {
      color: "#6366f1",
    };
    updateSettings({
      subjectCustomizations: {
        ...settings.subjectCustomizations,
        [code]: { ...current, customName },
      },
    });
  },
}));
