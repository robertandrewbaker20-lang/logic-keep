export type Orientation = "h" | "v";

export type Vehicle = {
  id: string;
  row: number;
  col: number;
  length: number;
  orientation: Orientation;
  hero: boolean;
  fill: string;
  shade: string;
  light: string;
  glass: string;
};

export type LevelDef = {
  id: string;
  name: string;
  pack: "spark" | "glow" | "blaze";
  blurb: string;
  grid: string[];
  par: number;
};

export type Move = { id: string; delta: number };

const SIZE = 6;
const EXIT_ROW = 2;

const PAINT: Record<
  string,
  { fill: string; shade: string; light: string; glass: string }
> = {
  X: { fill: "#E8C547", shade: "#9A7A1E", light: "#F8E7A0", glass: "#1B2430" },
  A: { fill: "#C41E3A", shade: "#7A1024", light: "#F07189", glass: "#1A1A1A" },
  B: { fill: "#1F6F8B", shade: "#0E3A4A", light: "#5EB3C9", glass: "#0B1C24" },
  C: { fill: "#2F2F33", shade: "#111114", light: "#6A6A70", glass: "#111111" },
  D: { fill: "#3D5A80", shade: "#1B2E45", light: "#7A9CC6", glass: "#0F1A28" },
  E: { fill: "#FFFFFF", shade: "#B8B8B8", light: "#FFFFFF", glass: "#1C1C1C" },
  F: { fill: "#1B1B1E", shade: "#050506", light: "#4A4A50", glass: "#111111" },
  G: { fill: "#0B6623", shade: "#053816", light: "#3CB371", glass: "#082014" },
  H: { fill: "#4C1D95", shade: "#2A1060", light: "#8B5CF6", glass: "#14082A" },
  I: { fill: "#EA580C", shade: "#9A3412", light: "#FDBA74", glass: "#1C1008" },
  J: { fill: "#0369A1", shade: "#0C4A6E", light: "#7DD3FC", glass: "#082030" },
  K: { fill: "#A16207", shade: "#713F12", light: "#FDE68A", glass: "#1A1408" },
  L: { fill: "#BE185D", shade: "#9D174D", light: "#F9A8D4", glass: "#1A0810" },
};

export function boardSize() {
  return SIZE;
}

export function exitRow() {
  return EXIT_ROW;
}

export function parseGrid(grid: string[]): Vehicle[] {
  if (grid.length !== SIZE || grid.some((row) => row.length !== SIZE)) {
    throw new Error("Golden Getaway grids must be 6x6");
  }
  const cells = new Map<string, { r: number; c: number }[]>();
  grid.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === ".") return;
      const list = cells.get(ch) ?? [];
      list.push({ r, c });
      cells.set(ch, list);
    });
  });

  const vehicles: Vehicle[] = [];
  for (const [id, spots] of cells) {
    spots.sort((a, b) => a.r - b.r || a.c - b.c);
    const sameRow = spots.every((s) => s.r === spots[0].r);
    const sameCol = spots.every((s) => s.c === spots[0].c);
    if (!sameRow && !sameCol) {
      throw new Error(`Vehicle ${id} is not a straight car`);
    }
    const orientation: Orientation = sameRow ? "h" : "v";
    const paint = PAINT[id] ?? PAINT.A;
    vehicles.push({
      id,
      row: spots[0].r,
      col: spots[0].c,
      length: spots.length,
      orientation,
      hero: id === "X",
      fill: paint.fill,
      shade: paint.shade,
      light: paint.light,
      glass: paint.glass,
    });
  }
  if (!vehicles.some((v) => v.hero)) {
    throw new Error("Level is missing the golden car (X)");
  }
  return vehicles;
}

export function occupancy(
  vehicles: Vehicle[],
  ignoreId?: string,
): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null),
  );
  for (const v of vehicles) {
    if (v.id === ignoreId) continue;
    for (let i = 0; i < v.length; i++) {
      const r = v.orientation === "h" ? v.row : v.row + i;
      const c = v.orientation === "h" ? v.col + i : v.col;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) continue;
      grid[r][c] = v.id;
    }
  }
  return grid;
}

export function slideRange(v: Vehicle, vehicles: Vehicle[]) {
  const grid = occupancy(vehicles, v.id);
  let min = 0;
  let max = 0;
  if (v.orientation === "h") {
    while (v.col + min - 1 >= 0 && grid[v.row][v.col + min - 1] === null) min -= 1;
    while (
      v.col + v.length + max < SIZE &&
      grid[v.row][v.col + v.length + max] === null
    ) {
      max += 1;
    }
    if (v.hero && v.row === EXIT_ROW) {
      let clear = true;
      for (let c = v.col + v.length; c < SIZE; c++) {
        if (grid[v.row][c] !== null) {
          clear = false;
          break;
        }
      }
      if (clear) max = SIZE - v.col - v.length + 1;
    }
  } else {
    while (v.row + min - 1 >= 0 && grid[v.row + min - 1][v.col] === null) min -= 1;
    while (
      v.row + v.length + max < SIZE &&
      grid[v.row + v.length + max][v.col] === null
    ) {
      max += 1;
    }
  }
  return { min, max };
}

export function applyMove(vehicles: Vehicle[], move: Move): Vehicle[] {
  return vehicles.map((v) => {
    if (v.id !== move.id) return v;
    if (v.orientation === "h") return { ...v, col: v.col + move.delta };
    return { ...v, row: v.row + move.delta };
  });
}

export function isWon(vehicles: Vehicle[]) {
  const hero = vehicles.find((v) => v.hero);
  if (!hero || hero.orientation !== "h" || hero.row !== EXIT_ROW) return false;
  return hero.col + hero.length > SIZE;
}

export function pathIsClear(vehicles: Vehicle[]) {
  const hero = vehicles.find((v) => v.hero);
  if (!hero || hero.row !== EXIT_ROW) return false;
  const { max } = slideRange(hero, vehicles);
  return hero.col + hero.length + max > SIZE;
}

function stateKey(vehicles: Vehicle[]) {
  return vehicles
    .map((v) => `${v.id}:${v.row}:${v.col}`)
    .sort()
    .join("|");
}

export function solve(vehicles: Vehicle[]): Move[] | null {
  if (isWon(vehicles)) return [];
  const start = vehicles.map((v) => ({ ...v }));
  const queue: { vs: Vehicle[]; path: Move[] }[] = [{ vs: start, path: [] }];
  const seen = new Set([stateKey(start)]);
  let head = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    for (const v of cur.vs) {
      const { min, max } = slideRange(v, cur.vs);
      for (let delta = min; delta <= max; delta++) {
        if (delta === 0) continue;
        const move = { id: v.id, delta };
        const next = applyMove(cur.vs, move);
        const key = stateKey(next);
        if (seen.has(key)) continue;
        const path = [...cur.path, move];
        if (isWon(next)) return path;
        seen.add(key);
        queue.push({ vs: next, path });
      }
    }
    if (seen.size > 120000) return null;
  }
  return null;
}

export function shortestLength(vehicles: Vehicle[]) {
  return solve(vehicles)?.length ?? 0;
}

export function hintMove(vehicles: Vehicle[]): Move | null {
  const path = solve(vehicles);
  return path && path.length ? path[0] : null;
}
