import HandleForm from "@/components/HandleForm";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import TrendingHandles from "@/components/TrendingHandles";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="flex flex-col items-center py-10 text-center">
        <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
          Who&apos;s{" "}
          <span className="bg-gradient-to-r from-neon to-hot bg-clip-text text-transparent">
            stalking you
          </span>{" "}
          on Threads?
        </h1>
        <p className="mb-8 max-w-xl text-zinc-400">
          Free, no login, 10 seconds.
        </p>
        <HandleForm />
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LANDING} />

      <TrendingHandles mode="stalkers" />

      <Faq />
    </div>
  );
}
