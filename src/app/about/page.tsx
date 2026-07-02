import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "What ThreadStalk is, how it works, and why it's honest.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-3xl font-extrabold text-zinc-100">About</h1>
      <p>
        ThreadStalk is a just-for-fun analytics tool for Threads users. It does
        two things: it scores the accounts that engage with you the most based
        on public interaction data (&quot;Who&apos;s Stalking You?&quot;), and
        it has AI read your recent posts to assign you a playful personality
        archetype.
      </p>
      <h2 className="text-lg font-bold text-zinc-100">Our honesty principle</h2>
      <p>
        Almost every tool on the internet claiming to show &quot;who viewed
        your profile&quot; shows made-up results — because Threads (and
        Instagram) <strong>never share profile-visit data with anyone</strong>.
        We say this openly: ThreadStalk doesn&apos;t measure profile visits, it
        measures{" "}
        <strong>real, verifiable public interactions</strong> (mentions,
        quotes, replies). That disclaimer is always part of our result cards.
        We never show guessed or random names.
      </p>
      <h2 className="text-lg font-bold text-zinc-100">How it works</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>You enter a username (no login required).</li>
        <li>
          Public interactions from the last 90 days are collected: a mention is
          3 points, a quote 2 points, a reply 1 point; interactions from the
          last 30 days get a 1.5x weight.
        </li>
        <li>The top-scoring accounts appear in your circle.</li>
        <li>
          For the personality test, the text of your recent posts is sent to
          Claude (Anthropic) and the result comes back as one of 10 archetypes.
        </li>
      </ul>
      <p>
        Questions? Use the{" "}
        <Link href="/contact" className="underline">
          contact page
        </Link>
        . How we handle data is described in our{" "}
        <Link href="/privacy" className="underline">
          privacy policy
        </Link>
        .
      </p>
      <p className="text-xs text-zinc-500">
        ThreadStalk is not affiliated with Meta Platforms, Inc.
      </p>
    </article>
  );
}
