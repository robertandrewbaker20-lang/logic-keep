"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  TREAT_EMOJI,
  TREAT_LABEL,
  caperStars,
  dealCaper,
  type Clue,
  type KitchenSpot,
  type Suspect,
} from "@/lib/caper/engine";
import { SCARF_HEX } from "@/lib/caper/engine";
import { playHint, playTap, playWin, playWrong } from "@/lib/sound";
import { burstWin } from "@/lib/confetti";
import { HowTo } from "../HowTo";
import { WinModal } from "../WinModal";

type Props = {
  onWin: (leftover: number) => void;
  showHelp: boolean;
  onCloseHelp: () => void;
};

export function CaperGame({ onWin, showHelp, onCloseHelp }: Props) {
  const first = useMemo(() => dealCaper(), []);
  const [deal, setDeal] = useState(first);
  const [opened, setOpened] = useState<string[]>([]);
  const [notes, setNotes] = useState<Clue[]>([]);
  const [crossed, setCrossed] = useState<string[]>([]);
  const [accuse, setAccuse] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [line, setLine] = useState(
    "Tap a spot in the kitchen. Look with your own eyes — Pip will not solve it for you.",
  );

  const leftover = deal.searches - opened.length;
  const stars = caperStars(Math.max(0, leftover));

  function restart() {
    setDeal(dealCaper());
    setOpened([]);
    setNotes([]);
    setCrossed([]);
    setAccuse(null);
    setWon(false);
    setLost(false);
    setLine("New night, new pie. Search the kitchen again.");
  }

  function inspect(spot: KitchenSpot) {
    if (won || lost) return;
    if (opened.includes(spot.id)) {
      setLine("You already checked that.");
      return;
    }
    if (leftover <= 0) {
      setLine("No peeks left. Accuse someone, or the thief walks.");
      playWrong();
      return;
    }
    playTap();
    setOpened((o) => [...o, spot.id]);
    if (spot.clue) {
      setNotes((n) => [...n, spot.clue!]);
      setLine(`Found something by the ${spot.label.toLowerCase()}.`);
      playHint();
    } else {
      setLine(spot.flavor);
    }
  }

  function toggle(id: string) {
    if (won || lost) return;
    playTap();
    setCrossed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  function tryAccuse(id: string) {
    if (won || lost) return;
    if (accuse !== id) {
      setAccuse(id);
      playTap();
      return;
    }
    if (id === deal.thief.id) {
      setWon(true);
      playWin();
      burstWin();
      onWin(Math.max(0, leftover));
    } else {
      playWrong();
      setLine("Not that baker. Keep looking.");
      setAccuse(null);
      if (leftover <= 0) setLost(true);
    }
  }

  return (
    <div>
      {showHelp ? (
        <HowTo
          title="Cookie Caper"
          body="Tap the kitchen picture — oven, window, pie tin, rack — and read what you find. Clues are hints, not answers. Pip will not cross anyone off. You decide who still fits, then accuse. You only get a few peeks, so look carefully."
          onClose={onCloseHelp}
        />
      ) : null}

      {won ? (
        <WinModal
          title="Case closed!"
          message={`${deal.thief.name} the ${deal.thief.animalLabel} took the ${TREAT_LABEL[deal.thief.treat]}. The bakery is safe.`}
          stars={stars}
          primary={{ label: "New mystery", onClick: restart }}
        />
      ) : null}

      {lost ? (
        <WinModal
          title="The thief slipped away"
          message={`It was ${deal.thief.name} the ${deal.thief.animalLabel}. Another pie, another night.`}
          primary={{ label: "Try again", onClick: restart }}
        />
      ) : null}

      <p className="mb-3 font-display text-2xl">{line}</p>
      <p className="mb-3 text-sm text-white/70">
        Peeks left {Math.max(0, leftover)} · Clues in the notebook {notes.length}
      </p>

      <div className="relative mb-5 overflow-hidden rounded-[28px] border-4 border-[#F4C95D]/40">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/art/games/caper.jpg"
            alt="The bakery kitchen. Tap spots to search."
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {deal.spots.map((spot) => {
            const seen = opened.includes(spot.id);
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => inspect(spot)}
                className={`absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-[10px] font-black leading-tight ${
                  seen
                    ? spot.clue
                      ? "border-[#F4C95D] bg-[#F4C95D]/85 text-[#2A1B4A]"
                      : "border-white/50 bg-black/45 text-white/80"
                    : "border-white/80 bg-[#2A1B4A]/55 text-white pulse-glow"
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                aria-label={`Search ${spot.label}`}
              >
                {seen ? (spot.clue ? "Clue" : "Done") : "?"}
              </button>
            );
          })}
        </div>
      </div>

      {notes.length > 0 ? (
        <ol className="mb-5 grid gap-2">
          {notes.map((c, i) => (
            <li
              key={`${c.id}-${i}`}
              className="rounded-2xl bg-[#FFF6E8] px-4 py-3 font-bold text-[#1C1630]"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7B5EA7]">
                Notebook {i + 1}
              </span>
              <div className="mt-1">{c.text}</div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-5 text-sm text-white/55">
          Tap the glowing spots on the kitchen. Empty tins and cookie racks might hide a clue — or nothing.
        </p>
      )}

      <p className="mb-3 text-sm text-white/60">
        Cross bakers off yourself. Accuse when you are sure.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {deal.suspects.map((s) => (
          <SuspectCard
            key={s.id}
            suspect={s}
            crossed={crossed.includes(s.id)}
            accusing={accuse === s.id}
            onToggle={() => toggle(s.id)}
            onAccuse={() => tryAccuse(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SuspectCard({
  suspect,
  crossed,
  accusing,
  onToggle,
  onAccuse,
}: {
  suspect: Suspect;
  crossed: boolean;
  accusing: boolean;
  onToggle: () => void;
  onAccuse: () => void;
}) {
  return (
    <div
      className={`keep-card overflow-hidden text-[#1C1630] ${
        crossed ? "opacity-45" : ""
      } ${accusing ? "ring-4 ring-[#FF6B57]" : ""}`}
    >
      <div className="relative aspect-square bg-[#fff6e8]">
        <Image
          src={suspect.portrait}
          alt={suspect.name}
          fill
          className="object-cover object-top"
          sizes="40vw"
        />
        {crossed && (
          <div className="absolute inset-0 grid place-items-center bg-[#1C1630]/35">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black">
              Not them
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-display text-xl leading-none">{suspect.name}</div>
        <div className="mt-1 text-sm font-bold text-[#3A3358]">
          the {suspect.animalLabel}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-extrabold">
          <span
            className="rounded-full px-2 py-1 text-white"
            style={{ background: SCARF_HEX[suspect.scarf] }}
          >
            {suspect.scarf} scarf
          </span>
          <span className="rounded-full bg-[#f3e6d0] px-2 py-1">
            {TREAT_EMOJI[suspect.treat]} {TREAT_LABEL[suspect.treat]}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            className="rounded-full bg-[#f3e6d0] py-2 text-xs font-extrabold"
            onClick={onToggle}
          >
            {crossed ? "Restore" : "Cross off"}
          </button>
          <button
            type="button"
            className="rounded-full bg-[#FF6B57] py-2 text-xs font-extrabold text-white"
            onClick={onAccuse}
          >
            {accusing ? "Confirm?" : "Accuse"}
          </button>
        </div>
      </div>
    </div>
  );
}
