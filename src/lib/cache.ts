import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * 24 saatlik sonuç cache'i.
 *
 * Supabase env değişkenleri tanımlıysa Postgres tablosu kullanılır
 * (serverless'ta istekler arası kalıcı), yoksa in-memory Map'e düşer
 * (sadece dev için yeterli — Vercel'de her lambda kendi belleğini görür).
 *
 * Supabase tablosu (SQL):
 *   create table if not exists result_cache (
 *     key text primary key,
 *     value jsonb not null,
 *     expires_at timestamptz not null
 *   );
 */

const TTL_MS = 24 * 60 * 60 * 1000;

let supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key, { auth: { persistSession: false } });
  return supabase;
}

const memory = new Map<string, { value: unknown; expiresAt: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data } = await sb
        .from("result_cache")
        .select("value, expires_at")
        .eq("key", key)
        .maybeSingle();
      if (data && new Date(data.expires_at).getTime() > Date.now()) {
        return data.value as T;
      }
      return null;
    } catch {
      // Cache hatası uygulamayı düşürmesin — cache'siz devam
      return null;
    }
  }
  const hit = memory.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;
  memory.delete(key);
  return null;
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MS);
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("result_cache").upsert({
        key,
        value,
        expires_at: expiresAt.toISOString(),
      });
      return;
    } catch {
      // yut — cache yazılamazsa sonuç yine döner
    }
  }
  memory.set(key, { value, expiresAt: expiresAt.getTime() });
}
