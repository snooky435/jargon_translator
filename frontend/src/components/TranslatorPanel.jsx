// The two side-by-side boxes: input on the left, translation on the right.
// On small screens (phones) they stack on top of each other.
//
// This component only SHOWS things. The page (Home.jsx) owns the data
// and passes it in as props.

export default function TranslatorPanel({
  direction,
  input,
  onInputChange,
  translation,
  loading,
  error,
  onTranslate,
}) {
  // Box titles change with the direction.
  const inputLabel = direction === "toPlain" ? "Corporate jargon" : "Plain English";
  const outputLabel = direction === "toPlain" ? "Plain English" : "Corporate jargon";

  const placeholder =
    direction === "toPlain"
      ? "Paste something like: Let's circle back and align on bandwidth..."
      : "Type something like: Can you send me the report by Friday?";

  // Ctrl+Enter (or Cmd+Enter on Mac) translates, like a shortcut.
  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      onTranslate();
    }
  }

  return (
    // 1 column on phones, 2 columns from medium screens ("md:") upward
    <div className="grid gap-4 md:grid-cols-2">
      {/* LEFT: input */}
      <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
        <label htmlFor="jargon-input" className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {inputLabel}
        </label>
        <textarea
          id="jargon-input"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-64 flex-1 resize-y bg-transparent text-base leading-relaxed text-gray-100 placeholder-gray-500 outline-none"
        />
      </div>

      {/* RIGHT: output */}
      <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4" aria-live="polite">
        <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{outputLabel}</span>

        <div className="min-h-64 flex-1 whitespace-pre-wrap text-base leading-relaxed">
          {loading && (
            <p className="animate-pulse text-gray-400">Consulting the synergy department… ⏳</p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
              <p className="font-semibold">Oops, that didn't work 😬</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && translation && <p className="text-gray-100">{translation}</p>}

          {!loading && !error && !translation && (
            <p className="text-gray-500">Your translation will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
