"use client";

import { useEffect, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { TriosGame } from "@/components/trios/TriosGame";
import { gameBySlug } from "@/lib/catalog";
import { useProgress } from "@/lib/progress";
import { setSoundMuted } from "@/lib/sound";

const GAME = gameBySlug("trios")!;

export default function TriosPage() {
  const { progress, isLoaded, setMuted, recordTrios, gameStars } =
    useProgress();
  const [help, setHelp] = useState(true);

  useEffect(() => {
    if (isLoaded) setSoundMuted(progress.muted);
  }, [isLoaded, progress.muted]);

  if (!isLoaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#2A1B4A] text-[#FFF6E8]">
        Shuffling the table…
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
      stars={gameStars.trios}
      status={`${progress.trios.setsFound} trios found forever`}
      fillScreen
    >
      <TriosGame
        onRoundScored={recordTrios}
        showHelp={help}
        onCloseHelp={() => setHelp(false)}
      />
    </GameShell>
  );
}
