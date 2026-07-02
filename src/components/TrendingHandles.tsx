import Link from "next/link";

const EXAMPLES = ["zuck", "mosseri", "netflix", "nasa", "spotify"];

/** Keşif döngüsü: sonuç sayfasının altında başka handle'lara hızlı geçiş. */
export default function TrendingHandles({
  mode,
  exclude,
}: {
  mode: "stalkers" | "personality";
  exclude?: string;
}) {
  const items = EXAMPLES.filter((h) => h !== exclude).slice(0, 4);
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
