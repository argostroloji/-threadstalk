import { Interaction, InteractionType, StalkerEntry } from "./types";

/**
 * "Seni Kim Stalkluyor?" skorlaması.
 *
 * Puanlar:  mention 3 · quote 2 · repost 1 · reply 1
 * Son 30 gün içindeki etkileşimlere x1.5 ağırlık uygulanır.
 *
 * Not: Threads, repost eden kullanıcıların listesini herkese açık vermiyor;
 * bu yüzden pratikte repost etkileşimi üretilemez ama skorlayıcı destekler.
 * Sadece gerçekten gözlemlenmiş (doğrulanabilir) etkileşimler puanlanır —
 * asla tahmini isim üretilmez.
 */

export const WEIGHTS: Record<InteractionType, number> = {
  mention: 3,
  quote: 2,
  repost: 1,
  reply: 1,
};

const RECENT_MULTIPLIER = 1.5;
const RECENT_WINDOW_S = 30 * 24 * 60 * 60;

export function scoreInteractions(
  interactions: Interaction[],
  ownerHandle: string,
  now: number = Math.floor(Date.now() / 1000),
  limit = 5,
): StalkerEntry[] {
  const byUser = new Map<
    string,
    { score: number; profilePicUrl?: string; breakdown: Partial<Record<InteractionType, number>> }
  >();

  const owner = ownerHandle.toLowerCase();

  for (const it of interactions) {
    const username = it.username.toLowerCase();
    if (!username || username === owner) continue; // kendi kendine etkileşim sayılmaz

    const base = WEIGHTS[it.type];
    const isRecent = it.takenAt > 0 && now - it.takenAt <= RECENT_WINDOW_S;
    const score = base * (isRecent ? RECENT_MULTIPLIER : 1);

    const entry = byUser.get(username) ?? { score: 0, breakdown: {} };
    entry.score += score;
    entry.breakdown[it.type] = (entry.breakdown[it.type] ?? 0) + 1;
    if (!entry.profilePicUrl && it.profilePicUrl) {
      entry.profilePicUrl = it.profilePicUrl;
    }
    byUser.set(username, entry);
  }

  return [...byUser.entries()]
    .map(([username, e]) => ({
      username,
      profilePicUrl: e.profilePicUrl,
      score: Math.round(e.score * 10) / 10,
      breakdown: e.breakdown,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
