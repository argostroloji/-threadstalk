const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What does ThreadStalker do?",
    a: (
      <>
        ThreadStalker builds a visual &quot;interaction circle&quot; of the
        accounts that publicly engage with you the most on Threads — the people
        who reply to, mention and quote you. The result comes as a shareable
        image you can post to your story.
      </>
    ),
  },
  {
    q: "How does it work?",
    a: (
      <>
        You enter a public Threads username. We look at the last 90 days of
        public interactions — replies to your posts, and public mentions and
        quotes of you — and score them (a mention is worth 3 points, a quote 2,
        a reply 1, with recent interactions weighted higher). The top accounts
        are drawn as your circle.
      </>
    ),
  },
  {
    q: "Can you really show who viewed my profile?",
    a: (
      <>
        No — and neither can any other tool, honestly. Threads and Instagram{" "}
        <strong>never share profile-visit data with anyone</strong>. Any site
        claiming to show your &quot;profile viewers&quot; is making it up.
        ThreadStalker only measures <strong>real, public interactions</strong>{" "}
        (mentions, quotes, replies) — never guessed or invented names.
      </>
    ),
  },
  {
    q: "Do you store my data?",
    a: (
      <>
        We only process publicly available data, and we never ask you to log in.
        Results are cached for 24 hours so repeat queries are fast, then they
        expire automatically. See our{" "}
        <a href="/privacy" className="underline">
          privacy policy
        </a>{" "}
        for details, including how to request removal.
      </>
    ),
  },
  {
    q: "Is it free?",
    a: (
      <>
        Yes, completely free and no sign-up required. Just enter a username and
        get your result in seconds.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section className="mt-14 w-full max-w-2xl">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-white/10 bg-panel px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-zinc-100">
              {item.q}
              <span className="ml-4 text-zinc-500 transition group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
