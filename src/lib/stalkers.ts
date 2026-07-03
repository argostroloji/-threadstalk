import { cacheGet, cacheSet } from "./cache";
import { scoreInteractions } from "./score";
import { getPostReplies, getPostsAndProfile } from "./threads";
import { DataError, Interaction, StalkerResult } from "./types";

/**
 * Maliyet planı: analiz başına 3 kredi.
 *   1 kredi  → posts (profil bilgisi de bu yanıtın içinden çıkıyor)
 *   2 kredi  → en güncel 2 yanıtlı postun yanıt taraması (~20'şer kişi)
 * Mention araması kaldırıldı: küçük hesaplarda neredeyse hep boş dönüyordu
 * ve analiz başına +1 krediydi. "Son zamanlarda konuştuğu kişiler" sinyalinin
 * tamamı zaten yanıtlarda.
 */
const MAX_POSTS_TO_SCAN = 2;
const WINDOW_S = 90 * 24 * 60 * 60; // 90 gün

export async function getStalkerResult(handle: string): Promise<StalkerResult> {
  const cacheKey = `stalkers:v4:${handle}`;
  const cached = await cacheGet<StalkerResult>(cacheKey);
  if (cached) return cached;

  const { profile, posts: allPosts } = await getPostsAndProfile(handle);

  if (profile?.isPrivate) {
    throw new DataError(
      "This account is private. Only public accounts can be analyzed.",
      "private",
    );
  }
  if (!profile || allPosts.length === 0) {
    throw new DataError(
      "Couldn't find public posts for this account — it may not exist, be private, or haven't posted yet.",
      "not_found",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - WINDOW_S;

  const posts = allPosts
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

  const interactions = replyBatches.flat();
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
