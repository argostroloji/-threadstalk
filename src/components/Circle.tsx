import { StalkerEntry, ThreadsProfile } from "@/lib/types";

/**
 * threadscircle tarzı etkileşim çemberi:
 * ortada kullanıcı, iç halkada en yüksek skorlular, dış halkada kalanlar.
 * Deterministik layout — state gerektirmez, server'da render edilir.
 */

const RING1_COUNT = 8;

function proxied(url: string): string {
  return `/api/img?u=${encodeURIComponent(url)}`;
}

/** Kullanıcı adından deterministik pastel renk (avatar yoksa baş harf kutusu) */
function hueOf(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

function Avatar({
  username,
  picUrl,
  sizeClass,
  textClass,
}: {
  username: string;
  picUrl?: string;
  sizeClass: string;
  textClass: string;
}) {
  if (picUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={proxied(picUrl)}
        alt={`@${username}`}
        title={`@${username}`}
        className={`${sizeClass} rounded-full border-2 border-white/20 object-cover`}
      />
    );
  }
  return (
    <div
      title={`@${username}`}
      className={`${sizeClass} ${textClass} flex items-center justify-center rounded-full border-2 border-white/20 font-bold uppercase text-white`}
      style={{ background: `hsl(${hueOf(username)}, 55%, 40%)` }}
    >
      {username.slice(0, 1)}
    </div>
  );
}

function ringStyle(index: number, total: number, radiusPct: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    left: `${50 + radiusPct * Math.cos(angle)}%`,
    top: `${50 + radiusPct * Math.sin(angle)}%`,
    transform: "translate(-50%, -50%)",
  };
}

export default function Circle({
  profile,
  handle,
  entries,
}: {
  profile: ThreadsProfile | null;
  handle: string;
  entries: StalkerEntry[];
}) {
  const ring1 = entries.slice(0, RING1_COUNT);
  const ring2 = entries.slice(RING1_COUNT);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      {/* halka çizgileri */}
      <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      {ring2.length > 0 && (
        <div className="absolute left-1/2 top-1/2 h-[94%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      )}

      {/* merkez: kullanıcının kendisi */}
      <div
        className="absolute"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <Avatar
          username={handle}
          picUrl={profile?.profilePicUrl}
          sizeClass="h-20 w-20 sm:h-24 sm:w-24"
          textClass="text-3xl"
        />
      </div>

      {/* iç halka */}
      {ring1.map((e, i) => (
        <div
          key={e.username}
          className="absolute"
          style={ringStyle(i, ring1.length, 34)}
        >
          <Avatar
            username={e.username}
            picUrl={e.profilePicUrl}
            sizeClass="h-12 w-12 sm:h-14 sm:w-14"
            textClass="text-lg"
          />
        </div>
      ))}

      {/* dış halka */}
      {ring2.map((e, i) => (
        <div
          key={e.username}
          className="absolute"
          style={ringStyle(i, ring2.length, 47)}
        >
          <Avatar
            username={e.username}
            picUrl={e.profilePicUrl}
            sizeClass="h-8 w-8 sm:h-10 sm:w-10"
            textClass="text-xs"
          />
        </div>
      ))}
    </div>
  );
}
