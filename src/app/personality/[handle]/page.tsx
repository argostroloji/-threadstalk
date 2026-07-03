import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import CardBrand from "@/components/CardBrand";
import ColorCard from "@/components/ColorCard";
import ErrorPanel from "@/components/ErrorPanel";
import ShareActions from "@/components/ShareActions";
import TrendingHandles from "@/components/TrendingHandles";
import { getPersonalityResult } from "@/lib/personality";
import { isValidHandle, normalizeHandle } from "@/lib/threads";
import { DataError } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const handle = normalizeHandle(decodeURIComponent(params.handle));
  const title = `What's @${handle}'s Threads personality?`;
  const description =
    "AI read their Threads posts and found their personality archetype. Try yours!";
  const og = `/api/og?type=personality&handle=${encodeURIComponent(handle)}`;
  return {
    title,
    description,
    alternates: { canonical: `/personality/${handle}` },
    openGraph: { title, description, images: [og] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function PersonalityPage({
  params,
}: {
  params: { handle: string };
}) {
  const handle = normalizeHandle(decodeURIComponent(params.handle));
  if (!isValidHandle(handle)) {
    return (
      <ErrorPanel
        title="Invalid username"
        message="Threads usernames contain only letters, numbers, dots and underscores."
      />
    );
  }

  let result;
  try {
    result = await getPersonalityResult(handle);
  } catch (err) {
    const message =
      err instanceof DataError
        ? err.message
        : "The analysis isn't available right now, please try again.";
    return (
      <ErrorPanel
        title="Couldn't generate the analysis"
        message={message}
        retryHref={`/personality/${handle}`}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Shareable card */}
      <ColorCard cardId="personality-card">
        <p className="mb-1 text-center text-xs uppercase tracking-widest text-zinc-400">
          threadstalker · threads personality test
        </p>
        <p className="mb-4 text-center text-sm text-zinc-300">@{handle}</p>

        <h1 className="mb-4 text-center text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-hot to-neon bg-clip-text text-transparent">
            {result.archetype}
          </span>
        </h1>

        <p className="mb-6 text-center text-sm leading-relaxed text-zinc-300">
          {result.description}
        </p>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Evidence 🔍
          </p>
          {result.evidence.map((line, i) => (
            <div
              key={i}
              className="rounded-xl bg-black/30 px-4 py-3 text-sm text-zinc-300"
            >
              {line}
            </div>
          ))}
        </div>

        {/* Görselin altında belirgin site imzası */}
        <CardBrand />
      </ColorCard>

      {/* Eğlence amaçlı analiz notu — görselin dışında, sayfada görünür */}
      <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-zinc-500">
        This is an AI&apos;s just-for-fun read of @{handle}&apos;s last{" "}
        {result.postCount} public posts — not a scientific personality
        assessment.
      </p>

      <div className="mt-5 space-y-4">
        <ShareActions
          cardId="personality-card"
          shareText={`My Threads personality: ${result.archetype} 🔮 What's yours?`}
          fileName={`threadstalker-personality-${handle}`}
        />
        <p className="text-center text-sm text-zinc-400">
          <Link href={`/stalkers/${handle}`} className="text-neon underline">
            👀 See who&apos;s stalking @{handle} too
          </Link>
        </p>
      </div>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT} />

      <TrendingHandles mode="personality" exclude={handle} />
    </div>
  );
}
