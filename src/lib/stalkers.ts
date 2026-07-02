import { cacheGet, cacheSet } from "./cache";
import { scoreInteractions } from "./score";
import {
  getPostReplies,
  getProfile,
  getUserPosts,
  searchMentions,
} from "./threads";
import { DataError, Interaction, StalkerResult } from "./types";

/** Yanıtları taranacak maksimum post sayısı (API kredisi kontrolü) */
const MAX_POSTS_TO_SCAN = 8;
const WINDOW_S = 90 * 24 * 60 * 60; // 90 gün

export async function getStalkerResult(handle: string): Promise<StalkerResult> {
  const cacheKey = `stalkers:v2:${handle}`;
  const cached = await cacheGet<StalkerResult>(cacheKey);
  if (cached) return cached;

  const profile = await getProfile(handle);
  if (!profile) {
    throw new DataError("This username wasn't found on Threads.", "not_found");
  }
  if (profile.isPrivate) {
    throw new DataError(
      "This account is private. Only public accounts can be analyzed.",
      "private",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - WINDOW_S;

  // 1) Kullanıcının son postları → yanıt verenler (reply etkileşimi)
  const posts = (await getUserPosts(handle))
    .filter((p) => p.takenAt >= cutoff)
    .sort((a, b) => b.takenAt - a.takenAt);

  const postsToScan = posts
    .filter((p) => p.url && (p.replyCount ?? 0) > 0)
    .slice(0, MAX_POSTS_TO_SCAN);

  const replyBatches = await Promise.all(
    postsToScan.map(async (post) => {
      const replies = await getPostReplies(post.url!);
      return replies
        .filter((r) => r.takenAt === 0 || r.takenAt >= cutoff)
        .map(
          (r): Interaction => ({
            username: r.username,
            profilePicUrl: r.profilePicUrl,
            type: "reply",
            takenAt: r.takenAt || post.takenAt,
            postUrl: post.url,
          }),
        );
    }),
  );

  // 2) @handle mention araması → mention / quote etkileşimleri
  const mentions = await searchMentions(handle);
  const mentionInteractions: Interaction[] = mentions
    .filter((m) => m.takenAt === 0 || m.takenAt >= cutoff)
    .map((m) => ({
      username: m.username,
      profilePicUrl: m.profilePicUrl,
      type: m.isQuote ? "quote" : "mention",
      takenAt: m.takenAt,
      postUrl: m.url,
    }));

  const interactions = [...replyBatches.flat(), ...mentionInteractions];
  // Çember görseli: iç halka 8 + dış halka 16
  const entries = scoreInteractions(interactions, handle, now, 24);

  const result: StalkerResult = {
    handle,
    profile,
    entries,
    totalInteractions: interactions.length,
    analyzedPostCount: postsToScan.length,
    generatedAt: Date.now(),
  };

  await cacheSet(cacheKey, result);
  return result;
}
