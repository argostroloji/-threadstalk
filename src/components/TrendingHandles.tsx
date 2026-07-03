import Link from "next/link";
import { getTrendingHandles } from "@/lib/searchlog";

const EXAMPLES = ["zuck", "mosseri", "netflix", "nasa", "spotify"];

/**
 * Keşif döngüsü: başka handle'lara hızlı geçiş.
 * `live` verildiğinde son 24 saatte en çok arananları gösterir (≥2 arama
 * şartıyla); veri yetersizse veya landing gibi statik sayfalarda sabit
 * örnek listeye düşer. (Landing'e `live` VERME — statik prerender'ı bozar.)
 */
export default async function TrendingHandles({
  mode,
  exclude,
  live = false,
}: {
  mode: "stalkers" | "personality";
  exclude?: string;
  live?: boolean;
}) {
  let items: string[] = [];
  if (live) {
    items = await getTrendingHandles(exclude, 4);
  }
  if (items.length < 2) {
    items = EXAMPLES.filter((h) => h !== exclude).slice(0, 4);
  }

  return (
    <div className="mt-10 text-center">
      <p className="mb-3 text-sm text-zinc-400">
        Check out other people&apos;s results:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((h) => (
          <Link
            key={h}
            href={`/${mode}/${h}`}
            className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300 transition hover:border-neon/40 hover:text-neon"
          >
            @{h}
          </Link>
        ))}
      </div>
    </div>
  );
}
