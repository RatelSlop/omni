import { NextRequest, NextResponse } from "next/server";
import https from "https";

class CookieJar {
  cookies = new Map<string, string>();

  store(setCookieHeader?: string | string[]) {
    if (!setCookieHeader) return;
    const list = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const c of list) {
      const parts = c.split(";")[0].split("=");
      const name = parts[0].trim();
      const value = parts.slice(1).join("=").trim();
      this.cookies.set(name, value);
    }
  }

  getCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

function httpsRequest(
  urlStr: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    jar?: CookieJar;
  } = {}
): Promise<{ statusCode: number; headers: Record<string, any>; data: string; location?: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const headers = { ...options.headers };
    if (options.jar) {
      const ch = options.jar.getCookieHeader();
      if (ch) headers["Cookie"] = ch;
    }

    const req = https.request(
      url,
      {
        method: options.method || "GET",
        headers,
      },
      (res) => {
        if (options.jar && res.headers["set-cookie"]) {
          options.jar.store(res.headers["set-cookie"]);
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 200,
            headers: res.headers,
            data,
            location: res.headers.location,
          });
        });
      }
    );

    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const { school, username, password } = await req.json();

    if (!school || !username || !password) {
      return NextResponse.json(
        { error: "Vul je school, gebruikersnaam en wachtwoord in." },
        { status: 400 }
      );
    }

    const cleanSchool = school.replace(".magister.net", "").trim().toLowerCase();
    const schoolServer = `${cleanSchool}.magister.net`;
    const magisterServer = "accounts.magister.net";
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    const jar = new CookieJar();
    const clientId = `M6-${schoolServer}`;
    const redirectUri = `https://${schoolServer}/oidc/redirect_callback.html`;
    const authUrl = `https://${magisterServer}/connect/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=id_token%20token&scope=openid%20profile&state=11111111111111111111111111111111&nonce=11111111111111111111111111111111&acr_values=tenant%3A${encodeURIComponent(
      schoolServer
    )}`;

    // Step 1: Connect Authorize (303 -> /Account/Login)
    const step1 = await httpsRequest(authUrl, {
      jar,
      headers: { "User-Agent": userAgent },
    });

    if (!step1.location) {
      return NextResponse.json(
        { error: "Kon inlogsessie niet initialiseren bij Magister. Bestaat de schoolnaam wel?" },
        { status: 400 }
      );
    }

    let nextUrl = step1.location;
    if (!nextUrl.startsWith("http")) nextUrl = `https://${magisterServer}${nextUrl}`;

    // Step 2: /Account/Login (302 -> /account/login?sessionId=...)
    const step2 = await httpsRequest(nextUrl, {
      jar,
      headers: { "User-Agent": userAgent },
    });

    let step3Url = step2.location || nextUrl;
    if (!step3Url.startsWith("http")) step3Url = `https://${magisterServer}${step3Url}`;

    // Step 3: Fetch login HTML & account-*.js
    const step3 = await httpsRequest(step3Url, {
      jar,
      headers: { "User-Agent": userAgent },
    });

    const urlObj = new URL(step3Url);
    const sessionId = urlObj.searchParams.get("sessionId");
    const returnUrl = urlObj.searchParams.get("returnUrl") || urlObj.searchParams.get("ReturnUrl");

    if (!sessionId || !returnUrl) {
      return NextResponse.json(
        { error: "Magister sessie-ID kon niet worden gegenereerd." },
        { status: 500 }
      );
    }

    const jsMatch = step3.data.match(/js\/account-[a-zA-Z0-9_-]+\.js/);
    if (!jsMatch) {
      return NextResponse.json(
        { error: "Magister auth-script niet gevonden op schoolportal." },
        { status: 500 }
      );
    }

    const jsRes = await httpsRequest(`https://${magisterServer}/${jsMatch[0]}`, { jar });
    const codeMatch = jsRes.data.match(/\(\w=\["([0-9a-f",]+?)"\],\["([0-9",]+)"\]\.map/);

    let authCode = "00000000000000000000000000000000";
    if (codeMatch) {
      const codes = codeMatch[1].split('","');
      const idxes = codeMatch[2].split('","').map(Number);
      authCode = idxes.map((i) => codes[i]).join("");
    }

    const xsrfToken = jar.cookies.get("XSRF-TOKEN") || "";

    const payload: Record<string, any> = {
      sessionId,
      returnUrl,
      authCode,
    };

    // Step 4: Challenges current
    await httpsRequest(`https://${magisterServer}/challenges/current`, {
      method: "POST",
      jar,
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken,
        "User-Agent": userAgent,
        Referer: step3Url,
      },
      body: JSON.stringify(payload),
    });

    // Step 5: Challenges username
    payload.username = username.trim();
    const userRes = await httpsRequest(`https://${magisterServer}/challenges/username`, {
      method: "POST",
      jar,
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken,
        "User-Agent": userAgent,
        Referer: step3Url,
      },
      body: JSON.stringify(payload),
    });

    const userJson = JSON.parse(userRes.data || "{}");
    if (userJson.error) {
      return NextResponse.json(
        { error: "Onbekende gebruikersnaam of leerlingnummer bij deze school." },
        { status: 400 }
      );
    }

    // Step 6: Challenges password
    payload.password = password;
    const passRes = await httpsRequest(`https://${magisterServer}/challenges/password`, {
      method: "POST",
      jar,
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": xsrfToken,
        "User-Agent": userAgent,
        Referer: step3Url,
      },
      body: JSON.stringify(payload),
    });

    let passJson = JSON.parse(passRes.data || "{}");

    // Handle FIDO promo skip if prompted
    if (passJson.action === "pairfidopromo") {
      payload.reason = "non-user-verifying-platform-authenticator";
      payload.userVerifyingPlatformAuthenticator = null;
      const skipRes = await httpsRequest(`https://${magisterServer}/challenges/skip-pair-fido-promo`, {
        method: "POST",
        jar,
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": xsrfToken,
          "User-Agent": userAgent,
          Referer: step3Url,
        },
        body: JSON.stringify(payload),
      });
      passJson = JSON.parse(skipRes.data || "{}");
    }

    if (passJson.action === "soft-token" || passJson.action === "softtoken") {
      return NextResponse.json(
        { error: "Tweestapsverificatie (2FA) is actief op dit account. Gebruik de 1-Klik Bladwijzer of Token methode." },
        { status: 400 }
      );
    }

    if (passJson.error || !passJson.redirectURL) {
      return NextResponse.json(
        { error: "Onjuist wachtwoord. Controleer je gegevens en probeer opnieuw." },
        { status: 401 }
      );
    }

    // Step 7: Follow redirect to get hash token fragment
    const redirectUrl = `https://${magisterServer}${passJson.redirectURL}`;
    const callbackRes = await httpsRequest(redirectUrl, {
      jar,
      headers: { "User-Agent": userAgent },
    });

    const finalLocation = callbackRes.location || redirectUrl;
    let accessToken = "";

    if (finalLocation.includes("#")) {
      const hashPart = finalLocation.split("#")[1];
      const params = new URLSearchParams(hashPart);
      accessToken = params.get("access_token") || "";
    }

    // If not in location header, try checking Set-Cookie or callback page body
    if (!accessToken) {
      const match = callbackRes.data.match(/access_token=([a-zA-Z0-9._-]+)/);
      if (match) {
        accessToken = match[1];
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Kon token niet extraheren uit Magister respons." },
        { status: 500 }
      );
    }

    // Step 8: Fetch user profile to get student name
    let studentName = "Magister Leerling";
    let studentId: number | undefined;

    try {
      const profileRes = await httpsRequest(`https://${schoolServer}/api/personen/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": userAgent,
        },
      });

      if (profileRes.statusCode === 200) {
        const profile = JSON.parse(profileRes.data || "{}");
        if (profile.Roepnaam) {
          studentName = `${profile.Roepnaam} ${profile.Achternaam || ""}`.trim();
        }
        studentId = profile.Id;
      }
    } catch (e) {
      console.error("Fout bij ophalen profiel:", e);
    }

    return NextResponse.json({
      success: true,
      accessToken,
      expiresAt: Date.now() + 86400000 * 7,
      schoolUrl: schoolServer,
      studentName,
      studentId,
    });
  } catch (error: any) {
    console.error("Direct Magister login error:", error);
    return NextResponse.json(
      { error: error.message || "Interne fout bij inloggen bij Magister." },
      { status: 500 }
    );
  }
}
