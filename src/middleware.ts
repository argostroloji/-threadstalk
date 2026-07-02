import { NextRequest, NextResponse } from "next/server";

/**
 * Sonuç sayfaları için basit IP başına rate limit (ScrapeCreators kredisi
 * koruması). In-memory sliding window — Vercel'de her instance kendi
 * sayacını tutar, yani limit "en az bu kadar sıkı" bir caydırıcıdır;
 * kusursuz global sayaç gerekirse Upstash Redis'e taşınabilir.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

export function middleware(request: NextRequest) {
  // next/link prefetch'leri gerçek ziyaret değil — sayma
  if (
    request.headers.get("next-router-prefetch") !== null ||
    request.headers.get("purpose") === "prefetch"
  ) {
    return NextResponse.next();
  }

  const ip =
    request.ip ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse(
      "Too many requests — please wait a minute and try again.",
      {
        status: 429,
        headers: { "retry-after": "60", "content-type": "text/plain" },
      },
    );
  }

  recent.push(now);
  hits.set(ip, recent);

  // Kaba bellek temizliği: harita çok büyürse sıfırla
  if (hits.size > 5000) hits.clear();

  return NextResponse.next();
}

export const config = {
  matcher: ["/stalkers/:path*", "/personality/:path*"],
};
