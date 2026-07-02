import Link from "next/link";

export default function ErrorPanel({
  title,
  message,
  retryHref,
}: {
  title: string;
  message: string;
  retryHref?: string;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-panel p-8 text-center">
      <p className="mb-2 text-3xl">😔</p>
      <h1 className="mb-2 text-xl font-bold">{title}</h1>
      <p className="mb-6 text-sm text-zinc-400">{message}</p>
      <div className="flex justify-center gap-3">
        {retryHref && (
          <Link
            href={retryHref}
            className="rounded-xl bg-gradient-to-r from-neon to-hot px-5 py-2.5 font-semibold text-ink"
          >
            Try again
          </Link>
        )}
        <Link
          href="/"
          className="rounded-xl border border-white/15 px-5 py-2.5 font-semibold text-zinc-200"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
