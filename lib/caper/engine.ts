export type AnimalId =
  | "otter"
  | "bear"
  | "bunny"
  | "owl"
  | "hedgehog"
  | "cat";

export type Scarf = "ruby" | "teal" | "gold";
export type Treat = "cookie" | "pie" | "cupcake";

export type Suspect = {
  id: string;
  name: string;
  animal: AnimalId;
  animalLabel: string;
  scarf: Scarf;
  treat: Treat;
  portrait: string;
};

export type Clue = {
  id: string;
  text: string;
  match: (s: Suspect) => boolean;
};

export type KitchenSpot = {
  id: string;
  label: string;
  x: number;
  y: number;
  clue: Clue | null;
  flavor: string;
};

export const SCARF_HEX: Record<Scarf, string> = {
  ruby: "#E23D4F",
  teal: "#1FA89C",
  gold: "#E3B341",
};

export const TREAT_LABEL: Record<Treat, string> = {
  cookie: "cookie",
  pie: "pie",
  cupcake: "cupcake",
};

export const TREAT_EMOJI: Record<Treat, string> = {
  cookie: "🍪",
  pie: "🥧",
  cupcake: "🧁",
};

export const CAST: Omit<Suspect, "scarf" | "treat" | "id">[] = [
  {
    name: "Otto",
    animal: "otter",
    animalLabel: "otter",
    portrait: "/art/suspects/otter.jpg",
  },
  {
    name: "Bruno",
    animal: "bear",
    animalLabel: "bear",
    portrait: "/art/suspects/bear.jpg",
  },
  {
    name: "Bramble",
    animal: "bunny",
    animalLabel: "bunny",
    portrait: "/art/suspects/bunny.jpg",
  },
  {
    name: "Olive",
    animal: "owl",
    animalLabel: "owl",
    portrait: "/art/suspects/owl.jpg",
  },
  {
    name: "Hazel",
    animal: "hedgehog",
    animalLabel: "hedgehog",
    portrait: "/art/suspects/hedgehog.jpg",
  },
  {
    name: "Cinder",
    animal: "cat",
    animalLabel: "cat",
    portrait: "/art/suspects/cat.jpg",
  },
];

const SCARVES: Scarf[] = ["ruby", "teal", "gold"];
const TREATS: Treat[] = ["cookie", "pie", "cupcake"];

const SPOT_LAYOUT: Omit<KitchenSpot, "clue">[] = [
  {
    id: "oven",
    label: "Brick oven",
    x: 18,
    y: 38,
    flavor: "Hot air and a few burnt crumbs. Nobody waited here long.",
  },
  {
    id: "window",
    label: "Moon window",
    x: 58,
    y: 16,
    flavor: "Just moonlight and a smudge of flour. No story there.",
  },
  {
    id: "jars",
    label: "Spice jars",
    x: 40,
    y: 30,
    flavor: "Vanilla and cinnamon. The thief did not stop to season.",
  },
  {
    id: "flour",
    label: "Flour pile",
    x: 56,
    y: 42,
    flavor: "A mess, but no footprints you can trust.",
  },
  {
    id: "bowl",
    label: "Mixing bowl",
    x: 72,
    y: 40,
    flavor: "Dough still clinging to the spoon. A dead end.",
  },
  {
    id: "rack",
    label: "Cookie rack",
    x: 88,
    y: 32,
    flavor: "The cookies are still here. The pie is the missing one.",
  },
  {
    id: "tin",
    label: "Empty pie tin",
    x: 58,
    y: 74,
    flavor: "The tin is licked clean. That much you already knew.",
  },
  {
    id: "prints",
    label: "Pawprints",
    x: 28,
    y: 78,
    flavor: "Prints everywhere. Too many bakers have been through.",
  },
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function crypticClues(thief: Suspect, suspects: Suspect[]): Clue[] {
  const notAnimals = suspects.filter((s) => s.animal !== thief.animal);
  const decoyAnimal = notAnimals[Math.floor(Math.random() * notAnimals.length)];
  const otherScarf = SCARVES.find((c) => c !== thief.scarf)!;
  const otherTreat = TREATS.find((t) => t !== thief.treat)!;

  return [
    {
      id: "thread",
      text: `A ${thief.scarf} thread is snagged in the wood grain. Not a whole scarf — just a hint of color.`,
      match: (s) => s.scarf === thief.scarf,
    },
    {
      id: "crumb",
      text: `Tiny ${TREAT_LABEL[thief.treat]} crumbs, not ${TREAT_LABEL[otherTreat]}. Someone snacked while they stole.`,
      match: (s) => s.treat === thief.treat,
    },
    {
      id: "size",
      text: `These prints are the wrong size for a ${decoyAnimal.animalLabel}. Cross that baker off if you trust the dirt.`,
      match: (s) => s.animal !== decoyAnimal.animal,
    },
    {
      id: "smudge",
      text: `A floury smear that is not ${otherScarf}. The thief’s scarf left a different stain.`,
      match: (s) => s.scarf !== otherScarf,
    },
    {
      id: "wrapper",
      text: `A torn ${TREAT_LABEL[thief.treat]} wrapper, stuffed in a hurry.`,
      match: (s) => s.treat === thief.treat,
    },
  ];
}

export function dealCaper(): {
  suspects: Suspect[];
  thief: Suspect;
  spots: KitchenSpot[];
  searches: number;
} {
  const scarves = shuffle([...SCARVES, ...SCARVES]);
  const treats = shuffle([...TREATS, ...TREATS]);
  const suspects: Suspect[] = CAST.map((who, i) => ({
    ...who,
    id: who.animal,
    scarf: scarves[i],
    treat: treats[i],
  }));
  const thief = suspects[Math.floor(Math.random() * suspects.length)];
  const clues = shuffle(crypticClues(thief, suspects)).slice(0, 3);
  const layout = shuffle(SPOT_LAYOUT);
  const spots: KitchenSpot[] = layout.map((spot, i) => ({
    ...spot,
    clue: clues[i] ?? null,
  }));

  return {
    suspects,
    thief,
    spots,
    searches: 5,
  };
}

export function stillPossible(suspect: Suspect, clues: Clue[]) {
  return clues.every((c) => c.match(suspect));
}

export function caperStars(leftover: number): 1 | 2 | 3 {
  if (leftover >= 3) return 3;
  if (leftover >= 1) return 2;
  return 1;
}
