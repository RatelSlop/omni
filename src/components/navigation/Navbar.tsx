"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  GraduationCap,
  CheckSquare,
  Sparkles,
  Settings,
  LayoutGrid,
  Rows3,
  Sun,
  Moon,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { useOmniStore } from "@/lib/store/useOmniStore";

export function Navbar() {
  const pathname = usePathname();
  const { settings, updateSettings, session, openLoginModal } = useOmniStore();

  const navItems = [
    { href: "/", label: "Vandaag", icon: Zap },
    { href: "/rooster", label: "Rooster", icon: Calendar },
    { href: "/cijfers", label: "Cijfers", icon: GraduationCap },
    { href: "/huiswerk", label: "Huiswerk", icon: CheckSquare },
    { href: "/ai", label: "AI Hub", icon: Sparkles },
    { href: "/instellingen", label: "Instellingen", icon: Settings },
  ];

  const cycleTheme = () => {
    if (settings.theme === "dark") updateSettings({ theme: "oled" });
    else if (settings.theme === "oled") updateSettings({ theme: "light" });
    else updateSettings({ theme: "dark" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Custom SVG logo from branding folder */}
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-sm transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
                <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                  Ω
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-foreground">omni</span>
                <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-500 dark:text-indigo-400">
                  STUDENT
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-muted hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.label === "AI Hub" && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/15 text-pink-500 dark:text-pink-400">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Tools: Style Switcher, Camouflage, Theme, Session Badge */}
        <div className="flex items-center gap-2">
          {/* Quick Privacy / Camouflage Button */}
          <button
            onClick={() => updateSettings({ hideGradesByDefault: !settings.hideGradesByDefault })}
            title={settings.hideGradesByDefault ? "Cijfers zichtbaar maken" : "Camouflage modus (cijfers blurren)"}
            className={`p-2 rounded-lg text-xs transition-colors ${
              settings.hideGradesByDefault
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "text-muted hover:text-foreground hover:bg-accent"
            }`}
          >
            {settings.hideGradesByDefault ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Layout Mode Toggle: Linear vs Bento */}
          <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5 bg-accent/50">
            <button
              onClick={() => updateSettings({ layoutStyle: "linear" })}
              title="Linear / Apple Sleek stijl"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                settings.layoutStyle === "linear"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Rows3 className="h-3.5 w-3.5" />
              <span>Linear</span>
            </button>
            <button
              onClick={() => updateSettings({ layoutStyle: "bento" })}
              title="Notion / Bento Grid stijl"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                settings.layoutStyle === "bento"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Bento</span>
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            title={`Thema wisselen (Huidig: ${settings.theme})`}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-accent transition-colors"
          >
            {settings.theme === "light" && <Sun className="h-4 w-4 text-amber-500" />}
            {settings.theme === "dark" && <Moon className="h-4 w-4 text-indigo-400" />}
            {settings.theme === "oled" && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-pink-400">
                <Moon className="h-4 w-4" /> OLED
              </span>
            )}
          </button>

          {/* Account status badge */}
          <button
            onClick={() => openLoginModal()}
            title="Klik om Magister-account te koppelen of beheren"
            className="flex items-center gap-1.5 pl-2 border-l border-border text-xs hover:opacity-80 transition-opacity"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                session?.isDemo ? "bg-amber-500" : "bg-emerald-500"
              } animate-pulse`}
            />
            <span className="font-semibold text-foreground">
              {session?.isDemo ? "Magister Koppelen" : session?.studentName || "Magister"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden border-t border-border flex items-center justify-around py-2 px-1 bg-background/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
