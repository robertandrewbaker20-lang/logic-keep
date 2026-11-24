"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { GAMES } from "@/lib/catalog";
import { PipBadge } from "@/components/PipBadge";
import { Stars } from "@/components/Stars";
import { HowTo } from "@/components/HowTo";
import { setSoundMuted } from "@/lib/sound";

export default function HomePage() {
  const { progress, isLoaded, setChildName, markIntroSeen, gameStars } =
    useProgress();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const name = nameDraft ?? progress.childName;

  useEffect(() => {
    if (isLoaded) setSoundMuted(progress.muted);
  }, [isLoaded, progress.muted]);

  if (!isLoaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#2A1B4A] text-[#FFF6E8]">
        Lighting the keep…
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#2A1B4A] text-[#FFF6E8]">
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="twinkle absolute h-1.5 w-1.5 rounded-full bg-white"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 13) % 42}%`,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      {!progress.seenIntro ? (
        <HowTo
          title={`Welcome to Logic Keep`}
          body="Four puzzle towers, one clever raccoon. Pip packed sliding cars, secret card trios, a gem vault, and a bakery mystery. Pick a glowing door. There is no timer."
          cta="Open the gates"
          onClose={markIntroSeen}
        />
      ) : null}

      <main id="main-content" className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-[32px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.65)]">
          <Image
            src="/art/hub.jpg"
            alt="Logic Keep, a castle with four glowing doorways"
            width={1600}
            height={900}
            className="h-[42vw] min-h-[220px] max-h-[420px] w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1B4A] via-[#2A1B4A]/25 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4 sm:bottom-8 sm:left-8">
            <PipBadge size={88} className="floaty hidden sm:block" />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#F4C95D]">
                Logic Keep
              </p>
              <h1 className="font-display text-4xl leading-none sm:text-6xl">
                Welcome,
                <button
                  type="button"
                  className="ml-2 underline decoration-[#F4C95D] decoration-4 underline-offset-4"
                  onClick={() => setEditing(true)}
                >
                  {progress.childName}
                </button>
                .
              </h1>
              <p className="mt-2 max-w-xl text-lg text-white/80">
                Four puzzle towers. Pip is waiting at the gates.
              </p>
            </div>
          </div>
        </div>

        {editing ? (
          <form
            className="mt-4 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setChildName(name);
              setEditing(false);
            }}
          >
            <input
              value={name}
              onChange={(e) => setNameDraft(e.target.value)}
              className="h-12 rounded-full bg-white px-5 text-[#1C1630]"
              maxLength={18}
              aria-label="Your name"
              autoFocus
            />
            <button type="submit" className="btn-gold px-6">
              Save name
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-white/50">Tap your name to change it.</p>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/play/${game.slug}`}
              className="group keep-card overflow-hidden text-[#1C1630] transition hover:-translate-y-1"
            >
              <div className="relative h-44 sm:h-52">
                <Image
                  src={game.cover}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute left-4 top-4">
                  <Stars value={gameStars[game.slug]} />
                </div>
              </div>
              <div className="p-5">
                <div
                  className="text-xs font-extrabold uppercase tracking-[0.16em]"
                  style={{ color: game.accent }}
                >
                  {game.door} door
                </div>
                <h2 className="font-display mt-1 text-3xl">{game.title}</h2>
                <p className="mt-1 text-base text-[#3A3358]">{game.tagline}</p>
                <span className="btn-gold mt-4 inline-flex px-5 py-2.5 text-sm">
                  Play
                </span>
              </div>
            </Link>
          ))}
        </section>

        <p className="mt-10 text-center text-sm text-white/45">
          Built for my kids, open for anyone to play · Progress stays on this
          device ·{" "}
          <Link href="/parent" className="underline">
            Parent reset
          </Link>
        </p>
      </main>
    </div>
  );
}
