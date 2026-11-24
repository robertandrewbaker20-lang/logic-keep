"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameSlug } from "./catalog";

export type Stars = 0 | 1 | 2 | 3;

export type Progress = {
  childName: string;
  muted: boolean;
  seenIntro: boolean;
  tutorials: Partial<Record<GameSlug, boolean>>;
  getaway: Record<string, Stars>;
  trios: { setsFound: number; bestRound: number };
  vault: { wins: number; bestRemaining: number };
  caper: { wins: number; bestLeftover: number };
};

const STORAGE_KEY = "logic-keep-progress-v1";

const defaultProgress: Progress = {
  childName: "Explorer",
  muted: false,
  seenIntro: false,
  tutorials: {},
  getaway: {},
  trios: { setsFound: 0, bestRound: 0 },
  vault: { wins: 0, bestRemaining: 0 },
  caper: { wins: 0, bestLeftover: 0 },
};

function clampStars(n: number): Stars {
  if (n >= 3) return 3;
  if (n >= 2) return 2;
  if (n >= 1) return 1;
  return 0;
}

function readProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...defaultProgress,
      ...parsed,
      tutorials: { ...defaultProgress.tutorials, ...parsed.tutorials },
      getaway: { ...defaultProgress.getaway, ...parsed.getaway },
      trios: { ...defaultProgress.trios, ...parsed.trios },
      vault: { ...defaultProgress.vault, ...parsed.vault },
      caper: { ...defaultProgress.caper, ...parsed.caper },
    };
  } catch {
    return defaultProgress;
  }
}

export function starsForGetaway(moves: number, par: number): Stars {
  if (moves <= par) return 3;
  if (moves <= par + 3) return 2;
  return 1;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Hydrate from this browser only; skip during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage snapshot
    setProgress(readProgress());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore quota
    }
  }, [progress, isLoaded]);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => fn(prev));
  }, []);

  const setChildName = useCallback(
    (name: string) => {
      update((p) => ({ ...p, childName: name.trim() || "Explorer" }));
    },
    [update],
  );

  const setMuted = useCallback(
    (muted: boolean) => update((p) => ({ ...p, muted })),
    [update],
  );

  const markIntroSeen = useCallback(
    () => update((p) => ({ ...p, seenIntro: true })),
    [update],
  );

  const markTutorialSeen = useCallback(
    (slug: GameSlug) =>
      update((p) => ({ ...p, tutorials: { ...p.tutorials, [slug]: true } })),
    [update],
  );

  const recordGetaway = useCallback(
    (levelId: string, stars: Stars) => {
      update((p) => {
        const prev = p.getaway[levelId] ?? 0;
        if (stars <= prev) return p;
        return { ...p, getaway: { ...p.getaway, [levelId]: stars } };
      });
    },
    [update],
  );

  const recordTrios = useCallback(
    (setsThisRound: number) => {
      update((p) => ({
        ...p,
        trios: {
          setsFound: p.trios.setsFound + setsThisRound,
          bestRound: Math.max(p.trios.bestRound, setsThisRound),
        },
      }));
    },
    [update],
  );

  const recordVaultWin = useCallback(
    (remaining: number) => {
      update((p) => ({
        ...p,
        vault: {
          wins: p.vault.wins + 1,
          bestRemaining: Math.max(p.vault.bestRemaining, remaining),
        },
      }));
    },
    [update],
  );

  const recordCaperWin = useCallback(
    (leftover: number) => {
      update((p) => ({
        ...p,
        caper: {
          wins: p.caper.wins + 1,
          bestLeftover: Math.max(p.caper.bestLeftover, leftover),
        },
      }));
    },
    [update],
  );

  const resetProgress = useCallback(() => {
    setProgress({ ...defaultProgress });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getawayStars = Object.values(progress.getaway).reduce<number>(
    (sum, s) => sum + s,
    0,
  );

  const gameStars: Record<GameSlug, Stars> = {
    getaway: clampStars(
      Object.values(progress.getaway).filter((s) => s > 0).length >= 12
        ? 3
        : Object.values(progress.getaway).filter((s) => s > 0).length >= 6
          ? 2
          : Object.values(progress.getaway).filter((s) => s > 0).length >= 1
            ? 1
            : 0,
    ),
    trios: clampStars(
      progress.trios.setsFound >= 20
        ? 3
        : progress.trios.setsFound >= 8
          ? 2
          : progress.trios.setsFound >= 1
            ? 1
            : 0,
    ),
    vault: clampStars(
      progress.vault.wins >= 8
        ? 3
        : progress.vault.wins >= 3
          ? 2
          : progress.vault.wins >= 1
            ? 1
            : 0,
    ),
    caper: clampStars(
      progress.caper.wins >= 6
        ? 3
        : progress.caper.wins >= 2
          ? 2
          : progress.caper.wins >= 1
            ? 1
            : 0,
    ),
  };

  return {
    progress,
    isLoaded,
    setChildName,
    setMuted,
    markIntroSeen,
    markTutorialSeen,
    recordGetaway,
    recordTrios,
    recordVaultWin,
    recordCaperWin,
    resetProgress,
    getawayStars,
    gameStars,
  };
}
