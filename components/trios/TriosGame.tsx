"use client";

import { useMemo, useState } from "react";
import { Lightbulb, RefreshCcw } from "lucide-react";
import {
  dealBoard,
  findTrios,
  isTrio,
  replaceTrio,
  type TrioCard,
} from "@/lib/trios/engine";
import { playHint, playSet, playTap, playWin, playWrong } from "@/lib/sound";
import { burstWin } from "@/lib/confetti";
import { HowTo } from "../HowTo";
import { TrioCardView } from "./TrioCardView";

type Props = {
  onRoundScored: (sets: number) => void;
  showHelp: boolean;
  onCloseHelp: () => void;
};

export function TriosGame({ onRoundScored, showHelp, onCloseHelp }: Props) {
  const initial = useMemo(() => dealBoard(), []);
  const [board, setBoard] = useState<TrioCard[]>(initial.board);
  const [deck, setDeck] = useState<TrioCard[]>(initial.deck);
  const [picked, setPicked] = useState<string[]>([]);
  const [found, setFound] = useState(0);
  const [shake, setShake] = useState(false);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);

  const remaining = findTrios(board).length;

  function newRound(scoreRound: boolean) {
    if (scoreRound && found > 0) onRoundScored(found);
    const next = dealBoard();
    setBoard(next.board);
    setDeck(next.deck);
    setPicked([]);
    setFound(0);
    setHintIds([]);
    setEnded(false);
  }

  function tap(id: string) {
    if (ended) return;
    playTap();
    setHintIds([]);
    const next = picked.includes(id)
      ? picked.filter((x) => x !== id)
      : picked.length === 3
        ? picked
        : [...picked, id];
    setPicked(next);
    if (next.length < 3) return;
    const cards = next
      .map((cid) => board.find((c) => c.id === cid))
      .filter(Boolean) as TrioCard[];
    if (cards.length === 3 && isTrio(cards[0], cards[1], cards[2])) {
      playSet();
      const replaced = replaceTrio(board, next, deck);
      setBoard(replaced.board);
      setDeck(replaced.deck);
      setPicked([]);
      const total = found + 1;
      setFound(total);
      if (findTrios(replaced.board).length === 0) {
        setEnded(true);
        playWin();
        burstWin();
        onRoundScored(total);
      }
    } else {
      playWrong();
      setShake(true);
      window.setTimeout(() => {
        setShake(false);
        setPicked([]);
      }, 380);
    }
  }

  function hint() {
    const trios = findTrios(board);
    if (!trios.length) {
      playWrong();
      return;
    }
    setHintIds(trios[0].map((c) => c.id));
    playHint();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {showHelp ? (
        <HowTo
          title="Trio Sight"
          body="This is a real deck: hearts, diamonds, spades, and clubs, with number cards and face cards. A Trio is either three of a kind (three Queens, three 7s) or three in a row of the same suit (5♥ 6♥ 7♥, or Q♠ K♠ A♠). Tap three cards that belong together."
          onClose={onCloseHelp}
        />
      ) : null}

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-extrabold">
          Trios {found}
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-extrabold text-white/70">
          On table {remaining}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            className="btn-ghost inline-flex h-9 items-center gap-2 px-3 text-sm"
            onClick={hint}
          >
            <Lightbulb className="h-4 w-4" /> Hint
          </button>
          <button
            type="button"
            className="btn-ghost inline-flex h-9 items-center gap-2 px-3 text-sm"
            onClick={() => newRound(found > 0 && !ended)}
          >
            <RefreshCcw className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {ended ? (
        <div className="shrink-0 rounded-2xl bg-[#F4C95D] px-4 py-2 text-[#2A1B4A]">
          <span className="font-display text-lg">Table is clear!</span>
          <span className="ml-2 font-bold">
            {found} trio{found === 1 ? "" : "s"}.
          </span>
        </div>
      ) : null}

      <div
        className={`grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-1.5 sm:gap-2 ${
          shake ? "shake" : ""
        }`}
      >
        {board.slice(0, 12).map((card) => (
          <TrioCardView
            key={card.id}
            card={card}
            selected={picked.includes(card.id)}
            dimmed={hintIds.length > 0 && !hintIds.includes(card.id)}
            onClick={() => tap(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
