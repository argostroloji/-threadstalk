/**
 * Paylaşılan görselin altındaki belirgin site imzası.
 * NEXT_PUBLIC_SITE_URL'den domaini türetir; localhost/boşsa threadstalk.xyz.
 */
function brandDomain(): string {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
    if (host && host !== "localhost") return host;
  } catch {
    // geçersiz URL → fallback
  }
  return "threadstalk.xyz";
}

export default function CardBrand() {
  return (
    <p className="mt-6 text-center text-base font-bold tracking-wide">
      👁️{" "}
      <span className="bg-gradient-to-r from-neon to-hot bg-clip-text text-transparent">
        {brandDomain()}
      </span>
    </p>
  );
}
