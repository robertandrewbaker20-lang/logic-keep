import type { Vehicle } from "@/lib/getaway/engine";

export function VehicleArt({ v }: { v: Vehicle }) {
  const vertical = v.orientation === "v";
  const semi = v.length >= 3;
  const long = semi ? 300 : 210;
  const short = 88;
  const vb = vertical ? `0 0 ${short} ${long}` : `0 0 ${long} ${short}`;

  return (
    <svg
      viewBox={vb}
      className="h-full w-full"
      aria-hidden
      preserveAspectRatio="none"
    >
      {semi ? (
        <Semi v={v} vertical={vertical} long={long} short={short} />
      ) : (
        <Tesla v={v} vertical={vertical} long={long} short={short} />
      )}
    </svg>
  );
}

function Tesla({
  v,
  vertical,
  long,
  short,
}: {
  v: Vehicle;
  vertical: boolean;
  long: number;
  short: number;
}) {
  const body = vertical
    ? { x: 8, y: 6, w: short - 16, h: long - 12, rx: 18 }
    : { x: 6, y: 10, w: long - 12, h: short - 20, rx: 22 };
  const glass = vertical
    ? { x: 18, y: 28, w: short - 36, h: long - 56, rx: 10 }
    : { x: 28, y: 20, w: long - 56, h: short - 40, rx: 10 };
  const barA = vertical
    ? { x: 16, y: 10, w: short - 32, h: 7, rx: 3 }
    : { x: 10, y: 18, w: 8, h: short - 36, rx: 3 };
  const barB = vertical
    ? { x: 16, y: long - 18, w: short - 32, h: 7, rx: 3 }
    : { x: long - 18, y: 18, w: 8, h: short - 36, rx: 3 };

  return (
    <g>
      <rect {...body} fill={v.shade} />
      <rect
        x={body.x + 2}
        y={body.y + 2}
        width={body.w - 4}
        height={body.h - 4}
        rx={body.rx - 2}
        fill={v.fill}
      />
      <rect
        x={body.x + 3}
        y={body.y + 3}
        width={body.w - 6}
        height={(body.h - 6) / 2}
        rx={body.rx - 4}
        fill={v.light}
        opacity={0.35}
      />
      <rect {...glass} fill={v.glass} opacity={0.92} />
      <rect {...barA} fill={v.hero ? "#F4C95D" : "#F8FAFC"} />
      <rect {...barB} fill={v.hero ? "#F4C95D" : "#EF4444"} opacity={0.9} />
      <WheelsTopDown vertical={vertical} long={long} short={short} count={2} />
    </g>
  );
}

function Semi({
  v,
  vertical,
  long,
  short,
}: {
  v: Vehicle;
  vertical: boolean;
  long: number;
  short: number;
}) {
  const cab = vertical
    ? { x: 10, y: 6, w: short - 20, h: 70, rx: 10 }
    : { x: 6, y: 12, w: 72, h: short - 24, rx: 10 };
  const trailer = vertical
    ? { x: 8, y: 72, w: short - 16, h: long - 80, rx: 8 }
    : { x: 70, y: 10, w: long - 78, h: short - 20, rx: 8 };
  const window = vertical
    ? { x: 18, y: 14, w: short - 36, h: 28, rx: 6 }
    : { x: 14, y: 22, w: 36, h: short - 44, rx: 6 };

  return (
    <g>
      <rect {...trailer} fill={v.shade} />
      <rect
        x={trailer.x + 3}
        y={trailer.y + 3}
        width={trailer.w - 6}
        height={trailer.h - 6}
        rx={6}
        fill={v.fill}
      />
      {vertical
        ? [0.28, 0.5, 0.72].map((p) => (
            <rect
              key={p}
              x={trailer.x + 8}
              y={trailer.y + trailer.h * p}
              width={trailer.w - 16}
              height={4}
              rx={2}
              fill={v.shade}
              opacity={0.45}
            />
          ))
        : [0.28, 0.5, 0.72].map((p) => (
            <rect
              key={p}
              x={trailer.x + trailer.w * p}
              y={trailer.y + 8}
              width={4}
              height={trailer.h - 16}
              rx={2}
              fill={v.shade}
              opacity={0.45}
            />
          ))}
      <rect {...cab} fill={v.shade} />
      <rect
        x={cab.x + 2}
        y={cab.y + 2}
        width={cab.w - 4}
        height={cab.h - 4}
        rx={8}
        fill={v.light}
      />
      <rect {...window} fill={v.glass} />
      <WheelsTopDown vertical={vertical} long={long} short={short} count={3} />
    </g>
  );
}

function WheelsTopDown({
  vertical,
  long,
  short,
  count,
}: {
  vertical: boolean;
  long: number;
  short: number;
  count: number;
}) {
  const along = Array.from({ length: count }, (_, i) => (i + 1) / (count + 1));
  return (
    <>
      {along.flatMap((p, i) => {
        if (vertical) {
          const y = long * p - 9;
          return [
            <rect key={`${i}a`} x={1} y={y} width={12} height={18} rx={4} fill="#111" />,
            <rect key={`${i}b`} x={short - 13} y={y} width={12} height={18} rx={4} fill="#111" />,
          ];
        }
        const x = long * p - 9;
        return [
          <rect key={`${i}a`} x={x} y={1} width={18} height={12} rx={4} fill="#111" />,
          <rect key={`${i}b`} x={x} y={short - 13} width={18} height={12} rx={4} fill="#111" />,
        ];
      })}
    </>
  );
}
