// An on/off switch for Brutally Honest Mode.
// When it's on, the translation says what people REALLY mean,
// and the page shows the hidden meaning of each jargon term.
//
// Props:
//   enabled:  true or false
//   onChange: function to call with the new true/false value

export default function BrutalModeToggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={
        "flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border p-4 text-left transition " +
        (enabled
          ? "border-rose-500/50 bg-rose-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10")
      }
    >
      <span>
        <span className="block text-sm font-semibold text-gray-200">🔥 Brutally Honest Mode</span>
        <span className="block text-xs text-gray-400">
          {enabled ? "No filter. HR has been notified." : "Reveal what they REALLY mean."}
        </span>
      </span>

      {/* The little sliding switch */}
      <span
        className={
          "relative h-6 w-11 shrink-0 rounded-full transition " + (enabled ? "bg-rose-500" : "bg-gray-600")
        }
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all " +
            (enabled ? "left-5" : "left-0.5")
          }
        />
      </span>
    </button>
  );
}
