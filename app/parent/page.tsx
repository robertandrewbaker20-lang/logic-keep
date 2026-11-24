"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export default function ParentPage() {
  const { progress, isLoaded, resetProgress } = useProgress();

  if (!isLoaded) return null;

  return (
    <div className="min-h-dvh bg-[#2A1B4A] p-6 text-[#FFF6E8]">
      <div className="keep-card mx-auto max-w-lg p-6 text-[#1C1630] sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-wider text-[#7B5EA7]">
          Parent tools
        </p>
        <h1 className="font-display mt-1 text-4xl">Logic Keep</h1>
        <p className="mt-3 text-[#3A3358]">
          Progress lives only in this browser. Reset if a sibling wants a fresh
          castle, or if something feels stuck.
        </p>
        <pre className="mt-4 overflow-auto rounded-2xl bg-[#fff6e8] p-4 text-xs">
          {JSON.stringify(
            {
              name: progress.childName,
              getaway: progress.getaway,
              trios: progress.trios,
              vault: progress.vault,
              caper: progress.caper,
            },
            null,
            2,
          )}
        </pre>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="rounded-full bg-[#FF6B57] px-5 py-3 font-extrabold text-white"
            onClick={resetProgress}
          >
            Reset all progress
          </button>
          <Link href="/" className="btn-gold px-5 py-3">
            Back to the keep
          </Link>
        </div>
      </div>
    </div>
  );
}
