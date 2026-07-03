import { getSupabase } from "./cache";

/**
 * Arama günlüğü + gerçek trending.
 *
 * Supabase tablosu (SQL Editor'de bir kez çalıştır):
 *   create table if not exists searches (
 *     id bigint generated always as identity primary key,
 *     handle text not null,
 *     created_at timestamptz not null default now()
 *   );
 *   create index if not exists searches_created_at_idx
 *     on searches (created_at desc);
 *
 * Tablo yoksa/hata olursa sessizce geçilir — site etkilenmez.
 */

export async function logSearch(handle: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("searches").insert({ handle });
  } catch {
    // analitik asla kullanıcı akışını bozmasın
  }
}

/**
 * Son 24 saatte en az 2 kez aranan handle'lar, popülerlik sırasıyla.
 * (Tek kez arananlar gösterilmez: kendine bakan sıradan kullanıcıyı
 * başkalarının sayfasında teşhir etmemek için.)
 */
export async function getTrendingHandles(
  exclude?: string,
  limit = 4,
): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb
      .from("searches")
      .select("handle")
      .gte("created_at", since)
      .limit(2000);
    if (error || !data) return [];

    const counts = new Map<string, number>();
    for (const row of data) {
      counts.set(row.handle, (counts.get(row.handle) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([handle, count]) => count >= 2 && handle !== exclude)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([handle]) => handle);
  } catch {
    return [];
  }
}
