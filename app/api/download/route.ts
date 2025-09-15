import { NextRequest, NextResponse } from "next/server";

const WORKER_API_BASE = process.env.WORKER_API_BASE || "";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const pageId = url.searchParams.get('pageId');
  const format = url.searchParams.get('format') || 'zip'; // 'zip' or 'single'

  if (!projectId) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    let downloadUrl = `${WORKER_API_BASE}/api/download/${projectId}`;
    
    if (format === 'single' && pageId) {
      downloadUrl += `/${pageId}`;
    } else {
      downloadUrl += '/zip';
    }

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Accept': format === 'zip' ? 'application/zip' : 'image/png'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Download failed: ${response.status}` }, { status: response.status });
    }

    // Stream the file response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || 
      `attachment; filename="${projectId}${format === 'zip' ? '.zip' : `_page_${pageId}.png`}"`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', contentDisposition);

    return new NextResponse(response.body, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error('Error downloading:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!WORKER_API_BASE) {
    return NextResponse.json({ error: "WORKER_API_BASE not configured" }, { status: 500 });
  }

  try {
    const { projectId, pageIds, format } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const response = await fetch(`${WORKER_API_BASE}/api/prepare-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        pageIds: pageIds || 'all',
        format: format || 'zip',
        includeMetadata: true
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Download preparation failed: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error preparing download:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
