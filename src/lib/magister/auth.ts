// Magister OIDC PKCE Authentication Engine

export function generateRandomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return verifier; // fallback for non-crypto environments
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Digest = btoa(binary);
  return base64Digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function buildMagisterLoginUrl(schoolTenant: string, codeChallenge: string, state: string, redirectUri: string): string {
  const cleanTenant = schoolTenant.replace(".magister.net", "").trim().toLowerCase();
  const authEndpoint = "https://accounts.magister.net/connect/authorize";
  
  const params = new URLSearchParams({
    client_id: "M6LOVO", // Magister 6 Mobile App Client ID
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email offline_access magister.mobile magister.ecs",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    acr_values: `tenant:${cleanTenant}.magister.net`,
    prompt: "select_account",
  });

  return `${authEndpoint}?${params.toString()}`;
}

export async function exchangeMagisterCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  proxyBase = "/api/magister"
): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
  const response = await fetch(`${proxyBase}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: "M6LOVO",
      grant_type: "authorization_code",
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Magister token uitwisseling mislukt: ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
  };
}
