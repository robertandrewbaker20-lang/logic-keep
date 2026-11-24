"use client";

import { useEffect, useState } from "react";
import { GameShell } from "@/components/GameShell";
import { VaultGame } from "@/components/vault/VaultGame";
import { gameBySlug } from "@/lib/catalog";
import { useProgress } from "@/lib/progress";
import { setSoundMuted } from "@/lib/sound";

const GAME = gameBySlug("vault")!;

export default function VaultPage() {
  const { progress, isLoaded, setMuted, recordVaultWin, gameStars } =
    useProgress();
  const [help, setHelp] = useState(true);

  useEffect(() => {
    if (isLoaded) setSoundMuted(progress.muted);
  }, [isLoaded, progress.muted]);

  if (!isLoaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#2A1B4A] text-[#FFF6E8]">
        Spinning the vault…
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
      stars={gameStars.vault}
      status={`${progress.vault.wins} vaults cracked`}
    >
      <VaultGame
        onWin={recordVaultWin}
        showHelp={help}
        onCloseHelp={() => setHelp(false)}
      />
    </GameShell>
  );
}
