"use client";

import { useState } from "react";

const PRESETS = [
  "#0b0b12", // gece
  "#1d1030", // mor
  "#301025", // bordo-pembe
  "#0f2027", // petrol
  "#14290f", // orman
  "#26180a", // kahve
];

/**
 * Shareable card shell with selectable background color.
 * Content (children) is server-rendered; only the color state lives here.
 */
export default function ColorCard({
  cardId,
  children,
}: {
  cardId: string;
  children: React.ReactNode;
}) {
  const [bg, setBg] = useState(PRESETS[0]);

  return (
    <div>
      <div
        id={cardId}
        className="rounded-3xl border border-white/10 p-6 sm:p-8"
        style={{
          background: `radial-gradient(28rem 20rem at 85% 0%, rgba(192,132,252,0.18), transparent), radial-gradient(24rem 18rem at 0% 100%, rgba(244,114,182,0.12), transparent), ${bg}`,
        }}
      >
        {children}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="mr-1 text-xs text-zinc-500">BG color:</span>
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Background color ${c}`}
            onClick={() => setBg(c)}
            className={`h-6 w-6 rounded-full border transition ${
              bg === c ? "scale-110 border-white" : "border-white/20"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}
