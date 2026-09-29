"use client";

import React, { useState } from "react";
import {
  School,
  Key,
  Shield,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Bookmark,
  Copy,
  Check,
} from "lucide-react";
import { useOmniStore } from "@/lib/store/useOmniStore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { saveSession, reload } = useOmniStore();
  const [tab, setTab] = useState<"bookmarklet" | "token" | "demo">("bookmarklet");

  // Manual Token State
  const [manualToken, setManualToken] = useState("");
  const [tokenSchool, setTokenSchool] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [tokenSuccess, setTokenSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  // Bookmarklet code to drag to bookmarks bar
  const bookmarkletCode = `javascript:(function(){try{var k=Object.keys(sessionStorage).find(function(x){return x.indexOf('oidc.user')!==-1;});var d=k?JSON.parse(sessionStorage.getItem(k)):null;var t=(d&&d.access_token)?d.access_token:null;if(!t){k=Object.keys(localStorage).find(function(x){return x.indexOf('oidc.user')!==-1;});d=k?JSON.parse(localStorage.getItem(k)):null;t=(d&&d.access_token)?d.access_token:null;}if(!t){alert('Open eerst Magister in dit tabblad en zorg dat je ingelogd bent!');return;}var s=window.location.hostname.replace('.magister.net','');window.location.href='${currentOrigin}/auth/callback?token='+encodeURIComponent(t)+'&school='+encodeURIComponent(s);}catch(e){alert('Fout bij uitlezen Magister: '+e.message);}})();`;

  // Console code snippet to copy with 1 click
  const consoleSnippet = `(function(){var k=Object.keys(sessionStorage).find(x=>x.includes('oidc.user'))||Object.keys(localStorage).find(x=>x.includes('oidc.user'));var d=JSON.parse(sessionStorage.getItem(k)||localStorage.getItem(k));console.log('--- KOPIEER DIT TOKEN ONDERIN: ---');console.log(d.access_token);copy(d.access_token);alert('Token automatisch naar je klembord gekopieerd! Plak het nu in Omni.');})();`;

  const handleCopyConsoleSnippet = () => {
    navigator.clipboard.writeText(consoleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError("");
    setTokenSuccess(false);

    const token = manualToken.trim().replace(/^Bearer\s+/i, "");
    const school = tokenSchool.trim().replace(".magister.net", "").toLowerCase();

    if (!token || !school) {
      setTokenError("Vul zowel je schoolnaam als je token in.");
      return;
    }

    setIsValidatingToken(true);
    try {
      const res = await fetch(`/api/magister/api/personen/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Magister-Tenant": `${school}.magister.net`,
        },
      });

      if (!res.ok) {
        throw new Error(
          `Magister weigert dit token (status ${res.status}). Controleer of het token niet verlopen is.`
        );
      }

      const profile = await res.json();
      saveSession({
        accessToken: token,
        expiresAt: Date.now() + 86400000 * 7,
        schoolUrl: `${school}.magister.net`,
        studentName: profile?.Roepnaam
          ? `${profile.Roepnaam} ${profile.Achternaam || ""}`
          : "Magister Leerling",
        studentId: profile?.Id,
        isDemo: false,
      });

      setTokenSuccess(true);
      setTimeout(() => {
        reload();
        onClose();
      }, 1000);
    } catch (err: any) {
      setTokenError(err.message || "Kon token niet verifiëren.");
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleResetToDemo = () => {
    saveSession({
      accessToken: "demo-token",
      expiresAt: Date.now() + 86400000,
      schoolUrl: "demo.magister.net",
      studentName: "Daan van der Meer",
      isDemo: true,
    });
    reload();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 py-8 bg-background/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-border space-y-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <School className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Magister Koppelen</h2>
          </div>
          <p className="text-xs text-muted">
            Koppel direct je actuele schoolrooster, uitval, cijfers en huiswerk aan Omni.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl border border-border p-1 bg-accent/40 text-xs font-bold">
          <button
            onClick={() => setTab("bookmarklet")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === "bookmarklet"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            ⚡ 1-Klik Bladwijzer
          </button>
          <button
            onClick={() => setTab("token")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === "token"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Direct Token (F12)
          </button>
          <button
            onClick={() => setTab("demo")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === "demo"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Demo Modus
          </button>
        </div>

        {/* TAB 1: 1-KLIK BLADWIJZER */}
        {tab === "bookmarklet" && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Stap 1: Sleep deze knop naar je favorietenbalk
              </span>
              <div className="flex justify-center py-1">
                <a
                  href={bookmarkletCode}
                  onClick={(e) => {
                    // Prevent navigation if accidentally clicked here
                    e.preventDefault();
                    alert("Sleep deze knop met je muis naar je bladwijzerbalk (of voeg hem toe als favoriet)!");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>⚡ Koppel aan Omni</span>
                </a>
              </div>
              <p className="text-[11px] text-muted text-center">
                (Zie je geen bladwijzerbalk? Druk op <code>Ctrl+Shift+B</code> in Chrome/Edge/Opera)
              </p>
            </div>

            <div className="space-y-2 text-xs text-muted leading-relaxed">
              <span className="font-bold text-foreground block">Stap 2: Klik erop in Magister</span>
              <p>
                1. Open je normale school Magister-tabblad (waar je al bent ingelogd).
              </p>
              <p>
                2. Klik in je bladwijzerbalk op <strong>⚡ Koppel aan Omni</strong>.
              </p>
              <p>
                3. Klaar! Omni leest veilig je actieve sessie uit en stuurt je direct terug naar Omni met al je echte cijfers en rooster!
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted pt-2 border-t border-border">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>100% veilig en lokaal: je inloggegevens blijven alleen in je eigen browser.</span>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL TOKEN IMPORT */}
        {tab === "token" && (
          <form onSubmit={handleSaveManualToken} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                Jouw schoolnaam (Magister URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tokenSchool}
                  onChange={(e) => setTokenSchool(e.target.value)}
                  placeholder="bijv: calvijn of pierson"
                  className="w-full rounded-xl border border-border bg-accent/30 px-4 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2 text-xs text-muted pointer-events-none">
                  .magister.net
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider block">
                Magister Bearer Token
              </label>
              <textarea
                rows={3}
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Plak hier je Bearer eyJhbGciOi... token"
                className="w-full rounded-xl border border-border bg-accent/30 p-3 text-xs font-mono text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500"
              />
            </div>

            {tokenError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{tokenError}</span>
              </div>
            )}

            {tokenSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Verbinding gelukt! Rooster & cijfers worden geladen...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidatingToken || !manualToken.trim() || !tokenSchool.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isValidatingToken ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifiëren bij Magister...</span>
                </>
              ) : (
                <span>Verifieer & Koppel Account</span>
              )}
            </button>

            {/* Quick 1-click console copy helper */}
            <div className="rounded-2xl border border-border bg-accent/40 p-3.5 text-[11px] text-muted space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Of kopieer via Console (F12)</span>
                <button
                  type="button"
                  onClick={handleCopyConsoleSnippet}
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold"
                >
                  {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? "Gekopieerd!" : "Kopieer Snippet"}</span>
                </button>
              </div>
              <p>
                Druk in Magister op <code>F12</code> → Tabblad <strong>Console</strong> → Plak deze snippet en druk op Enter. Je token wordt direct automatisch naar je klembord gekopieerd!
              </p>
            </div>
          </form>
        )}

        {/* TAB 3: DEMO */}
        {tab === "demo" && (
          <div className="space-y-4 text-center py-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Demo Modus Inschakelen</h3>
              <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
                Wil je Omni testen zonder echte inloggegevens? In de demo modus heb je een compleet gevuld rooster met lesuitval, gewijzigde lokalen, toetsen, gewogen cijfers en een actieve AI-assistent.
              </p>
            </div>
            <button
              onClick={handleResetToDemo}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              Start Demo Modus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
