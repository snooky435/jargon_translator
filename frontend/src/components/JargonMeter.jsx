// An animated meter from 0 (plain English) to 100 (full corporate).
// Props:
//   score: a number from 0 to 100

import { useEffect, useState } from "react";

// A funny label for each range of scores (checked from top to bottom).
const LEVELS = [
  { max: 10, label: "Basically a human being", emoji: "🙂" },
  { max: 30, label: "Mildly corporate", emoji: "👔" },
  { max: 50, label: "Middle-management material", emoji: "📋" },
  { max: 70, label: "Certified thought leader", emoji: "🎤" },
  { max: 90, label: "Chief Synergy Officer", emoji: "📈" },
  { max: 100, label: "Synergy overload", emoji: "🤯" },
];

function getLevel(score) {
  return LEVELS.find((level) => score <= level.max) ?? LEVELS[LEVELS.length - 1];
}

export default function JargonMeter({ score }) {
  // Start the bar at 0, then move it to the real score a moment later.
  // Because the bar has a CSS "transition", it slides there smoothly.
  const [shownScore, setShownScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShownScore(score), 50);
    return () => clearTimeout(timer); // clean up if the score changes quickly
  }, [score]);

  const level = getLevel(score);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-gray-300">Jargon-o-Meter™</span>
        <span className="font-display text-lg font-semibold text-white">
          {level.emoji} {level.label} <span className="text-sm text-gray-400">({score}/100)</span>
        </span>
      </div>

      {/* The track (grey) with the coloured bar inside it */}
      <div
        className="mt-3 h-4 overflow-hidden rounded-full bg-white/10"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label="Jargon level"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-1000 ease-out"
          style={{ width: `${shownScore}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Plain English</span>
        <span>Full corporate</span>
      </div>
    </div>
  );
}
