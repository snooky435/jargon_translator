// A short page explaining the project, dressed up like a very serious company.
import StockPhoto from "../components/StockPhoto.jsx";
import stockPhotos from "../data/stockPhotos.js";

// Our "leadership team". The titles are the joke, not the people.
const LEADERSHIP = [
  { ...stockPhotos.sternSuit },
  {
    ...stockPhotos.thumbsUp,
    title: "VP of Circling Back",
    caption: "Has circled back so many times he is now technically a circle.",
  },
  {
    ...stockPhotos.whiteboardMan,
    title: "Head of Sticky Note Operations",
    caption: "Moved one sticky note 4 cm to the right. Called it a pivot.",
  },
];

const VALUES = [
  { name: "Synergy", meaning: "Working together. But longer." },
  { name: "Transparency", meaning: "We will tell you everything, after it has already happened." },
  { name: "Agility", meaning: "We change direction often, mostly by accident." },
  { name: "Bandwidth", meaning: "We never have any. Please don't ask." },
];

export default function About() {
  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">About Us</p>
        <h1 className="font-display text-4xl font-bold text-white">A Mission-Critical Mission</h1>
        <p className="text-gray-300">
          Ever read an email three times and still had no idea what it meant? The Jargon Translator turns
          corporate-speak into plain English, and plain English into corporate-speak for when you need to
          sound like you've been &ldquo;synergizing deliverables&rdquo; all quarter.
        </p>
        <p className="text-gray-300">
          Built at a hackathon. The backend (Flask + an AI model) does the translating, and this React
          front end makes it look expensive.
        </p>
      </section>

      <section>
        <h2 className="font-display text-3xl font-bold text-white">Our Leadership</h2>
        <p className="mt-1 text-gray-400">Visionaries. Thought leaders. Frequent users of the word &ldquo;learnings.&rdquo;</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERSHIP.map((person) => (
            <StockPhoto key={person.title} photo={person} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-bold text-white">Our Core Values</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div key={value.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-display text-xl font-semibold text-violet-300">{value.name}</p>
              <p className="mt-1 text-gray-300">{value.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-sm text-gray-500">No paradigms were shifted in the making of this website.</p>
    </div>
  );
}
