import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return handleRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return handleRequest(req, 'PUT');
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req, 'PATCH');
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req, 'DELETE');
}

async function handleRequest(req: NextRequest, method: string) {
  if (!WORKER_API_BASE) {
    return NextResponse.json(
      { error: "WORKER_API_BASE not configured" },
      { status: 500 }
    );
  }

  // Extract the path from the URL
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/', '');
  
  // Build the target URL
  const targetUrl = new URL(`${WORKER_API_BASE}/api/${path}`);
  if (url.search) {
    targetUrl.search = url.search;
  }

  console.log(`[API PROXY] ${method} ${url.pathname} -> ${targetUrl.toString()}`);

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const init: RequestInit = {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method) ? undefined : await req.arrayBuffer(),
    redirect: "manual",
    cache: "no-store",
  };

  try {
    const upstream = await fetch(targetUrl.toString(), init as any);
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
  } catch (error: any) {
    console.error(`[API PROXY ERROR] ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
