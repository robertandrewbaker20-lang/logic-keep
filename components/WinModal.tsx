"use client";

import { PipBadge } from "./PipBadge";
import { Stars } from "./Stars";

type Props = {
  title: string;
  message: string;
  stars?: number;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
};

export function WinModal({ title, message, stars, primary, secondary }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1C1630]/70 p-4 backdrop-blur-sm">
      <div className="keep-card relative w-full max-w-md overflow-hidden p-6 text-center text-[#1C1630] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#F4C95D33,transparent_55%)]" />
        <div className="relative">
          <div className="mx-auto w-fit">
            <PipBadge size={88} className="floaty" />
          </div>
          <h2 className="font-display mt-4 text-4xl">{title}</h2>
          {typeof stars === "number" ? (
            <div className="mt-3 flex justify-center">
              <Stars value={stars} size={28} />
            </div>
          ) : null}
          <p className="mt-3 text-lg text-[#3A3358]">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" className="btn-gold px-7 py-3 text-lg" onClick={primary.onClick}>
              {primary.label}
            </button>
            {secondary ? (
              <button
                type="button"
                className="rounded-full border border-[#1C1630]/15 px-7 py-3 text-lg font-extrabold text-[#3A3358]"
                onClick={secondary.onClick}
              >
                {secondary.label}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
