import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What data ThreadStalker processes, for what purpose, and for how long.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-extrabold">Privacy Policy</h1>
      <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">
            What data do we process?
          </h2>
          <p>
            ThreadStalker only processes <strong>publicly available</strong>{" "}
            Threads data: the queried username&apos;s public profile, their
            public posts, and the usernames of accounts that publicly reply to
            or publicly mention that user. Private accounts are not analyzed.
            We never ask you to log in to your Threads account and we never
            collect passwords or session data.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">
            For what purpose?
          </h2>
          <p>
            The data is used solely to generate the interaction circle you
            requested. We do not sell it or use it for any other purpose.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">
            How long do we keep it?
          </h2>
          <p>
            Results are cached for <strong>24 hours</strong> so repeated
            queries are fast, and they expire automatically after that. We do
            not keep a permanent user database beyond this cache.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">
            Cookies and ads
          </h2>
          <p>
            This site may show Google AdSense ads. Google and its partners may
            use cookies to personalize ads. You can read how Google uses
            advertising cookies at{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google&apos;s Advertising Policies
            </a>{" "}
            and opt out of personalized ads in{" "}
            <a
              href="https://adssettings.google.com"
              className="underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Ad Settings
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">
            Want your data removed?
          </h2>
          <p>
            If you&apos;d like your username excluded from results or the
            cached data deleted immediately, reach out via the{" "}
            <a href="/contact" className="underline">
              contact page
            </a>{" "}
            — we&apos;ll handle your request within 7 days.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-zinc-100">
            Trademark note
          </h2>
          <p>
            ThreadStalker is not affiliated with or endorsed by Meta Platforms,
            Inc. or Threads. The name &quot;Threads&quot; appears only as text
            to describe the service.
          </p>
        </section>
        <p className="text-xs text-zinc-500">Last updated: July 2, 2026</p>
      </div>
    </article>
  );
}
