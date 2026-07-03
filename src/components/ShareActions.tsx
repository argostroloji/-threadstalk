"use client";

import { useState } from "react";

/**
 * Share + PNG download buttons.
 * `cardId` — DOM id of the on-screen card element; rendered to PNG via html2canvas.
 */
export default function ShareActions({
  cardId,
  shareText,
  fileName,
}: {
  cardId: string;
  shareText: string;
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function renderPng(): Promise<Blob | null> {
    const el = document.getElementById(cardId);
    if (!el) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el, {
      backgroundColor: "#0b0b12",
      scale: 2,
      useCORS: true,
      logging: false,
      // html2canvas "background-clip: text" gradyanını render edemez ve metni
      // pembe dolu kutuya çevirir. Yalnızca ekran görüntüsü kopyasında bu
      // metinleri düz renge çeviriyoruz; canlı sayfa gradyanı korur.
      onclone: (doc) => {
        doc.querySelectorAll<HTMLElement>(".bg-clip-text").forEach((node) => {
          node.style.backgroundImage = "none";
          node.style.background = "none";
          node.style.webkitBackgroundClip = "border-box";
          (node.style as unknown as { backgroundClip: string }).backgroundClip =
            "border-box";
          node.style.color = "#e879f9";
        });
      },
    });
    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
  }

  async function share() {
    setBusy(true);
    setNote(null);
    try {
      const url = window.location.href;
      const blob = await renderPng();

      if (blob && navigator.canShare?.({ files: [new File([blob], `${fileName}.png`, { type: "image/png" })] })) {
        await navigator.share({
          text: `${shareText}\n${url}`,
          files: [new File([blob], `${fileName}.png`, { type: "image/png" })],
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text: shareText, url });
        return;
      }
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setNote("Link copied to clipboard!");
    } catch {
      // user cancelled the share — that's fine
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    setBusy(true);
    setNote(null);
    try {
      const blob = await renderPng();
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setNote("Couldn't generate the image. You can take a screenshot instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button
          onClick={share}
          disabled={busy}
          className="flex-1 rounded-xl bg-gradient-to-r from-neon to-hot px-4 py-3 font-semibold text-ink transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Preparing..." : "📤 Share"}
        </button>
        <button
          onClick={download}
          disabled={busy}
          className="rounded-xl border border-white/15 px-4 py-3 font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-50"
        >
          Save Image
        </button>
      </div>
      {note && <p className="text-center text-xs text-zinc-400">{note}</p>}
    </div>
  );
}
