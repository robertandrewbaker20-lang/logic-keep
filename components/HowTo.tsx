"use client";

import { PipBadge } from "./PipBadge";

type Props = {
  title: string;
  body: string;
  onClose: () => void;
  cta?: string;
};

export function HowTo({ title, body, onClose, cta = "Let's play" }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1C1630]/70 p-4 backdrop-blur-sm">
      <div className="keep-card relative w-full max-w-lg p-6 text-[#1C1630] sm:p-8">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <PipBadge size={72} className="floaty" />
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm font-extrabold uppercase tracking-wider text-[#7B5EA7]">
            Pip says
          </p>
          <h2 className="font-display mt-1 text-3xl">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-[#3A3358]">{body}</p>
          <button type="button" className="btn-gold mt-6 px-8 py-3 text-lg" onClick={onClose}>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
