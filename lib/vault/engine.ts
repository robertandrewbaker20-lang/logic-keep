export const GEMS = [
  { id: "ruby", label: "Ruby", fill: "#E23D4F", glow: "#FF8A97" },
  { id: "sapphire", label: "Sapphire", fill: "#2F6BFF", glow: "#8FB4FF" },
  { id: "emerald", label: "Emerald", fill: "#1FA86A", glow: "#7BE3B0" },
  { id: "amethyst", label: "Amethyst", fill: "#7B5EA7", glow: "#C9B3EA" },
  { id: "topaz", label: "Topaz", fill: "#F08A5D", glow: "#FFC4A6" },
  { id: "citrine", label: "Citrine", fill: "#E3B341", glow: "#FFE08A" },
] as const;

export type GemId = (typeof GEMS)[number]["id"];

export type VaultDifficulty = "spark" | "glow" | "blaze";

export type VaultConfig = {
  length: number;
  gemCount: number;
  tries: number;
  label: string;
};

export const VAULT_DIFFICULTY: Record<VaultDifficulty, VaultConfig> = {
  spark: { length: 3, gemCount: 4, tries: 8, label: "Spark lock" },
  glow: { length: 4, gemCount: 6, tries: 10, label: "Glow lock" },
  blaze: { length: 5, gemCount: 6, tries: 12, label: "Blaze lock" },
};

export type Feedback = {
  exact: number;
  near: number;
};

export function randomCode(length: number, gemCount: number): GemId[] {
  const pool = GEMS.slice(0, gemCount);
  return Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)].id);
}

export function scoreGuess(secret: GemId[], guess: GemId[]): Feedback {
  const exact = secret.reduce(
    (n, gem, i) => n + (gem === guess[i] ? 1 : 0),
    0,
  );
  const secretLeft: Record<string, number> = {};
  const guessLeft: Record<string, number> = {};
  secret.forEach((gem, i) => {
    if (gem === guess[i]) return;
    secretLeft[gem] = (secretLeft[gem] ?? 0) + 1;
    guessLeft[guess[i]] = (guessLeft[guess[i]] ?? 0) + 1;
  });
  let near = 0;
  for (const gem of Object.keys(guessLeft)) {
    near += Math.min(guessLeft[gem] ?? 0, secretLeft[gem] ?? 0);
  }
  return { exact, near };
}

export function gemById(id: GemId) {
  return GEMS.find((g) => g.id === id)!;
}
