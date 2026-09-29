import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Magister-Tenant",
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(request, params.path);
}

async function handleProxy(request: NextRequest, pathSegments: string[]) {
  try {
    const fullPath = pathSegments.join("/");
    const search = request.nextUrl.search;

    let targetUrl: string;
    const isOAuth = pathSegments[0] === "oauth";

    if (isOAuth) {
      const endpoint = pathSegments[1] || "token";
      targetUrl = `https://accounts.magister.net/connect/${endpoint}${search}`;
    } else {
      const tenantHeader = request.headers.get("x-magister-tenant");
      if (!tenantHeader) {
        return NextResponse.json(
          { error: "Ontbrekende X-Magister-Tenant header (school domeinnaam vereist)" },
          { status: 400 }
        );
      }
      const cleanTenant = tenantHeader.replace(".magister.net", "").trim().toLowerCase();
      targetUrl = `https://${cleanTenant}.magister.net/${fullPath}${search}`;
    }

    const headers = new Headers();
    const authHeader = request.headers.get("authorization");
    if (authHeader) headers.set("Authorization", authHeader);
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const body = ["POST", "PUT", "PATCH"].includes(request.method) ? await request.text() : undefined;

    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const data = await proxyResponse.text();

    const responseHeaders = new Headers();
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Content-Type", proxyResponse.headers.get("content-type") || "application/json");

    return new NextResponse(data, {
      status: proxyResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Fout bij doorsturen naar Magister servers" }, { status: 502 });
  }
}
