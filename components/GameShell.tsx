"use client";

import Link from "next/link";
import { Volume2, VolumeX, HelpCircle, ArrowLeft } from "lucide-react";
import { PipBadge } from "./PipBadge";
import { Stars } from "./Stars";
import type { GameMeta } from "@/lib/catalog";

type Props = {
  game: GameMeta;
  muted: boolean;
  onMute: (muted: boolean) => void;
  onHelp: () => void;
  stars?: number;
  status?: string;
  fillScreen?: boolean;
  children: React.ReactNode;
};

export function GameShell({
  game,
  muted,
  onMute,
  onHelp,
  stars,
  status,
  fillScreen,
  children,
}: Props) {
  return (
    <div
      className={`bg-[#2A1B4A] text-[#FFF6E8] ${
        fillScreen ? "flex h-dvh flex-col overflow-hidden" : "min-h-dvh"
      }`}
    >
      <header className="sticky top-0 z-30 shrink-0 border-b border-white/10 bg-[#2A1B4A]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          <Link
            href="/"
            className="btn-ghost inline-flex h-11 items-center gap-2 px-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Keep
          </Link>
          <PipBadge size={44} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-xl leading-none">
              {game.title}
            </h1>
            <p className="truncate text-sm text-[#FFF6E8]/70">
              {status ?? game.tagline}
            </p>
          </div>
          {typeof stars === "number" ? <Stars value={stars} size={18} /> : null}
          <button
            type="button"
            className="btn-ghost grid h-11 w-11 place-items-center"
            onClick={onHelp}
            aria-label="How to play"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="btn-ghost grid h-11 w-11 place-items-center"
            onClick={() => onMute(!muted)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>
      <main
        className={`mx-auto w-full max-w-5xl px-4 ${
          fillScreen
            ? "flex min-h-0 flex-1 flex-col overflow-hidden py-2"
            : "py-5 pb-12"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
