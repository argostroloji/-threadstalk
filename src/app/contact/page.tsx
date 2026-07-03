import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the ThreadStalker team: questions, feedback and data removal requests.",
  alternates: { canonical: "/contact" },
};

const CONTACT_EMAIL = "argostroloji@gmail.com";

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-3xl font-extrabold text-zinc-100">Contact</h1>
      <p>
        For questions, feedback, bug reports or{" "}
        <strong>data removal requests</strong>, email us:
      </p>
      <p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-block rounded-xl bg-gradient-to-r from-neon to-hot px-6 py-3 font-semibold text-ink"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
      <div className="rounded-2xl border border-white/10 bg-panel p-5">
        <h2 className="mb-2 font-bold text-zinc-100">Data removal requests</h2>
        <p>
          If you want your username removed from ThreadStalker&apos;s cache
          immediately, put &quot;Data removal&quot; in the subject line and
          include your Threads username. We&apos;ll process the request within
          7 days and get back to you.
        </p>
      </div>
      <p className="text-xs text-zinc-500">
        We usually reply within 1-2 business days.
      </p>
    </article>
  );
}
