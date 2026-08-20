import { NextResponse } from "next/server";

const BACKEND_URL = "https://duediligence-agent.duckdns.org";

async function handleProxy(req, context) {
  try {
    const params = await context.params;
    const pathArray = params?.path || [];
    const path = pathArray.join("/");
    const searchParams = req.nextUrl.search || "";
    const targetUrl = `${BACKEND_URL}/api/${path}${searchParams}`;

    const headers = new Headers(req.headers);
    headers.set("host", "duediligence-agent.duckdns.org");

    const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Backend proxy error", details: err.message },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
