import type { TrioCard } from "@/lib/trios/engine";
import { SUIT_META } from "@/lib/trios/engine";

export function TrioCardView({
  card,
  selected,
  dimmed,
  onClick,
}: {
  card: TrioCard;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}) {
  const meta = SUIT_META[card.suit];
  const face =
    card.rank === "A" ||
    card.rank === "J" ||
    card.rank === "Q" ||
    card.rank === "K";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-0 overflow-hidden rounded-xl border-2 bg-white transition ${
        selected
          ? "border-[#F4C95D] shadow-[0_0_0_3px_rgba(244,201,93,0.4)]"
          : "border-[#d6c7b0]"
      } ${dimmed ? "opacity-40" : ""}`}
      aria-pressed={selected}
      aria-label={`${card.rank} of ${meta.label}`}
    >
      <Corner rank={card.rank} glyph={meta.glyph} color={meta.color} />
      <Corner rank={card.rank} glyph={meta.glyph} color={meta.color} flip />
      <div className="absolute inset-0 grid place-items-center">
        {face ? (
          <div className="flex items-center gap-0.5 leading-none">
            <span
              className="font-display text-2xl sm:text-3xl"
              style={{ color: meta.color }}
            >
              {card.rank}
            </span>
            <span className="text-2xl sm:text-3xl" style={{ color: meta.color }}>
              {meta.glyph}
            </span>
          </div>
        ) : (
          <PipField rank={card.rankValue} glyph={meta.glyph} color={meta.color} />
        )}
      </div>
    </button>
  );
}

function Corner({
  rank,
  glyph,
  color,
  flip,
}: {
  rank: string;
  glyph: string;
  color: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`absolute flex flex-col items-center leading-none ${
        flip ? "right-1 bottom-1 rotate-180" : "left-1 top-1"
      }`}
      style={{ color }}
    >
      <span className="text-[11px] font-black sm:text-xs">{rank}</span>
      <span className="text-xs leading-none sm:text-sm">{glyph}</span>
    </div>
  );
}

function PipField({
  rank,
  glyph,
  color,
}: {
  rank: number;
  glyph: string;
  color: string;
}) {
  if (rank >= 8) {
    return (
      <div className="flex items-center gap-0.5 leading-none" style={{ color }}>
        <span className="font-display text-xl sm:text-2xl">{rank}</span>
        <span className="text-xl sm:text-2xl">{glyph}</span>
      </div>
    );
  }
  const cols = rank <= 3 ? 1 : 2;
  return (
    <div
      className={`grid place-items-center ${
        cols === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
      style={{ color }}
    >
      {Array.from({ length: rank }, (_, i) => (
        <span key={i} className="text-lg leading-none sm:text-2xl">
          {glyph}
        </span>
      ))}
    </div>
  );
}
