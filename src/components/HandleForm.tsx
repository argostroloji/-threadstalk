"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function normalize(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

// Not: Kişilik testi şimdilik kapalı (talep gelince geri açılacak).
// /personality/[handle] route'u ve lib'i yerinde duruyor; buraya bir mod
// seçici geri eklemek yeterli.
export default function HandleForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const h = normalize(handle);
    if (!/^[a-z0-9._]{1,30}$/.test(h)) {
      setError("Enter a valid Threads username (e.g. @zuck)");
      return;
    }
    setError(null);
    setLoading(true);
    router.push(`/stalkers/${encodeURIComponent(h)}`);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md space-y-4">
      <div className="flex gap-2">
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="@username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-panel px-4 py-3 text-base outline-none placeholder:text-zinc-500 focus:border-neon/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-neon to-hot px-5 py-3 font-semibold text-ink transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : "Generate"}
        </button>
      </div>

      {error && <p className="text-sm text-hot">{error}</p>}

      <p className="text-xs text-zinc-500">
        Only public Threads data is analyzed. Results are cached for 24 hours.
      </p>
    </form>
  );
}
