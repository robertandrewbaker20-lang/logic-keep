export type GameSlug = "getaway" | "trios" | "vault" | "caper";

export type GameMeta = {
  slug: GameSlug;
  title: string;
  tagline: string;
  how: string;
  cover: string;
  accent: string;
  accentSoft: string;
  door: "gold" | "teal" | "coral" | "plum";
};

export const GAMES: GameMeta[] = [
  {
    slug: "getaway",
    title: "Golden Getaway",
    tagline: "Slide Teslas and semis. Free the gold Tesla.",
    how: "Drag each vehicle only the way it faces. Get the gold Tesla out the glowing gate on the right. The other cars stay on the lot as blockers.",
    cover: "/art/games/getaway.jpg",
    accent: "#E3B341",
    accentSoft: "rgba(244, 201, 93, 0.18)",
    door: "gold",
  },
  {
    slug: "trios",
    title: "Trio Sight",
    tagline: "A real deck. Find three that belong together.",
    how: "Hearts, diamonds, spades, clubs. A Trio is three of a kind, or three in a row of the same suit.",
    cover: "/art/games/trios.jpg",
    accent: "#2EC4B6",
    accentSoft: "rgba(46, 196, 182, 0.16)",
    door: "teal",
  },
  {
    slug: "vault",
    title: "Color Vault",
    tagline: "Crack Pip’s secret gem code.",
    how: "Guess the hidden gems. Gold key = right gem, right place. Silver key = right gem, wrong place.",
    cover: "/art/games/vault.jpg",
    accent: "#7B5EA7",
    accentSoft: "rgba(123, 94, 167, 0.18)",
    door: "plum",
  },
  {
    slug: "caper",
    title: "Cookie Caper",
    tagline: "You and Pip vs. the pastry thief.",
    how: "Tap the kitchen to hunt for clues. Pip will not cross anyone off. Read the notebook, decide who still fits, and accuse.",
    cover: "/art/games/caper.jpg",
    accent: "#FF6B57",
    accentSoft: "rgba(255, 107, 87, 0.16)",
    door: "coral",
  },
];

export function gameBySlug(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
