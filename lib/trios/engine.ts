export const SUITS = ["hearts", "diamonds", "spades", "clubs"] as const;
export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export type TrioCard = {
  id: string;
  suit: Suit;
  rank: Rank;
  rankValue: number;
};

export const SUIT_META: Record<
  Suit,
  { glyph: string; label: string; color: string }
> = {
  hearts: { glyph: "♥", label: "hearts", color: "#DC2626" },
  diamonds: { glyph: "♦", label: "diamonds", color: "#DC2626" },
  spades: { glyph: "♠", label: "spades", color: "#111827" },
  clubs: { glyph: "♣", label: "clubs", color: "#111827" },
};

export function fullDeck(): TrioCard[] {
  const cards: TrioCard[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank, i) => {
      cards.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
        rankValue: i + 1,
      });
    });
  });
  return cards;
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function isThreeOfAKind(a: TrioCard, b: TrioCard, c: TrioCard) {
  return a.rank === b.rank && b.rank === c.rank;
}

function consecutive(values: number[]) {
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[0] + 1 === sorted[1] && sorted[1] + 1 === sorted[2];
}

function isSuitRun(a: TrioCard, b: TrioCard, c: TrioCard) {
  if (new Set([a.suit, b.suit, c.suit]).size !== 1) return false;
  const plain = [a.rankValue, b.rankValue, c.rankValue];
  if (consecutive(plain)) return true;
  const aceHigh = [a, b, c].map((card) =>
    card.rank === "A" ? 14 : card.rankValue,
  );
  return consecutive(aceHigh);
}

export function isTrio(a: TrioCard, b: TrioCard, c: TrioCard) {
  return isThreeOfAKind(a, b, c) || isSuitRun(a, b, c);
}

export function findTrios(board: TrioCard[]): [TrioCard, TrioCard, TrioCard][] {
  const found: [TrioCard, TrioCard, TrioCard][] = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isTrio(board[i], board[j], board[k])) {
          found.push([board[i], board[j], board[k]]);
        }
      }
    }
  }
  return found;
}

export function dealBoard(minCards = 12): { board: TrioCard[]; deck: TrioCard[] } {
  for (let attempt = 0; attempt < 40; attempt++) {
    const shuffled = shuffle(fullDeck());
    const board = shuffled.slice(0, minCards);
    const deck = shuffled.slice(minCards);
    if (findTrios(board).length > 0) return { board, deck };
  }
  const shuffled = shuffle(fullDeck());
  return { board: shuffled.slice(0, minCards), deck: shuffled.slice(minCards) };
}

export function replaceTrio(
  board: TrioCard[],
  ids: string[],
  deck: TrioCard[],
): { board: TrioCard[]; deck: TrioCard[] } {
  const remaining = board.filter((c) => !ids.includes(c.id));
  const need = Math.max(0, 12 - remaining.length);
  return {
    board: [...remaining, ...deck.slice(0, need)],
    deck: deck.slice(need),
  };
}
