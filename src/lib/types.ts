export type InteractionType = "mention" | "quote" | "repost" | "reply";

export interface Interaction {
  username: string;
  profilePicUrl?: string;
  type: InteractionType;
  /** Unix saniye */
  takenAt: number;
  /** Etkileşimin geçtiği postun linki (kanıt) */
  postUrl?: string;
}

export interface StalkerEntry {
  username: string;
  profilePicUrl?: string;
  score: number;
  /** Etkileşim türlerine göre sayılar, ör. { mention: 2, reply: 5 } */
  breakdown: Partial<Record<InteractionType, number>>;
}

export interface StalkerResult {
  handle: string;
  profile: ThreadsProfile | null;
  entries: StalkerEntry[];
  /** Analize giren toplam etkileşim sayısı */
  totalInteractions: number;
  analyzedPostCount: number;
  generatedAt: number;
}

export interface PersonalityResult {
  handle: string;
  profile: ThreadsProfile | null;
  archetype: string;
  description: string;
  evidence: string[];
  postCount: number;
  generatedAt: number;
}

export interface ThreadsProfile {
  username: string;
  fullName?: string;
  followerCount?: number;
  isVerified?: boolean;
  biography?: string;
  profilePicUrl?: string;
  isPrivate?: boolean;
}

export interface ThreadsPost {
  id: string;
  text: string;
  takenAt: number;
  url?: string;
  likeCount?: number;
  replyCount?: number;
}

export interface ThreadsReply {
  username: string;
  profilePicUrl?: string;
  text: string;
  takenAt: number;
}

/** Kullanıcıya gösterilebilir mesaj taşıyan hata */
export class DataError extends Error {
  constructor(
    message: string,
    public readonly kind:
      | "not_found"
      | "private"
      | "rate_limited"
      | "unavailable"
      | "config",
  ) {
    super(message);
    this.name = "DataError";
  }
}
