import { ThreadsPost, ThreadsProfile, ThreadsReply } from "./types";
import type { MentionPost } from "./threads";

/** Fake data for MOCK_DATA=true development without external APIs. */

const now = Math.floor(Date.now() / 1000);
const day = 24 * 60 * 60;

export const MOCK_PROFILE: ThreadsProfile = {
  username: "mockuser",
  fullName: "Mock User",
  followerCount: 1234,
  isVerified: false,
  biography: "Philosophy by night, coffee by day. Test account.",
  profilePicUrl: undefined,
  isPrivate: false,
};

export const MOCK_POSTS: ThreadsPost[] = [
  { id: "1", text: "It's 3 AM and I'm still thinking about the meaning of the universe. What even is sleep?", takenAt: now - 2 * day, url: "https://www.threads.com/@mockuser/post/AAA1", likeCount: 42, replyCount: 5 },
  { id: "2", text: "A morning without coffee is like code without a compiler.", takenAt: now - 5 * day, url: "https://www.threads.com/@mockuser/post/AAA2", likeCount: 18, replyCount: 3 },
  { id: "3", text: "I'd love to say I ran 5k today but does sprinting for the bus count?", takenAt: now - 9 * day, url: "https://www.threads.com/@mockuser/post/AAA3", likeCount: 77, replyCount: 12 },
  { id: "4", text: "Everyone's talking about AI and I'm still procrastinating on folding my laundry.", takenAt: now - 15 * day, url: "https://www.threads.com/@mockuser/post/AAA4", likeCount: 133, replyCount: 20 },
  { id: "5", text: "A tweet written at night gets deleted in the morning; a thread written at night is forever. That's just science.", takenAt: now - 40 * day, url: "https://www.threads.com/@mockuser/post/AAA5", likeCount: 25, replyCount: 2 },
];

export const MOCK_REPLIES: ThreadsReply[] = [
  { username: "night_owl", text: "Exactly this!", takenAt: now - 2 * day },
  { username: "night_owl", text: "Framing this one", takenAt: now - 5 * day },
  { username: "coffee_mike", text: "Agree on the coffee part", takenAt: now - 5 * day },
  { username: "silent_lurker", text: "👀", takenAt: now - 9 * day },
  { username: "night_owl", text: "you again", takenAt: now - 9 * day },
  { username: "pixel_fairy", text: "I live this too", takenAt: now - 3 * day },
  { username: "code_and_cry", text: "compiler metaphor 10/10", takenAt: now - 4 * day },
  { username: "sleepless_bear", text: "3 AM crew, assemble", takenAt: now - 2 * day },
  { username: "tea_lover42", text: "does tea count", takenAt: now - 6 * day },
  { username: "urban_flaneur", text: "bus sprints are cardio", takenAt: now - 8 * day },
  { username: "meme_archive", text: "stealing this", takenAt: now - 7 * day },
  { username: "morning_person", text: "wake up at 6 AM folks", takenAt: now - 35 * day },
  { username: "lofi_listener", text: "+1", takenAt: now - 41 * day },
];

export const MOCK_MENTIONS: MentionPost[] = [
  { username: "drama_hunter", text: "look at the thread @mockuser posted last night, they have a point", takenAt: now - 3 * day, url: "https://www.threads.com/@drama_hunter/post/BBB1", isQuote: true },
  { username: "night_owl", text: "turns out I'm not the only one who thinks like @mockuser", takenAt: now - 12 * day, url: "https://www.threads.com/@night_owl/post/BBB2", isQuote: false },
  { username: "hustle_guru", text: "someone show this to @mockuser: success starts when you stop procrastinating!", takenAt: now - 50 * day, url: "https://www.threads.com/@hustle_guru/post/BBB3", isQuote: false },
];
