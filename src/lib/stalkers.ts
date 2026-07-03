import { cacheGet, cacheSet } from "./cache";
import { scoreInteractions } from "./score";
import {
  getPostReplies,
  getProfile,
  getUserPosts,
  searchMentions,
} from "./threads";
import {
  DataError,
  Interaction,
  StalkerResult,
  ThreadsPost,
} from "./types";

/**
 * Yanıtları taranacak maksimum post sayısı.
 * Her post 1 kredi + 1 canlı scrape (yavaş) demek; her post ~20 yanıt
 * getirdiği için 3 post, 24 kişilik çember için yeterli — daha az straggler,
 * daha düşük maliyet.
 */
const MAX_POSTS_TO_SCAN = 3;
const WINDOW_S = 90 * 24 * 60 * 60; // 90 gün

export async function getStalkerResult(handle: string): Promise<StalkerResult> {
  const cacheKey = `stalkers:v3:${handle}`;
  const cached = await cacheGet<StalkerResult>(cacheKey);
  if (cached) return cached;

  // Üç bağımsız çağrıyı da t=0'da başlat. Yalnızca yanıt taramaları postlara
  // bağımlı; profil (gating) ve mention araması onlarla paralel akar, kritik
  // yola eklenmez. (searchMentions kendi içinde hata yutar, reject etmez.)
  const profileP = getProfile(handle);
  const postsP = getUserPosts(handle).catch(() => [] as ThreadsPost[]);
  const mentionsP = searchMentions(handle);

  const profile = await profileP;
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

  const posts = (await postsP)
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

  // t=0'da başlayan mention araması bu noktada büyük olasılıkla çoktan bitti.
  const mentions = await mentionsP;
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
