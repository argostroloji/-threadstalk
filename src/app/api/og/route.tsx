import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Sosyal paylaşım önizleme görseli (satori/next-og).
 * Sonuç verisini yeniden hesaplamaz — hızlı ve maliyetsiz kalması için
 * yalnızca handle + özellik başlığından oluşan bir teaser üretir.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = (searchParams.get("handle") ?? "").slice(0, 30);
  const type = searchParams.get("type") === "personality" ? "personality" : "stalkers";

  const title =
    type === "personality" ? "Threads Personality Test" : "Who's Stalking You?";
  const emoji = type === "personality" ? "🔮" : "👀";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0b12 0%, #1d1030 60%, #2b1024 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, marginBottom: 12 }}>
          {emoji}
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, marginBottom: 16 }}>
          {title}
        </div>
        {handle ? (
          <div style={{ display: "flex", fontSize: 40, color: "#c084fc", marginBottom: 24 }}>
            {`@${handle}`}
          </div>
        ) : null}
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>
          threadstalker — tap to see the result
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
