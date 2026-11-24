"use client";

import { useCallback, useRef, useState } from "react";
import { RotateCcw, Undo2, Lightbulb, LayoutGrid } from "lucide-react";
import {
  applyMove,
  hintMove,
  isWon,
  parseGrid,
  pathIsClear,
  slideRange,
  type Move,
  type Vehicle,
} from "@/lib/getaway/engine";
import { VehicleArt } from "./VehicleArt";
import { GETAWAY_LEVELS, PACKS } from "@/lib/getaway/levels";
import { starsForGetaway, type Stars as StarCount } from "@/lib/progress";
import { playHint, playSlide, playTap, playWin, playWrong } from "@/lib/sound";
import { burstWin } from "@/lib/confetti";
import { HowTo } from "../HowTo";
import { WinModal } from "../WinModal";
import { Stars } from "../Stars";

type Props = {
  saved: Record<string, StarCount>;
  onWin: (levelId: string, stars: StarCount) => void;
  showHelp: boolean;
  onCloseHelp: () => void;
};

export function GetawayGame({ saved, onWin, showHelp, onCloseHelp }: Props) {
  const firstUnsolved =
    GETAWAY_LEVELS.find((l) => !saved[l.id])?.id ?? GETAWAY_LEVELS[0].id;
  const [levelId, setLevelId] = useState(firstUnsolved);
  const [selecting, setSelecting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    parseGrid(GETAWAY_LEVELS.find((l) => l.id === firstUnsolved)!.grid),
  );
  const [history, setHistory] = useState<Vehicle[][]>([]);
  const [moves, setMoves] = useState(0);
  const [hint, setHint] = useState<Move | null>(null);
  const [won, setWon] = useState(false);
  const [drag, setDrag] = useState<{
    id: string;
    offset: number;
  } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{
    x: number;
    y: number;
    id: string;
    cell: number;
    offset: number;
  } | null>(null);

  const level = GETAWAY_LEVELS.find((l) => l.id === levelId)!;

  const resetTo = useCallback(
    (id: string) => {
      const next = GETAWAY_LEVELS.find((l) => l.id === id)!;
      const parsed = parseGrid(next.grid);
      setLevelId(id);
      setVehicles(parsed);
      setHistory([]);
      setMoves(0);
      setHint(null);
      setWon(false);
      setDrag(null);
      setSelecting(false);
    },
    [],
  );

  const par = level.par;
  const stars = won ? starsForGetaway(moves, Math.max(par, 1)) : 0;

  function commit(next: Vehicle[]) {
    setHistory((h) => [...h, vehicles]);
    setVehicles(next);
    setMoves((m) => m + 1);
    setHint(null);
    playSlide();
    if (isWon(next) && !won) {
      setWon(true);
      playWin();
      burstWin();
      onWin(levelId, starsForGetaway(moves + 1, Math.max(level.par, 1)));
    }
  }

  function onPointerDown(e: React.PointerEvent, v: Vehicle) {
    if (won || !boardRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const cell = boardRef.current.getBoundingClientRect().width / 6;
    startRef.current = { x: e.clientX, y: e.clientY, id: v.id, cell, offset: 0 };
    setDrag({ id: v.id, offset: 0 });
    playTap();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!startRef.current) return;
    const v = vehicles.find((x) => x.id === startRef.current!.id);
    if (!v) return;
    const raw =
      v.orientation === "h"
        ? (e.clientX - startRef.current.x) / startRef.current.cell
        : (e.clientY - startRef.current.y) / startRef.current.cell;
    const { min, max } = slideRange(v, vehicles);
    const offset = Math.min(max, Math.max(min, raw));
    startRef.current.offset = offset;
    setDrag({ id: v.id, offset });
  }

  function onPointerUp() {
    if (!startRef.current) {
      setDrag(null);
      return;
    }
    const v = vehicles.find((x) => x.id === startRef.current!.id);
    const offset = startRef.current.offset;
    startRef.current = null;
    setDrag(null);
    if (!v) return;
    const snapped = Math.round(offset);
    if (snapped === 0) return;
    const { min, max } = slideRange(v, vehicles);
    const delta = Math.min(max, Math.max(min, snapped));
    if (delta === 0) return;
    commit(applyMove(vehicles, { id: v.id, delta }));
  }

  function undo() {
    const prev = history[history.length - 1];
    if (!prev || won) return;
    setVehicles(prev);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(0, m - 1));
    setHint(null);
  }

  function giveHint() {
    const move = hintMove(vehicles);
    if (!move) {
      playWrong();
      return;
    }
    setHint(move);
    playHint();
  }

  const nextLevel = GETAWAY_LEVELS[GETAWAY_LEVELS.findIndex((l) => l.id === levelId) + 1];

  return (
    <div>
      {showHelp ? (
        <HowTo
          title="Golden Getaway"
          body="Drag Teslas and semis only the way they face. Get the gold Tesla out the glowing gate on the right. The other cars stay on the lot — they are blockers. Undo is safe. A hint glows the next smart slide."
          onClose={onCloseHelp}
        />
      ) : null}

      {won ? (
        <WinModal
          title={stars === 3 ? "Perfect getaway!" : "The gold Tesla is out!"}
          message={`${moves} moves. Pip's par was ${par}.`}
          stars={stars}
          primary={{
            label: nextLevel ? `Next: ${nextLevel.name}` : "Back to the yard",
            onClick: () => {
              if (nextLevel) resetTo(nextLevel.id);
              else setSelecting(true);
            },
          }}
          secondary={{
            label: "Pick a level",
            onClick: () => {
              setWon(false);
              setSelecting(true);
            },
          }}
        />
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-ghost inline-flex h-11 items-center gap-2 px-4 text-sm"
          onClick={() => setSelecting((s) => !s)}
        >
          <LayoutGrid className="h-4 w-4" />
          {level.name}
        </button>
        <div className="text-sm text-white/70">
          Moves {moves}
          {par ? ` · Par ${par}` : ""}
        </div>
        <div className="ml-auto flex gap-2">
          <IconBtn label="Undo" onClick={undo} disabled={!history.length || won}>
            <Undo2 className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Reset" onClick={() => resetTo(levelId)}>
            <RotateCcw className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Hint" onClick={giveHint} disabled={won}>
            <Lightbulb className="h-5 w-5" />
          </IconBtn>
        </div>
      </div>

      {selecting ? (
        <LevelPicker
          saved={saved}
          current={levelId}
          onPick={(id) => resetTo(id)}
        />
      ) : (
        <div className="mx-auto grid max-w-[560px] gap-4">
          <div
            ref={boardRef}
            className="board-wood relative aspect-square w-full touch-none overflow-hidden rounded-[28px] p-[4.2%] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]"
          >
            <div className="absolute inset-[4.2%] grid grid-cols-6 grid-rows-6 gap-[2.4%]">
              {Array.from({ length: 36 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-[10px] bg-[#efe0c4]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                />
              ))}
            </div>
            <div
              className={`absolute right-0 z-10 w-[4.2%] rounded-r-2xl ${
                pathIsClear(vehicles) ? "pulse-glow bg-[#F4C95D]" : "bg-[#F4C95D]/70"
              }`}
              style={{
                top: `calc(4.2% + (100% - 8.4%) / 6 * 2)`,
                height: `calc((100% - 8.4%) / 6)`,
              }}
              aria-hidden
            />
            <div className="absolute inset-[4.2%]">
              {vehicles.map((v) => {
                const isDrag = drag?.id === v.id;
                const offset = isDrag ? drag.offset : 0;
                const hinted = hint?.id === v.id;
                return (
                  <CarPiece
                    key={v.id}
                    v={v}
                    offset={offset}
                    hinted={hinted}
                    hintDelta={hinted ? hint!.delta : 0}
                    onPointerDown={(e) => onPointerDown(e, v)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                  />
                );
              })}
            </div>
          </div>
          <p className="text-center text-sm text-white/70">{level.blurb}</p>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="btn-ghost grid h-11 w-11 place-items-center disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function CarPiece({
  v,
  offset,
  hinted,
  hintDelta,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  v: Vehicle;
  offset: number;
  hinted: boolean;
  hintDelta: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}) {
  const top = v.orientation === "v" ? v.row + offset : v.row;
  const left = v.orientation === "h" ? v.col + offset : v.col;
  const width = v.orientation === "h" ? v.length : 1;
  const height = v.orientation === "v" ? v.length : 1;

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`absolute touch-none overflow-hidden rounded-[16px] bg-transparent ${
        hinted ? "pulse-glow" : ""
      }`}
      style={{
        top: `calc(${top} * 100% / 6 + 1.1%)`,
        left: `calc(${left} * 100% / 6 + 1.1%)`,
        width: `calc(${width} * 100% / 6 - 2.2%)`,
        height: `calc(${height} * 100% / 6 - 2.2%)`,
        filter: v.hero
          ? "drop-shadow(0 6px 10px rgba(196,146,42,0.55))"
          : "drop-shadow(0 6px 8px rgba(28,22,48,0.35))",
        zIndex: v.hero ? 5 : 4,
        cursor: "grab",
      }}
      aria-label={
        v.hero
          ? "Gold Tesla"
          : v.length >= 3
            ? `Semi ${v.id}`
            : `Tesla ${v.id}`
      }
    >
      <VehicleArt v={v} />
      {hinted ? (
        <span className="absolute -right-1 -top-2 rounded-full bg-[#F4C95D] px-2 py-0.5 text-[10px] font-black text-[#2A1B4A]">
          {hintDelta > 0 ? (v.orientation === "h" ? "→" : "↓") : v.orientation === "h" ? "←" : "↑"}
        </span>
      ) : null}
    </button>
  );
}

function LevelPicker({
  saved,
  current,
  onPick,
}: {
  saved: Record<string, StarCount>;
  current: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid gap-6">
      {PACKS.map((pack) => {
        const levels = GETAWAY_LEVELS.filter((l) => l.pack === pack.id);
        return (
          <section key={pack.id}>
            <h2 className="font-display text-2xl">{pack.title}</h2>
            <p className="mb-3 text-sm text-white/65">{pack.note}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {levels.map((level) => {
                const packIndex = GETAWAY_LEVELS.findIndex((l) => l.id === level.id);
                const prior = GETAWAY_LEVELS[packIndex - 1];
                const open =
                  packIndex === 0 ||
                  Boolean(saved[level.id]) ||
                  Boolean(prior && saved[prior.id]);
                return (
                  <button
                    key={level.id}
                    type="button"
                    disabled={!open}
                    onClick={() => onPick(level.id)}
                    className={`rounded-3xl p-4 text-left ${
                      open ? "bg-white/10 hover:bg-white/16" : "bg-white/5 opacity-50"
                    } ${current === level.id ? "ring-2 ring-[#F4C95D]" : ""}`}
                  >
                    <div className="text-xs font-extrabold uppercase tracking-wider text-white/50">
                      {open ? `Level ${packIndex + 1}` : "Locked"}
                    </div>
                    <div className="font-display text-lg">{level.name}</div>
                    <Stars value={saved[level.id] ?? 0} size={16} />
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
