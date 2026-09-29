"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeMagisterCode } from "@/lib/magister/auth";
import { useOmniStore } from "@/lib/store/useOmniStore";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { saveSession } = useOmniStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(`Magister login fout: ${error}`);
      return;
    }

    const directToken = searchParams.get("token");
    const directSchool = searchParams.get("school");

    // Handle direct 1-click bookmarklet token
    if (directToken && directSchool) {
      const tenant = directSchool.includes(".") ? directSchool : `${directSchool}.magister.net`;
      fetch(`/api/magister/api/personen/me`, {
        headers: {
          Authorization: `Bearer ${directToken}`,
          "X-Magister-Tenant": tenant,
        },
      })
        .then(async (res) => {
          const profile = res.ok ? await res.json() : null;
          saveSession({
            accessToken: directToken,
            expiresAt: Date.now() + 86400000 * 7, // 7 days
            schoolUrl: tenant,
            studentName: profile?.Roepnaam ? `${profile.Roepnaam} ${profile.Achternaam || ""}` : "Magister Leerling",
            studentId: profile?.Id,
            isDemo: false,
          });
          setStatus("success");
          setTimeout(() => router.push("/"), 1200);
        })
        .catch(() => {
          saveSession({
            accessToken: directToken,
            expiresAt: Date.now() + 86400000 * 7,
            schoolUrl: tenant,
            studentName: "Magister Leerling",
            isDemo: false,
          });
          setStatus("success");
          setTimeout(() => router.push("/"), 1200);
        });
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("Geen token of autorisatiecode ontvangen van Magister.");
      return;
    }

    // Retrieve stored PKCE code verifier and school tenant from localStorage
    const codeVerifier = localStorage.getItem("omni_pkce_verifier");
    const schoolTenant = localStorage.getItem("omni_auth_school") || "school.magister.net";
    const redirectUri = `${window.location.origin}/auth/callback`;

    if (!codeVerifier) {
      setStatus("error");
      setErrorMessage("PKCE sessie verlopen. Probeer opnieuw in te loggen.");
      return;
    }

    exchangeMagisterCode(code, codeVerifier, redirectUri)
      .then(async (tokens) => {
        // Fetch student profile to get name and studentId
        try {
          const profileRes = await fetch(`/api/magister/api/personen/me`, {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
              "X-Magister-Tenant": schoolTenant,
            },
          });
          const profile = profileRes.ok ? await profileRes.json() : null;

          saveSession({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: Date.now() + tokens.expiresIn * 1000,
            schoolUrl: schoolTenant,
            studentName: profile?.Roepnaam ? `${profile.Roepnaam} ${profile.Achternaam || ""}` : "Magister Leerling",
            studentId: profile?.Id,
            isDemo: false,
          });

          setStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } catch (e) {
          // Still save with fallback name
          saveSession({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: Date.now() + tokens.expiresIn * 1000,
            schoolUrl: schoolTenant,
            studentName: "Magister Leerling",
            isDemo: false,
          });
          setStatus("success");
          setTimeout(() => router.push("/"), 1500);
        }
      })
      .catch((err) => {
        console.error("Token exchange error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Kon token niet uitwisselen met Magister.");
      });
  }, [searchParams, router, saveSession]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-border text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Inloggen bij Magister...</h2>
            <p className="text-xs text-muted">
              Je sessie wordt veilig geverifieerd. Een moment geduld alsjeblieft.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Succesvol ingelogd! 🎉</h2>
            <p className="text-xs text-muted">
              Je Magister-rooster en cijfers worden nu geladen in Omni.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Inloggen mislukt</h2>
            <p className="text-xs text-red-400">{errorMessage}</p>
            <button
              onClick={() => router.push("/instellingen")}
              className="mt-4 px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-foreground transition-all"
            >
              Terug naar instellingen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted">Verifiëren...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
