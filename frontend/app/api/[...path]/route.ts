import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

async function forward(req: NextRequest, path: string) {
  if (!WORKER_API_BASE) {
    return NextResponse.json(
      { error: "WORKER_API_BASE not configured" },
      { status: 500 }
    );
  }

  const url = new URL(WORKER_API_BASE.replace(/\/$/, "") + "/" + path.replace(/^\//, ""));
  const original = new URL(req.url);
  if (original.search) url.search = original.search;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", original.host);
  headers.set("x-forwarded-proto", original.protocol.replace(":", ""));

  const init: RequestInit = {
    method: req.method,
    headers,
    // For GET/HEAD no body allowed
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: "manual",
    cache: "no-store",
  };

  const upstream = await fetch(url.toString(), init as any);
  const resHeaders = new Headers(upstream.headers);
  // Vercel disallows setting certain headers; strip hop-by-hop
  [
    "connection",
    "transfer-encoding",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "upgrade",
  ].forEach((h) => resHeaders.delete(h));
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, { status: upstream.status, headers: resHeaders });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params?.path || []).join("/");
  return forward(req, path);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params?.path || []).join("/");
  return forward(req, path);
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params?.path || []).join("/");
  return forward(req, path);
}

export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params?.path || []).join("/");
  return forward(req, path);
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params?.path || []).join("/");
  return forward(req, path);
}


