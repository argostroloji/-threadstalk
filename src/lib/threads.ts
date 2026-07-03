import {
  DataError,
  ThreadsPost,
  ThreadsProfile,
  ThreadsReply,
} from "./types";
import { MOCK_PROFILE, MOCK_POSTS, MOCK_REPLIES, MOCK_MENTIONS } from "./mock";

/**
 * ScrapeCreators Threads API istemcisi.
 * Docs: https://docs.scrapecreators.com
 *
 * Endpoint'ler (doğrulanmış):
 *  - GET /v1/threads/profile?handle=X
 *  - GET /v1/threads/user/posts?handle=X       (son ~20-30 post — Threads'in limiti)
 *  - GET /v1/threads/post?url=...              (post detayı + yanıtlar)
 *  - GET /v1/threads/search?query=...          (anahtar kelime araması, ~10 sonuç/istek)
 */

const BASE = "https://api.scrapecreators.com/v1/threads";
const TIMEOUT_MS = 15_000;

function isMock(): boolean {
  return process.env.MOCK_DATA === "true";
}

async function scGet(path: string, params: Record<string, string>): Promise<any> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;
  if (!apiKey) {
    throw new DataError(
      "The data provider isn't configured (SCRAPECREATORS_API_KEY missing).",
      "config",
    );
  }

  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  // 429 ve geçici hatalar için 1 kez yeniden dene
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url.toString(), {
        headers: { "x-api-key": apiKey },
        signal: controller.signal,
        // Sağlayıcı yanıtlarını Next fetch cache'ine sokma — kendi cache'imiz var
        cache: "no-store",
      });

      if (res.status === 429) {
        if (attempt === 0) {
          const retryAfter = Number(res.headers.get("retry-after")) || 2;
          await new Promise((r) => setTimeout(r, Math.min(retryAfter, 5) * 1000));
          continue;
        }
        throw new DataError(
          "The data provider is busy right now. Please try again in a minute or two.",
          "rate_limited",
        );
      }
      if (res.status === 404) {
        throw new DataError("This username wasn't found.", "not_found");
      }
      if (!res.ok) {
        throw new DataError(
          "Couldn't fetch the data, please try again.",
          "unavailable",
        );
      }
      return await res.json();
    } catch (err) {
      if (err instanceof DataError) throw err;
      if (attempt === 0) continue; // timeout / network error → retry once
      throw new DataError(
        "Threads data is unreachable right now. Please try again.",
        "unavailable",
      );
    } finally {
      clearTimeout(timer);
    }
  }
  throw new DataError("Couldn't fetch the data, please try again.", "unavailable");
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase().slice(0, 64);
}

export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9._]{1,30}$/.test(handle);
}

export async function getProfile(handle: string): Promise<ThreadsProfile | null> {
  if (isMock()) return { ...MOCK_PROFILE, username: handle };
  try {
    const data = await scGet("/profile", { handle });
    const u = data?.user ?? data;
    if (!u?.username) return null;
    return {
      username: u.username,
      fullName: u.full_name,
      followerCount: u.follower_count,
      isVerified: u.is_verified,
      biography: u.biography,
      profilePicUrl: u.profile_pic_url,
      isPrivate: u.text_post_app_is_private,
    };
  } catch (err) {
    if (err instanceof DataError && err.kind === "not_found") return null;
    throw err;
  }
}

function parsePost(p: any): ThreadsPost | null {
  const text: string = p?.caption?.text ?? "";
  const takenAt: number = p?.taken_at ?? 0;
  const id: string = String(p?.id ?? p?.pk ?? "");
  if (!id) return null;
  return {
    id,
    text,
    takenAt,
    url: p?.url,
    likeCount: p?.like_count,
    replyCount: p?.text_post_app_info?.direct_reply_count,
  };
}

export async function getUserPosts(handle: string): Promise<ThreadsPost[]> {
  if (isMock()) return MOCK_POSTS;
  // trim=true, text_post_app_info'yu (direct_reply_count) siliyor — kullanma.
  const data = await scGet("/user/posts", { handle });
  const posts: any[] = data?.posts ?? [];
  return posts.map(parsePost).filter((p): p is ThreadsPost => p !== null);
}

export async function getPostReplies(postUrl: string): Promise<ThreadsReply[]> {
  if (isMock()) return MOCK_REPLIES;
  try {
    const data = await scGet("/post", { url: postUrl });
    const comments: any[] = data?.comments ?? data?.replies ?? [];
    return comments
      .map((c: any): ThreadsReply | null => {
        const username = c?.user?.username;
        if (!username) return null;
        return {
          username,
          profilePicUrl: c?.user?.profile_pic_url,
          text: c?.caption?.text ?? c?.text ?? "",
          takenAt: c?.taken_at ?? 0,
        };
      })
      .filter((r): r is ThreadsReply => r !== null);
  } catch {
    // Tek bir postun yanıtları alınamadıysa analiz devam edebilir
    return [];
  }
}

export interface MentionPost {
  username: string;
  profilePicUrl?: string;
  text: string;
  takenAt: number;
  url?: string;
  /** true ise alıntı (quote) olarak sınıflandırılabilir */
  isQuote: boolean;
}

export async function searchMentions(handle: string): Promise<MentionPost[]> {
  if (isMock()) return MOCK_MENTIONS;
  const end = new Date();
  const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  try {
    const data = await scGet("/search", {
      // Arama motoru "@" ile 0 sonuç döndürür — düz handle ile arayıp
      // aşağıda metinde gerçek @handle geçenleri filtreliyoruz.
      query: handle,
      start_date: fmt(start),
      end_date: fmt(end),
    });
    const posts: any[] = data?.posts ?? [];
    return posts
      .map((p: any): MentionPost | null => {
        const username = p?.user?.username;
        const text: string = p?.caption?.text ?? "";
        if (!username) return null;
        // Sadece @handle'ı gerçekten geçirenler (arama motoru gevşek eşleşebilir)
        if (!text.toLowerCase().includes(`@${handle.toLowerCase()}`)) return null;
        return {
          username,
          profilePicUrl: p?.user?.profile_pic_url,
          text,
          takenAt: p?.taken_at ?? 0,
          url: p?.url,
          isQuote: Boolean(p?.text_post_app_info?.share_info?.quoted_post),
        };
      })
      .filter((m): m is MentionPost => m !== null);
  } catch {
    // Mention araması opsiyonel sinyal — hata olursa reply analizi yeterli
    return [];
  }
}
