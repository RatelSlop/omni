import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { OmniProvider } from "@/components/providers/OmniProvider";

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Omni — Magister Companion",
  description: "De moderne, esthetische en slimme Magister companion van RatelSlop Studios.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Omni",
  },
  icons: {
    icon: "/branding/logo-icon.svg",
    apple: "/branding/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/branding/logo-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/branding/logo-icon.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-400">
        <OmniProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-16">{children}</main>
            <footer className="border-t border-border/60 py-6 text-center text-xs text-muted">
              <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-foreground">omni</span>
                  <span>·</span>
                  <span>Magister Companion</span>
                </div>
                <p>Ontwikkeld door RatelSlop Studios</p>
                <div className="flex items-center gap-4">
                  <span>Privacy-First & Lokaal</span>
                  <span>•</span>
                  <span className="text-indigo-500">omniweb.ratelslop.studio</span>
                </div>
              </div>
            </footer>
          </div>
        </OmniProvider>
      </body>
    </html>
  );
}
