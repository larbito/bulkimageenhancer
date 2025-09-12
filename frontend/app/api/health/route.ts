import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function GET(req: NextRequest) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({
      status: "error",
      message: "WORKER_API_BASE environment variable not set",
      config: { workerApiBase: WORKER_API_BASE || "not set" }
    }, { status: 500 });
  }

  try {
    const response = await fetch(`${WORKER_API_BASE}/health`, {
      method: 'GET',
      headers: { 'User-Agent': 'Coloring-Studio-Frontend' }
    });
    
    if (!response.ok) {
      return NextResponse.json({
        status: "error",
        message: `Worker API returned ${response.status}`,
        config: { workerApiBase: WORKER_API_BASE, workerStatus: response.status }
      }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({
      status: "ok",
      message: "Worker API is healthy",
      config: { workerApiBase: WORKER_API_BASE, workerResponse: data }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error", 
      message: `Failed to connect to worker: ${error.message}`,
      config: { workerApiBase: WORKER_API_BASE }
    }, { status: 502 });
  }
}
