// A slider from 1 to 5 that sets HOW STRONG the translation is.
// The labels change with the direction:
//   Jargon -> Plain:   1 = still polite        ... 5 = completely blunt
//   Plain  -> Jargon:  1 = a little corporate  ... 5 = synergy overload
//
// Props:
//   direction: "toPlain" or "toCorporate"
//   strength:  a number from 1 to 5
//   onChange:  function to call with the new number

export const STRENGTH_LABELS = {
  toPlain: ["Polite", "Clear", "Direct", "Blunt", "Savage"],
  toCorporate: ["Business casual", "Middle manager", "Director", "VP", "Synergy overload"],
};

export default function ToneSlider({ direction, strength, onChange }) {
  const labels = STRENGTH_LABELS[direction];
  const heading = direction === "toPlain" ? "How plain?" : "How corporate?";

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor="strength-slider" className="text-sm font-semibold text-gray-300">
          {heading}
        </label>
        {/* Show the label of the current setting, e.g. "Director" */}
        <span className="font-display text-lg font-semibold text-violet-300">{labels[strength - 1]}</span>
      </div>

      <input
        id="strength-slider"
        type="range"
        min="1"
        max="5"
        step="1"
        value={strength}
        // The slider gives us text like "3", so turn it into the number 3.
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full cursor-pointer accent-violet-500"
      />

      {/* The weakest and strongest settings under each end of the slider */}
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>{labels[0]}</span>
        <span>{labels[4]}</span>
      </div>
    </div>
  );
}
