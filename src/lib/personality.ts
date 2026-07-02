import Anthropic from "@anthropic-ai/sdk";
import { cacheGet, cacheSet } from "./cache";
import { getProfile, getUserPosts } from "./threads";
import { DataError, PersonalityResult } from "./types";

const SYSTEM_PROMPT = `You will be given a user's Threads posts.

IMPORTANT — LANGUAGE: First detect the dominant language of the posts. Write your ENTIRE output (archetype name, description, evidence) in that language, so the user can share the result with their own audience. Only fall back to English if the language is unclear or mixed.

Based on the posts:
1. Assign the user one of these fun "personality archetypes" (translate the archetype name naturally into the posts' language, e.g. "Night Philosopher" → "Gece Filozofu" in Turkish):
   - "Night Philosopher" — posts deep thoughts late at night
   - "Quiet Reply Guy" — says little but is always in the interactions
   - "Drama Follower" — never misses a trending argument
   - "Motivational Speaker" — constantly posts inspiration and hustle content
   - "Meme Lord" — humor and jokes above all
   - "Chronic Complainer" — grumbles about everything, but lovably
   - "Soft-Hearted Observer" — describes people and life warmly
   - "Walking Encyclopedia" — always teaching, sharing fun facts
   - "Chaos Energy" — jumps from topic to topic, unpredictable
   - "Aesthetic Curator" — all about visuals, taste and style
2. Write a short, witty 2-3 sentence description.
3. Extract 3 "evidence" lines: paraphrased observations inspired by the user's own posts, but NEVER verbatim quotes.
Return ONLY JSON, nothing else:
{"archetype": "", "description": "", "evidence": ["", "", ""]}`;

interface LlmVerdict {
  archetype: string;
  description: string;
  evidence: string[];
}

function extractJson(text: string): LlmVerdict {
  // Tolerate code fences or stray text around the JSON
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in LLM response");
  const parsed = JSON.parse(match[0]);
  if (
    typeof parsed.archetype !== "string" ||
    typeof parsed.description !== "string" ||
    !Array.isArray(parsed.evidence)
  ) {
    throw new Error("LLM response doesn't match the expected schema");
  }
  return {
    archetype: parsed.archetype,
    description: parsed.description,
    evidence: parsed.evidence.slice(0, 3).map(String),
  };
}

const MOCK_VERDICT: LlmVerdict = {
  archetype: "Night Philosopher",
  description:
    "Questions the meaning of the universe at 3 AM and can't compile without morning coffee. Deep thoughts, questionable sleep schedule.",
  evidence: [
    "Has made a habit of asking existential questions after midnight",
    "Treats coffee as an operating system, not a beverage",
    "Remarkably flexible when interpreting fitness goals",
  ],
};

async function askClaude(handle: string, postTexts: string[]): Promise<LlmVerdict> {
  if (process.env.MOCK_DATA === "true") return MOCK_VERDICT;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new DataError(
      "The personality test isn't configured (ANTHROPIC_API_KEY missing).",
      "config",
    );
  }

  const client = new Anthropic();
  const userContent =
    `Recent Threads posts from @${handle}:\n\n` +
    postTexts.map((t, i) => `${i + 1}. ${t}`).join("\n");

  try {
    const response = await client.messages.create({
      // Haiku 4.5: bu eğlence görevine yeterli, test başına ~0,4 cent.
      // Not: Haiku adaptive thinking desteklemez — thinking parametresi yok.
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    if (response.stop_reason === "refusal") {
      throw new DataError(
        "This content couldn't be analyzed. Try another account.",
        "unavailable",
      );
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return extractJson(text);
  } catch (err) {
    if (err instanceof DataError) throw err;
    if (err instanceof Anthropic.RateLimitError) {
      throw new DataError(
        "We're a bit busy right now. Please try again in a minute.",
        "rate_limited",
      );
    }
    throw new DataError(
      "The personality analysis isn't available right now. Please try again.",
      "unavailable",
    );
  }
}

export async function getPersonalityResult(
  handle: string,
): Promise<PersonalityResult> {
  const cacheKey = `personality:v3:${handle}`;
  const cached = await cacheGet<PersonalityResult>(cacheKey);
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

  const posts = (await getUserPosts(handle))
    .map((p) => p.text.trim())
    .filter((t) => t.length > 0)
    .slice(0, 100);

  if (posts.length < 3) {
    throw new DataError(
      "Not enough public posts for the analysis (at least 3 text posts needed).",
      "not_found",
    );
  }

  const verdict = await askClaude(handle, posts);

  const result: PersonalityResult = {
    handle,
    profile,
    archetype: verdict.archetype,
    description: verdict.description,
    evidence: verdict.evidence,
    postCount: posts.length,
    generatedAt: Date.now(),
  };

  await cacheSet(cacheKey, result);
  return result;
}
