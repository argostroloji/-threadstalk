import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AdSenseScript from "@/components/AdSenseScript";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ThreadStalk — Who's Stalking You on Threads?",
    template: "%s · ThreadStalk",
  },
  description:
    "Enter your Threads username and get your interaction circle — a shareable card of who engages with you most.",
  openGraph: {
    siteName: "ThreadStalk",
    type: "website",
    locale: "en_US",
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AdSenseScript />
        <header className="border-b border-white/5">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              👁️ Thread<span className="text-neon">Stalk</span>
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-400">
              <Link href="/about" className="hover:text-zinc-100">
                About
              </Link>
              <Link href="/contact" className="hover:text-zinc-100">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-500">
          <div className="mx-auto max-w-4xl space-y-3 px-4">
            <p>
              ThreadStalk is not affiliated with or endorsed by Meta Platforms,
              Inc. The name &quot;Threads&quot; is used only as text to describe
              the service. Only publicly available data is processed.
            </p>
            <p className="space-x-3">
              <Link href="/privacy" className="underline hover:text-zinc-300">
                Privacy Policy
              </Link>
              <Link href="/about" className="underline hover:text-zinc-300">
                About
              </Link>
              <Link href="/contact" className="underline hover:text-zinc-300">
                Contact
              </Link>
            </p>
            <p>© {new Date().getFullYear()} ThreadStalk</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
