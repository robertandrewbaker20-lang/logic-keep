"use client";

import { useEffect, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { GetawayGame } from "@/components/getaway/GetawayGame";
import { gameBySlug } from "@/lib/catalog";
import { useProgress } from "@/lib/progress";
import { setSoundMuted } from "@/lib/sound";

const GAME = gameBySlug("getaway")!;

export default function GetawayPage() {
  const {
    progress,
    isLoaded,
    setMuted,
    recordGetaway,
    gameStars,
  } = useProgress();
  const [help, setHelp] = useState(true);

  useEffect(() => {
    if (isLoaded) setSoundMuted(progress.muted);
  }, [isLoaded, progress.muted]);

  if (!isLoaded) return <Boot />;

  return (
    <GameShell
      game={GAME}
      muted={progress.muted}
      onMute={(m) => {
        setMuted(m);
        setSoundMuted(m);
      }}
      onHelp={() => setHelp(true)}
      stars={gameStars.getaway}
    >
      <GetawayGame
        saved={progress.getaway}
        onWin={recordGetaway}
        showHelp={help}
        onCloseHelp={() => setHelp(false)}
      />
    </GameShell>
  );
}

function Boot() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#2A1B4A] text-[#FFF6E8]">
      Opening the garage…
    </div>
  );
}
