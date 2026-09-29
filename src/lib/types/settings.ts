export type LayoutStyle = "linear" | "bento";
export type ThemeMode = "system" | "light" | "dark" | "oled";

export interface SubjectCustomization {
  customName?: string;
  color: string; // hex
}

export interface AISettings {
  useCustomKey: boolean;
  geminiApiKey?: string;
  preferredTone: "motiverend" | "kort_en_bondig" | "grondig";
}

export interface OmniSettings {
  layoutStyle: LayoutStyle;
  theme: ThemeMode;
  subjectCustomizations: Record<string, SubjectCustomization>;
  ai: AISettings;
  notificationsEnabled: boolean;
  hideGradesByDefault: boolean; // Privacy / camouflage mode
  defaultCalendarView: "day" | "week";
}
