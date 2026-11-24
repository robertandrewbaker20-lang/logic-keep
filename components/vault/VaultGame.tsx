"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  GEMS,
  VAULT_DIFFICULTY,
  gemById,
  randomCode,
  scoreGuess,
  type GemId,
  type VaultDifficulty,
} from "@/lib/vault/engine";
import { playSet, playTap, playWin, playWrong } from "@/lib/sound";
import { burstWin } from "@/lib/confetti";
import { HowTo } from "../HowTo";
import { WinModal } from "../WinModal";

type Props = {
  onWin: (remaining: number) => void;
  showHelp: boolean;
  onCloseHelp: () => void;
};

type Row = {
  guess: GemId[];
  exact: number;
  near: number;
};

export function VaultGame({ onWin, showHelp, onCloseHelp }: Props) {
  const [difficulty, setDifficulty] = useState<VaultDifficulty>("glow");
  const config = VAULT_DIFFICULTY[difficulty];
  const gems = GEMS.slice(0, config.gemCount);
  const [secret, setSecret] = useState<GemId[]>(() =>
    randomCode(config.length, config.gemCount),
  );
  const [current, setCurrent] = useState<GemId[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [parentMode, setParentMode] = useState(false);

  const remaining = config.tries - rows.length;

  function fresh(nextDiff: VaultDifficulty = difficulty, code?: GemId[]) {
    const cfg = VAULT_DIFFICULTY[nextDiff];
    setDifficulty(nextDiff);
    setSecret(code ?? randomCode(cfg.length, cfg.gemCount));
    setCurrent([]);
    setRows([]);
    setWon(false);
    setLost(false);
    setReveal(false);
  }

  function pick(id: GemId) {
    if (won || lost) return;
    if (current.length >= config.length) return;
    playTap();
    setCurrent((c) => [...c, id]);
  }

  function backspace() {
    setCurrent((c) => c.slice(0, -1));
  }

  function submit() {
    if (current.length !== config.length || won || lost) return;
    const fb = scoreGuess(secret, current);
    const row = { guess: current, ...fb };
    const nextRows = [...rows, row];
    setRows(nextRows);
    setCurrent([]);
    if (fb.exact === config.length) {
      setWon(true);
      playWin();
      burstWin();
      onWin(config.tries - nextRows.length);
    } else if (nextRows.length >= config.tries) {
      setLost(true);
      playWrong();
    } else if (fb.exact > 0) {
      playSet();
    } else {
      playWrong();
    }
  }

  const stars = won
    ? remaining >= Math.ceil(config.tries / 2)
      ? 3
      : remaining >= 2
        ? 2
        : 1
    : 0;

  return (
    <div>
      {showHelp ? (
        <HowTo
          title="Color Vault"
          body="Guess Pip’s hidden gem code. After each try you’ll see a row of keys. Gold key = right gem in the right place. Silver key = right gem, wrong place. The keys do not say which gem is which — that’s the puzzle."
          onClose={onCloseHelp}
        />
      ) : null}

      {won ? (
        <WinModal
          title="Vault open!"
          message={`You cracked it with ${remaining} tr${remaining === 1 ? "y" : "ies"} still in the bag.`}
          stars={stars}
          primary={{ label: "Another lock", onClick: () => fresh() }}
        />
      ) : null}

      {lost ? (
        <WinModal
          title="So close"
          message="The vault held this time. Peek at the code, then try a new lock."
          primary={{ label: "New lock", onClick: () => fresh() }}
          secondary={{
            label: "Show the code",
            onClick: () => {
              setReveal(true);
              setLost(false);
            },
          }}
        />
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(VAULT_DIFFICULTY) as VaultDifficulty[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => fresh(id)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold ${
              difficulty === id ? "bg-[#F4C95D] text-[#2A1B4A]" : "btn-ghost"
            }`}
          >
            {VAULT_DIFFICULTY[id].label}
          </button>
        ))}
        <button
          type="button"
          className="btn-ghost ml-auto inline-flex h-10 items-center gap-2 px-4 text-sm"
          onClick={() => setParentMode((p) => !p)}
        >
          {parentMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          Grown-up sets the code
        </button>
      </div>

      {parentMode ? (
        <ParentSetter
          length={config.length}
          gems={gems.map((g) => g.id)}
          onSet={(code) => {
            fresh(difficulty, code);
            setParentMode(false);
          }}
        />
      ) : null}

      <div className="keep-card mx-auto max-w-md overflow-hidden p-4 text-[#1C1630] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-2xl">Tries left {remaining}</div>
          {(reveal || lost) && (
            <div className="flex gap-1">
              {secret.map((id, i) => (
                <Gem key={`${id}-${i}`} id={id} size={28} />
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {rows.map((row, i) => (
            <div key={i} className="rounded-2xl bg-[#fff6e8] p-2.5">
              <div className="flex items-center gap-1.5">
                {row.guess.map((id, gi) => (
                  <Gem key={`${i}-${gi}`} id={id} size={36} />
                ))}
              </div>
              <div className="mt-2">
                <Keys exact={row.exact} near={row.near} slots={config.length} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: config.length }, (_, i) => (
            <div
              key={i}
              className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-[#1C1630]/20 bg-white"
            >
              {current[i] ? <Gem id={current[i]} size={42} /> : null}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {gems.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => pick(g.id)}
              className="grid h-14 w-14 place-items-center rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${g.glow}, ${g.fill})`,
                boxShadow: `0 8px 16px ${g.fill}55`,
              }}
              aria-label={g.label}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            className="rounded-full border border-[#1C1630]/15 px-5 py-2.5 font-extrabold"
            onClick={backspace}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-gold px-6 py-2.5"
            onClick={submit}
            disabled={current.length !== config.length}
          >
            Try lock
          </button>
        </div>
      </div>
    </div>
  );
}

function Gem({ id, size }: { id: GemId; size: number }) {
  const g = gemById(id);
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${g.glow}, ${g.fill})`,
        boxShadow: `0 6px 12px ${g.fill}66`,
      }}
    />
  );
}

function Keys({
  exact,
  near,
}: {
  exact: number;
  near: number;
  slots: number;
}) {
  if (exact === 0 && near === 0) {
    return (
      <div className="flex min-w-[7.5rem] items-center text-xs font-extrabold text-[#8A8275]">
        No matches
      </div>
    );
  }
  return (
    <div
      className="flex min-w-[7.5rem] flex-nowrap items-center gap-1.5"
      aria-label={`${exact} gold, ${near} silver`}
    >
      {Array.from({ length: exact }, (_, i) => (
        <span
          key={`g${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-[#F4C95D] px-2 py-1 text-[10px] font-black text-[#5A3B00] shadow-[0_0_0_1px_#C4922A]"
        >
          <KeyIcon fill="#C4922A" />
          Gold
        </span>
      ))}
      {Array.from({ length: near }, (_, i) => (
        <span
          key={`s${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-[#E8EEF4] px-2 py-1 text-[10px] font-black text-[#4B5563] shadow-[0_0_0_1px_#94A3B8]"
        >
          <KeyIcon fill="#94A3B8" />
          Silver
        </span>
      ))}
    </div>
  );
}

function KeyIcon({ fill }: { fill: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden>
      <circle cx="6" cy="6" r="3.2" fill="none" stroke={fill} strokeWidth="2" />
      <path d="M8.4 8.4 14 14" stroke={fill} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 14h2" stroke={fill} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ParentSetter({
  length,
  gems,
  onSet,
}: {
  length: number;
  gems: GemId[];
  onSet: (code: GemId[]) => void;
}) {
  const [code, setCode] = useState<GemId[]>([]);
  return (
    <div className="mb-4 rounded-3xl bg-white/10 p-4">
      <p className="mb-2 font-extrabold">Tap {length} gems, then hide the code.</p>
      <div className="mb-3 flex gap-2">
        {Array.from({ length }, (_, i) => (
          <div
            key={i}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
          >
            {code[i] ? <Gem id={code[i]} size={28} /> : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {gems.map((id) => (
          <button key={id} type="button" onClick={() => code.length < length && setCode((c) => [...c, id])}>
            <Gem id={id} size={36} />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-gold mt-3 px-5 py-2"
        disabled={code.length !== length}
        onClick={() => onSet(code)}
      >
        Hide code and play
      </button>
    </div>
  );
}
