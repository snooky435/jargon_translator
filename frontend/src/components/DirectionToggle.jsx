// Two-button switch: "Jargon -> Plain English" or "Plain English -> Jargon".
// Props:
//   direction: "toPlain" or "toCorporate" (which one is selected)
//   onChange:  function to call with the new direction when clicked

const OPTIONS = [
  { value: "toPlain", label: "Jargon → Plain English" },
  { value: "toCorporate", label: "Plain English → Jargon" },
];

export default function DirectionToggle({ direction, onChange }) {
  return (
    <div
      role="group"
      aria-label="Translation direction"
      className="inline-flex rounded-full border border-white/10 bg-white/5 p-1"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === direction;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition " +
              (selected ? "bg-violet-500 text-white shadow" : "text-gray-400 hover:text-white")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
