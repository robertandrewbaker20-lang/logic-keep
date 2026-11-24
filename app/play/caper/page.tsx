"use client";

import { useEffect, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { CaperGame } from "@/components/caper/CaperGame";
import { gameBySlug } from "@/lib/catalog";
import { useProgress } from "@/lib/progress";
import { setSoundMuted } from "@/lib/sound";

const GAME = gameBySlug("caper")!;

export default function CaperPage() {
  const { progress, isLoaded, setMuted, recordCaperWin, gameStars } =
    useProgress();
  const [help, setHelp] = useState(true);

  useEffect(() => {
    if (isLoaded) setSoundMuted(progress.muted);
  }, [isLoaded, progress.muted]);

  if (!isLoaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#2A1B4A] text-[#FFF6E8]">
        Flour in the air…
      </div>
    );
  }

  return (
    <GameShell
      game={GAME}
      muted={progress.muted}
      onMute={(m) => {
        setMuted(m);
        setSoundMuted(m);
      }}
      onHelp={() => setHelp(true)}
      stars={gameStars.caper}
      status={`${progress.caper.wins} mysteries solved`}
    >
      <CaperGame
        onWin={recordCaperWin}
        showHelp={help}
        onCloseHelp={() => setHelp(false)}
      />
    </GameShell>
  );
}
