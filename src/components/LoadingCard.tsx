/**
 * Sonuç sayfaları hazırlanırken gösterilen bekleme ekranı.
 * Gerçek veride analiz ~5-15 sn sürer (10'a yakın API çağrısı + LLM).
 */
export default function LoadingCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="card-gradient flex flex-col items-center rounded-3xl border border-white/10 p-10 sm:p-14">
        {/* çember animasyonu — sonuçtaki circle'a gönderme */}
        <div className="relative mb-8 h-32 w-32">
          <div className="absolute inset-0 animate-ping rounded-full border border-neon/40 [animation-duration:2s]" />
          <div className="absolute inset-4 animate-ping rounded-full border border-hot/40 [animation-duration:2s] [animation-delay:0.4s]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-14 animate-pulse rounded-full bg-gradient-to-r from-neon to-hot" />
          </div>
        </div>

        <p className="mb-2 text-center text-lg font-bold">{title}</p>
        <p className="text-center text-sm text-zinc-400">{subtitle}</p>
        <p className="mt-4 text-center text-xs text-zinc-500">
          This usually takes about 10 seconds.
        </p>
      </div>
    </div>
  );
}
