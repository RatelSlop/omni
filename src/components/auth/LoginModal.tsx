"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  School,
  Shield,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useOmniStore } from "@/lib/store/useOmniStore";

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LoginModal({ isOpen: propIsOpen, onClose: propOnClose }: LoginModalProps = {}) {
  const {
    isLoginModalOpen,
    closeLoginModal,
    session,
    saveSession,
    reload,
  } = useOmniStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isLoginModalOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    closeLoginModal();
  };

  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"bookmarklet" | "token" | "demo">("bookmarklet");

  // Manual Token State
  const [manualToken, setManualToken] = useState("");
  const [tokenSchool, setTokenSchool] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [tokenSuccess, setTokenSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://omniweb.schoolnaam.nl";

  // Bookmarklet code to drag to bookmarks bar
  const bookmarkletCode = `javascript:(function(){try{var k=Object.keys(sessionStorage).find(function(x){return x.indexOf('oidc.user')!==-1;});var d=k?JSON.parse(sessionStorage.getItem(k)):null;var t=(d&&d.access_token)?d.access_token:null;if(!t){k=Object.keys(localStorage).find(function(x){return x.indexOf('oidc.user')!==-1;});d=k?JSON.parse(localStorage.getItem(k)):null;t=(d&&d.access_token)?d.access_token:null;}if(!t){alert('Open eerst Magister in dit tabblad en zorg dat je ingelogd bent!');return;}var s=window.location.hostname.replace('.magister.net','');window.location.href='${currentOrigin}/auth/callback?token='+encodeURIComponent(t)+'&school='+encodeURIComponent(s);}catch(e){alert('Fout bij uitlezen Magister: '+e.message);}})();`;

  // Console code snippet to copy with 1 click
  const consoleSnippet = `(function(){var k=Object.keys(sessionStorage).find(x=>x.includes('oidc.user'))||Object.keys(localStorage).find(x=>x.includes('oidc.user'));var d=JSON.parse(sessionStorage.getItem(k)||localStorage.getItem(k));console.log('--- KOPIEER DIT TOKEN ONDERIN: ---');console.log(d.access_token);copy(d.access_token);alert('Token automatisch naar je klembord gekopieerd! Plak het nu in Omni.');})();`;

  const handleCopyConsoleSnippet = () => {
    navigator.clipboard.writeText(consoleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
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
        handleClose();
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
    handleClose();
  };

  const handleDisconnect = () => {
    handleResetToDemo();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-border space-y-6 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted hover:text-foreground hover:bg-accent transition-colors"
          title="Sluiten (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <School className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Magister Koppelen</h2>
          </div>
          <p className="text-xs text-muted">
            Koppel direct je actuele schoolrooster, lesuitval, cijfers en huiswerk aan Omni.
          </p>
        </div>

        {/* Current Connection Status Box */}
        {session && !session.isDemo && (
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="font-bold text-emerald-400 block truncate">
                  {session.studentName}
                </span>
                <span className="text-[11px] text-muted truncate">
                  {session.schoolUrl}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => reload()}
                title="Gegevens verversen"
                className="p-1.5 rounded-lg bg-accent text-foreground hover:bg-accent/80 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDisconnect}
                title="Verbinding verbreken"
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-semibold transition-colors flex items-center gap-1 text-[11px]"
              >
                <LogOut className="h-3 w-3" />
                <span>Ontkoppelen</span>
              </button>
            </div>
          </div>
        )}

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
            ⚡ 1-Klik Koppelen
          </button>
          <button
            onClick={() => setTab("token")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === "token"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            🔑 Token / Handmatig
          </button>
          <button
            onClick={() => setTab("demo")}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === "demo"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            ✨ Demo Modus
          </button>
        </div>

        {/* TAB 1: 1-KLIK BLADWIJZER */}
        {tab === "bookmarklet" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Stap 1: Sleep deze knop naar je bladwijzerbalk
              </span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-1">
                <a
                  href={bookmarkletCode}
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Sleep deze knop met je muis naar je favorieten-/bladwijzerbalk bovenaan je browser!");
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>⚡ Koppel aan Omni</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyBookmarklet}
                  className="px-3 py-2 rounded-xl border border-border bg-background/80 hover:bg-accent text-xs font-semibold text-muted hover:text-foreground transition-all flex items-center gap-1.5"
                  title="Of kopieer de URL van de knop"
                >
                  {copiedBookmarklet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedBookmarklet ? "Gekopieerd!" : "Kopieer Link"}</span>
                </button>
              </div>
              <p className="text-[11px] text-muted text-center">
                Zie je geen bladwijzerbalk? Druk op <kbd className="px-1.5 py-0.5 rounded bg-accent border border-border text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-accent border border-border text-[10px] font-mono">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-accent border border-border text-[10px] font-mono">B</kbd> in Chrome/Edge/Opera (of <kbd className="px-1.5 py-0.5 rounded bg-accent border border-border text-[10px] font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-accent border border-border text-[10px] font-mono">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-accent border border-border text-[10px] font-mono">B</kbd> op Mac).
              </p>
            </div>

            <div className="space-y-2 text-xs text-muted leading-relaxed">
              <span className="font-bold text-foreground block">Stap 2: Klik erop in Magister</span>
              <p>
                1. Open in een ander tabblad je normale school Magister (waar je al ingelogd bent).
              </p>
              <p>
                2. Klik in je bladwijzerbalk op <strong>⚡ Koppel aan Omni</strong>.
              </p>
              <p>
                3. Klaar! Omni leest veilig je actieve sessie uit en stuurt je direct terug naar Omni met al je echte cijfers en actuele rooster!
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted pt-2 border-t border-border">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>100% veilig & lokaal: je inloggegevens blijven enkel in je eigen browser opgeslagen.</span>
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
                  placeholder="bijv: calvijn, pierson of singelland"
                  className="w-full rounded-xl border border-border bg-accent/30 px-4 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted pointer-events-none">
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
                <span className="font-bold text-foreground">Snelste manier: via Console (F12)</span>
                <button
                  type="button"
                  onClick={handleCopyConsoleSnippet}
                  className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 font-bold"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? "Gekopieerd!" : "Kopieer Snippet"}</span>
                </button>
              </div>
              <p>
                Druk in Magister op <kbd className="px-1 py-0.5 rounded bg-background border border-border font-mono text-[10px]">F12</kbd> → Tabblad <strong>Console</strong> → Plak deze snippet en druk op Enter. Je token wordt automatisch naar je klembord gekopieerd!
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
              {session?.isDemo ? "Herlaad Demo Data" : "Schakel Demo Modus In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
