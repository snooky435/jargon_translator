// In Brutally Honest Mode: a list of every jargon term that was found,
// with what it REALLY means.
// Props:
//   terms: [ { term, meaning } ] (the flaggedTerms from the translation)

import brutalMeanings from "../data/brutalMeanings.json";

export default function BrutalSubtext({ terms }) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-4">
      <p className="font-display text-xl font-semibold text-rose-300">🔥 What they REALLY mean</p>

      {terms.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">
          No jargon detected. Either this person is honest, or they're hiding it really well.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {terms.map((item) => (
            <li key={item.term} className="text-sm">
              <span className="font-semibold text-white">&ldquo;{item.term}&rdquo;</span>
              <span className="text-gray-500"> → </span>
              {/* Use our brutal meaning if we have one, otherwise the normal meaning */}
              <span className="text-rose-200">
                {brutalMeanings[item.term.toLowerCase()] ?? item.meaning}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
