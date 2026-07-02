import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import CardBrand from "@/components/CardBrand";
import Circle from "@/components/Circle";
import ColorCard from "@/components/ColorCard";
import ErrorPanel from "@/components/ErrorPanel";
import ShareActions from "@/components/ShareActions";
import TrendingHandles from "@/components/TrendingHandles";
import { getStalkerResult } from "@/lib/stalkers";
import { isValidHandle, normalizeHandle } from "@/lib/threads";
import { DataError } from "@/lib/types";

export const dynamic = "force-dynamic";

function disclaimerText(handle: string): string {
  return `This shows the people who publicly interact with @${handle} the most (mentions/reposts/replies). We can't show real profile visits — Threads doesn't share that data with anyone.`;
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const handle = normalizeHandle(decodeURIComponent(params.handle));
  const title = `Who's stalking @${handle}?`;
  const description =
    "See your Threads interaction circle. Get your own result too!";
  const og = `/api/og?type=stalkers&handle=${encodeURIComponent(handle)}`;
  return {
    title,
    description,
    alternates: { canonical: `/stalkers/${handle}` },
    openGraph: { title, description, images: [og] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function StalkersPage({
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
    result = await getStalkerResult(handle);
  } catch (err) {
    const message =
      err instanceof DataError
        ? err.message
        : "Couldn't fetch the data, please try again.";
    return (
      <ErrorPanel
        title="Couldn't generate the result"
        message={message}
        retryHref={`/stalkers/${handle}`}
      />
    );
  }

  const top3 = result.entries.slice(0, 3);

  return (
    <div className="mx-auto max-w-md">
      <ColorCard cardId="stalker-card">
        <h1 className="mb-1 text-center text-2xl font-extrabold">
          Who&apos;s{" "}
          <span className="bg-gradient-to-r from-neon to-hot bg-clip-text text-transparent">
            Stalking You?
          </span>
        </h1>
        <p className="mb-4 text-center text-sm text-zinc-400">@{handle}</p>

        {result.entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            Not enough public interactions in the last 90 days. Post a bit more
            and try again! 🌱
          </p>
        ) : (
          <>
            <Circle
              profile={result.profile}
              handle={handle}
              entries={result.entries}
            />
            <p className="mt-4 text-center text-sm text-zinc-300">
              {top3.map((e, i) => (
                <span key={e.username}>
                  {i > 0 && " · "}
                  <span className="font-semibold">@{e.username}</span>
                </span>
              ))}
            </p>
          </>
        )}

        {/* Görselin altında belirgin site imzası */}
        <CardBrand />
      </ColorCard>

      {/* Dürüstlük ibaresi — görselin dışında, sayfada görünür */}
      <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-zinc-500">
        {disclaimerText(handle)}
      </p>

      <div className="mt-5 space-y-4">
        <ShareActions
          cardId="stalker-card"
          shareText={`My Threads interaction circle 👀 Check yours:`}
          fileName={`threadstalk-${handle}`}
        />
        <p className="text-center text-sm text-zinc-400">
          <Link href={`/personality/${handle}`} className="text-hot underline">
            🔮 See the personality test for @{handle} too
          </Link>
        </p>
      </div>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT} />

      <TrendingHandles mode="stalkers" exclude={handle} />
    </div>
  );
}
