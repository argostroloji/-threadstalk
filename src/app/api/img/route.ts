import { NextRequest } from "next/server";

/**
 * Avatar proxy'si: Instagram CDN görselleri CORS başlığı göndermediği için
 * html2canvas kartı PNG'ye çeviremez (tainted canvas). Görselleri kendi
 * origin'imizden geçirerek bu sorunu çözer.
 */

const ALLOWED_SUFFIXES = [".cdninstagram.com", ".fbcdn.net"];

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u");
  if (!raw) return new Response("missing u", { status: 400 });

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (
    url.protocol !== "https:" ||
    !ALLOWED_SUFFIXES.some((s) => url.hostname.endsWith(s))
  ) {
    return new Response("forbidden host", { status: 403 });
  }

  try {
    const upstream = await fetch(url.toString(), {
      // CDN URL'leri imzalı ve kısa ömürlü — Next cache'ine sokma
      cache: "no-store",
    });
    if (!upstream.ok || !upstream.body) {
      return new Response("upstream error", { status: 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
