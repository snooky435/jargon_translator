// The main translator page. It keeps track of everything the user does
// (the text, the direction, the result...) and passes it to the components.

import { useState } from "react";
import { translate } from "../api.js";
import DirectionToggle from "../components/DirectionToggle.jsx";
import TranslatorPanel from "../components/TranslatorPanel.jsx";
import ToneSlider from "../components/ToneSlider.jsx";
import BrutalModeToggle from "../components/BrutalModeToggle.jsx";
import JargonMeter from "../components/JargonMeter.jsx";
import BrutalSubtext from "../components/BrutalSubtext.jsx";
import GmailPanel from "../components/GmailPanel.jsx";
import StockPhoto from "../components/StockPhoto.jsx";
import stockPhotos from "../data/stockPhotos.js";

// Which photos appear in the gallery at the bottom of the page, in order.
const GALLERY = [
  stockPhotos.whiteboardTeam,
  stockPhotos.whiteboardMan,
  stockPhotos.charts,
  stockPhotos.emptyRoom,
  stockPhotos.teamTable,
  stockPhotos.handshake,
];

// "Try an example" buttons: clicking one fills the input box.
const EXAMPLES = [
  {
    label: "The classic",
    direction: "toPlain",
    text: "Per my last email, let's circle back and align on bandwidth before EOD.",
  },
  {
    label: "The buzzword salad",
    direction: "toPlain",
    text: "Let's grab the low-hanging fruit and leverage our synergy to move the needle.",
  },
  {
    label: "Make me sound important",
    direction: "toCorporate",
    text: "Can we talk tomorrow about what to do next?",
  },
];

export default function Home() {
  // useState = a value React remembers. Changing it re-draws the page.
  const [direction, setDirection] = useState("toPlain");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null); // { translation, jargonScore, flaggedTerms }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(3); // slider: 1 (gentle) to 5 (maximum)
  const [brutal, setBrutal] = useState(false); // Brutally Honest Mode on/off
  // Remember whether the CURRENT result was made in brutal mode, so the
  // "What they REALLY mean" box doesn't appear just from flipping the switch.
  const [resultWasBrutal, setResultWasBrutal] = useState(false);
  const [notice, setNotice] = useState(""); // small info line, e.g. "Loaded “Quick sync?”"

  async function handleTranslate() {
    if (!input.trim()) {
      setError("Type or paste some text first.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const answer = await translate({ text: input, direction, strength, brutal });
      setResult(answer);
      setResultWasBrutal(brutal);
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      // "finally" runs whether it worked or not
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result?.translation) return;
    navigator.clipboard.writeText(result.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // reset the label after 1.5s
  }

  function handleClear() {
    setInput("");
    setResult(null);
    setError("");
    setNotice("");
  }

  // Swap (from Alex's page): the translation becomes the new input,
  // and the direction flips, so you can translate it back.
  function handleSwap() {
    if (!result?.translation) return;
    setInput(result.translation);
    setDirection(direction === "toPlain" ? "toCorporate" : "toPlain");
    setResult(null);
    setError("");
    setNotice("Swapped! Click Translate to go the other way.");
  }

  // Called by the Gmail panel when the user picks an email.
  function handleEmailLoaded(email) {
    setInput(email.body);
    setDirection("toPlain"); // emails are usually the jargon side
    setResult(null);
    setError("");
    setNotice(
      `Loaded “${email.subject}”` +
        (email.truncated ? " (trimmed to 10,000 characters)" : "") +
        ". Click Translate."
    );
    document.getElementById("jargon-input")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleDirectionChange(newDirection) {
    setDirection(newDirection);
    setResult(null); // the old translation no longer matches
    setError("");
  }

  function fillExample(example) {
    setDirection(example.direction);
    setInput(example.text);
    setResult(null);
    setError("");
  }

  return (
    <div className="space-y-6">
      {/* Hero: very formal title on the left, very serious stock photo on the right */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
            An Enterprise-Grade Communication Solution™
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            What are they <span className="italic text-violet-400">actually</span> saying?
          </h1>
          <p className="mt-4 text-gray-400">
            Paste corporate jargon, get plain English. Or go the other way and sound like a VP who has
            never once answered a question directly.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Trusted by 0 of the Fortune 500. Recommended by 4 out of 5 middle managers (the fifth was in a
            meeting).
          </p>
        </div>
        <StockPhoto photo={stockPhotos.highFive} />
      </section>

      {/* Fake "As seen in" bar */}
      <section className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-y border-white/10 py-4 font-display text-gray-500">
        <span className="text-xs uppercase tracking-widest">As definitely seen in</span>
        <span className="text-lg italic">The Bandwidth Journal</span>
        <span className="text-lg italic">Synergy Quarterly</span>
        <span className="text-lg italic">Circle Back Weekly</span>
        <span className="text-lg italic">Paradigm Shift Today</span>
      </section>

      {/* Alex's Gmail feature (hidden if Gmail isn't set up on the server) */}
      <GmailPanel onEmailLoaded={handleEmailLoaded} />

      <div className="flex justify-center">
        <DirectionToggle direction={direction} onChange={handleDirectionChange} />
      </div>

      {/* Settings: how strong + Brutally Honest Mode (stacked on phones) */}
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-stretch">
        <ToneSlider direction={direction} strength={strength} onChange={setStrength} />
        <BrutalModeToggle enabled={brutal} onChange={setBrutal} />
      </div>

      <TranslatorPanel
        direction={direction}
        input={input}
        onInputChange={setInput}
        translation={result?.translation}
        loading={loading}
        error={error}
        onTranslate={handleTranslate}
      />

      {/* After a translation: the meter, and in brutal mode the hidden meanings */}
      {result && !loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <JargonMeter score={result.jargonScore} />
          {resultWasBrutal && <BrutalSubtext terms={result.flaggedTerms} />}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading}
          className="rounded-xl bg-violet-500 px-6 py-2.5 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Translating…" : "Translate"}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!result?.translation}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-gray-200 transition hover:bg-white/10 disabled:opacity-40"
        >
          {copied ? "Copied! ✅" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-gray-200 transition hover:bg-white/10"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSwap}
          disabled={!result?.translation}
          title="Use the translation as new input and flip the direction"
          className="rounded-xl border border-white/15 px-4 py-2.5 text-gray-200 transition hover:bg-white/10 disabled:opacity-40"
        >
          Swap ⇄
        </button>
        {notice ? (
          <span className="text-sm text-emerald-300">{notice}</span>
        ) : (
          <span className="text-xs text-gray-500">Tip: Ctrl + Enter translates</span>
        )}
      </div>

      {/* Example buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400">Try an example:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => fillExample(example)}
            className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-200 transition hover:bg-violet-500/20"
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Gallery of very real, very serious corporate moments */}
      <section className="pt-10">
        <h2 className="font-display text-3xl font-bold text-white">The Corporate Excellence Gallery</h2>
        <p className="mt-1 text-gray-400">Real moments from the modern workplace, professionally interpreted.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((photo) => (
            <StockPhoto key={photo.src} photo={photo} />
          ))}
        </div>
      </section>
    </div>
  );
}
