"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Tek bir responsive AdSense birimi.
 * Client id veya slot id tanımlı değilse hiçbir şey render etmez —
 * böylece AdSense onayı gelmeden site sorunsuz çalışır.
 */
export default function AdSlot({ slot }: { slot?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // reklam engelleyici vb. — sessizce geç
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <div className="my-8 flex justify-center">
      <ins
        ref={ref}
        className="adsbygoogle block w-full max-w-2xl"
        style={{ display: "block", minHeight: 100 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
