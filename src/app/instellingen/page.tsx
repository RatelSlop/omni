"use client";

import React, { useState } from "react";
import { useOmniStore } from "@/lib/store/useOmniStore";
import {
  Settings,
  Palette,
  LayoutGrid,
  Rows3,
  Calendar,
  Sparkles,
  Shield,
  Copy,
  Check,
  Download,
  Key,
  School,
  ExternalLink,
} from "lucide-react";
import { generateICalFeed } from "@/lib/calendar/ical";

export default function InstellingenPage() {
  const {
    settings,
    updateSettings,
    session,
    saveSession,
    appointments,
    setSubjectColor,
    setSubjectName,
    openLoginModal,
  } = useOmniStore();

  const [copiedFeed, setCopiedFeed] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(settings.ai.geminiApiKey || "");
  const [saveStatus, setSaveStatus] = useState(false);

  const webcalUrl =
    typeof window !== "undefined"
      ? session?.isDemo
        ? `${window.location.origin}/api/calendar/feed?demo=true`
        : `${window.location.origin}/api/calendar/feed?token=${encodeURIComponent(session?.accessToken || "")}&tenant=${encodeURIComponent(session?.schoolUrl || "")}`
      : "https://omniweb.schoolnaam.nl/api/calendar/feed";

  const handleCopyWebcal = () => {
    navigator.clipboard.writeText(webcalUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  const handleDownloadIcs = () => {
    const icsData = generateICalFeed(appointments, "Omni Schoolrooster");
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "omni-schoolrooster.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ai: {
        ...settings.ai,
        geminiApiKey: customKeyInput.trim(),
        useCustomKey: !!customKeyInput.trim(),
      },
    });
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleResetToDemo = () => {
    saveSession({
      accessToken: "demo-token",
      expiresAt: Date.now() + 86400000,
      schoolUrl: "demo.magister.net",
      studentName: "Daan van der Meer",
      isDemo: true,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Instellingen
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Beheer je lay-out, thema's, agenda-koppelingen, privacy en AI-configuratie
        </p>
      </div>

      {/* 1. Layout & Vormgeving */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Vormgeving & Lay-out</h3>
            <p className="text-xs text-muted">Kies tussen de strakke Apple-stijl of het modulaire Bento-raster</p>
          </div>
        </div>

        {/* Layout Mode selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block">
            Dashboard Stijl
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => updateSettings({ layoutStyle: "linear" })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                settings.layoutStyle === "linear"
                  ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                  : "border-border bg-accent/30 hover:bg-accent/60"
              }`}
            >
              <div className="p-2 rounded-xl bg-background border border-border text-foreground">
                <Rows3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">Linear / Apple Sleek</h4>
                  {settings.layoutStyle === "linear" && (
                    <span className="text-[10px] font-bold text-indigo-500">Actief</span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Focus op rust, minimalistische kaarten en een lineaire flow met countdown widget bovenaan.
                </p>
              </div>
            </div>

            <div
              onClick={() => updateSettings({ layoutStyle: "bento" })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                settings.layoutStyle === "bento"
                  ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                  : "border-border bg-accent/30 hover:bg-accent/60"
              }`}
            >
              <div className="p-2 rounded-xl bg-background border border-border text-foreground">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">Notion / Bento Grid</h4>
                  {settings.layoutStyle === "bento" && (
                    <span className="text-[10px] font-bold text-indigo-500">Actief</span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Modulaire bento-boxes die je cijfergemiddelde, toetsen en taken direct compact groeperen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme mode */}
        <div className="space-y-3 pt-4 border-t border-border">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block">
            Kleurthema
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "light", label: "Licht" },
              { id: "dark", label: "Donker (Standaard)" },
              { id: "oled", label: "OLED Puur Zwart" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings({ theme: t.id as any })}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  settings.theme === t.id
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                    : "border-border bg-accent/40 text-foreground hover:bg-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Agenda & iCal Koppeling */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Agenda Koppeling (Google & Apple)</h3>
            <p className="text-xs text-muted">Synchroniseer je Magister-rooster live met je smartphone en laptop</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted uppercase tracking-wider block">
            Live Webcal / iCal Abonnementslink
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={webcalUrl}
              className="flex-1 rounded-xl border border-border bg-accent/40 px-4 py-2 text-xs font-mono text-muted select-all"
            />
            <button
              onClick={handleCopyWebcal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {copiedFeed ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedFeed ? "Gekopieerd!" : "Kopieer Link"}</span>
            </button>
            <button
              onClick={handleDownloadIcs}
              className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .ics</span>
            </button>
          </div>

          <div className="rounded-xl bg-accent/40 p-4 text-xs text-muted space-y-1.5">
            <div className="font-bold text-foreground">Hoe voeg je dit toe?</div>
            <p>
              • <strong>iPhone / Apple Agenda:</strong> Open Agenda → Agenda's (onderin) → Nieuwe agenda → Voeg agenda-abonnement toe → Plak deze link.
            </p>
            <p>
              • <strong>Google Agenda:</strong> Open Google Calendar in je browser → Klik op '+' naast "Andere agenda's" → "Via URL" → Plak deze link.
            </p>
          </div>
        </div>
      </div>

      {/* 3. AI Instellingen (Gemini 2.0 Flash) */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">AI Instellingen (Google Gemini)</h3>
            <p className="text-xs text-muted">Gebruik de gratis ingebouwde proxy of vul je eigen API-sleutel in</p>
          </div>
        </div>

        <form onSubmit={handleSaveAI} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
              Eigen Gemini API Sleutel (Optioneel / BYOK)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy... (Laat leeg om de server proxy te gebruiken)"
                className="flex-1 rounded-xl border border-border bg-accent/30 px-4 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                {saveStatus ? "Opgeslagen!" : "Opslaan"}
              </button>
            </div>
            <p className="text-[11px] text-muted mt-1.5">
              Gratis API-sleutels kunnen in 1 minuut worden gegenereerd via Google AI Studio.
            </p>
          </div>
        </form>
      </div>

      {/* 4. Magister Account & Privacy */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Magister Account & Privacy</h3>
            <p className="text-xs text-muted">Omni slaat 100% van je gegevens lokaal op je eigen apparaat op</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-accent/40">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  session?.isDemo ? "bg-amber-500" : "bg-emerald-500"
                } animate-pulse`}
              />
              <span className="font-bold text-sm text-foreground">
                {session?.isDemo ? "Demo Account Actief" : session?.studentName || "Live Magister Account"}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              {session?.isDemo
                ? "Je bekijkt nu realistische voorbeelddata (cijfers, rooster en lesuitval)."
                : `Gekoppeld aan school: ${session?.schoolUrl}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openLoginModal()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{session?.isDemo ? "⚡ Magister Koppelen" : "Ander Account Koppelen"}</span>
            </button>

            {!session?.isDemo && (
              <button
                onClick={handleResetToDemo}
                className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-accent text-xs font-semibold text-muted hover:text-foreground transition-all"
              >
                Wissel naar Demo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Custom Branding Info */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-3">
        <h3 className="font-bold text-base text-foreground">Grafisch Design & Logo's (RatelSlop Studios)</h3>
        <p className="text-xs text-muted leading-relaxed">
          Je kunt op elk moment je eigen grafische vormgeving, SVG-logo's en app-iconen toevoegen. Plaats simpelweg je bestanden in:
        </p>
        <code className="block rounded-xl bg-accent p-3 text-xs font-mono text-indigo-400">
          C:\RatelSlop Studios\omni\public\branding\
        </code>
        <p className="text-xs text-muted">
          De app laadt automatisch je `logo.svg` en `logo-icon.svg` over de hele applicatie, inclusief de PWA installatie op telefoons.
        </p>
      </div>
    </div>
  );
}
