// ALL communication with the backend lives in this file.
// The rest of the app only calls the exported functions below:
//   translate()                         -> translate text
//   getGmailStatus(), getInbox(),
//   getEmail(), signInToGmail(),
//   signOutOfGmail()                    -> Alex's Gmail features

import { analyzeJargon } from "./jargon.js";

// ---------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------

// true  = use fake answers (no backend needed, great for building the UI)
// false = call Alex's real Flask backend
export const USE_MOCK = true;

// Where the backend lives.
// Empty "" (the default) means "same address as this website". During
// development, Vite's proxy (see vite.config.js) forwards /api/... to
// Alex's backend on http://localhost:5001, which avoids CORS errors.
// To call a backend somewhere else, create frontend/.env containing e.g.:
//   VITE_API_URL=https://some-server.example.com
export const API_URL = import.meta.env.VITE_API_URL ?? "";

// Our app says "toPlain"/"toCorporate", but Alex's backend expects
// "to_plain"/"to_jargon" (see app.py and translator.py).
const DIRECTION_FOR_BACKEND = {
  toPlain: "to_plain",
  toCorporate: "to_jargon",
};

const BACKEND_DOWN_MESSAGE =
  "Can't reach the translator backend. Is it running? Start it with: python app.py";

// Wait a bit, to make mock mode feel like a real server.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------
// One helper for every real backend call
// ---------------------------------------------------------------
// Sends a request, reads the JSON answer, and turns every kind of
// failure into an Error with a friendly message.
async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    // fetch() itself fails when the server can't be reached at all.
    throw new Error(BACKEND_DOWN_MESSAGE);
  }

  // Alex's backend always answers with JSON. If we can't read JSON,
  // the backend is probably not running (Vite's proxy sends back an
  // empty error page instead).
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(BACKEND_DOWN_MESSAGE);
  }

  // Not OK (status 400, 401, 500...) -> use the backend's own error message.
  if (!response.ok) {
    throw new Error(data.error || `The server had a problem (error ${response.status}).`);
  }
  return data;
}

// ===============================================================
// TRANSLATION
// ===============================================================
// Input:
//   text:      what the user typed
//   direction: "toPlain" or "toCorporate"
//   strength:  1 (gentle) to 5 (maximum), from the slider
//   brutal:    true when Brutally Honest Mode is on
//   context:   "email", "slack"... (not used by the UI yet)
// Output: { translation, jargonScore, flaggedTerms }
// Throws an Error with a friendly message if something goes wrong.
export async function translate({ text, direction, strength = 3, brutal = false, context = "email" }) {
  // Our contract also has a "tone" field. We work it out from the settings.
  const tone = brutal ? "honest" : strength >= 4 ? "corporate" : "polite";

  const data = USE_MOCK
    ? await mockTranslate(text, direction, strength, brutal)
    : await requestJson("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          direction: DIRECTION_FOR_BACKEND[direction],
          // Alex's backend ignores these for now, but sending them is harmless.
          // Once he adds support, the slider and Brutally Honest Mode will
          // change the real translation too.
          tone,
          strength,
          brutal,
          context,
        }),
      });

  return fillInDefaults(data, text, direction);
}

// Make the answer safe to use, even if fields are missing.
function fillInDefaults(data, inputText, direction) {
  // Alex's backend calls it "result"; our contract calls it "translation".
  const translation = String(data.translation ?? data.result ?? "");

  // The "corporate" side of the conversation is what we score:
  // the input when translating jargon -> plain, the output otherwise.
  const corporateText = direction === "toPlain" ? inputText : translation;
  const local = analyzeJargon(corporateText);

  const jargonScore =
    typeof data.jargonScore === "number"
      ? Math.max(0, Math.min(100, Math.round(data.jargonScore)))
      : local.jargonScore;

  const flaggedTerms = Array.isArray(data.flaggedTerms) ? data.flaggedTerms : local.flaggedTerms;

  return { translation, jargonScore, flaggedTerms };
}

// ===============================================================
// GMAIL (Alex's routes in app.py: /api/me, /api/emails, /login, /logout)
// ===============================================================

// Is Gmail set up on the server, and is the user signed in?
// Returns: { configured, signedIn, email }
export async function getGmailStatus() {
  if (USE_MOCK) {
    await wait(300);
    return { configured: true, signedIn: mockSignedIn, email: "you@example.com" };
  }
  const data = await requestJson("/api/me");
  return { configured: data.configured, signedIn: data.signed_in, email: data.email ?? "" };
}

// The newest inbox emails.
// Returns: [ { id, from, subject, date, snippet } ]
export async function getInbox() {
  if (USE_MOCK) {
    await wait(700);
    return MOCK_EMAILS.map(({ body, ...summary }) => summary); // everything except the body
  }
  const data = await requestJson("/api/emails");
  return data.emails ?? [];
}

// One full email.
// Returns: { id, from, subject, body, truncated }
export async function getEmail(id) {
  if (USE_MOCK) {
    await wait(500);
    const email = MOCK_EMAILS.find((item) => item.id === id);
    return { ...email, truncated: false };
  }
  return requestJson(`/api/emails/${encodeURIComponent(id)}`);
}

// Real mode: go to Alex's /login page, which sends the user to Google.
// Mock mode: just pretend we signed in.
export async function signInToGmail() {
  if (USE_MOCK) {
    await wait(300);
    mockSignedIn = true;
    return;
  }
  window.location.href = `${API_URL}/login`;
}

export async function signOutOfGmail() {
  if (USE_MOCK) {
    mockSignedIn = false;
    return;
  }
  await requestJson("/logout", { method: "POST" });
}

// ===============================================================
// MOCK DATA (only used when USE_MOCK = true)
// ===============================================================

// Jargon -> Plain: each example has a polite, a plain and a blunt version
// (picked by the slider), plus a brutal one for Brutally Honest Mode.
const MOCK_TO_PLAIN = [
  {
    polite: "As I mentioned before, could we talk again later and agree on whether we have time for this?",
    plain: "As I already said, let's talk later and agree on whether we have time for this.",
    blunt: "I already told you this. We'll talk later. We probably don't have time.",
    brutal: "Did you even read my email? I'm stalling until you forget, because I don't want to do this.",
    jargonScore: 78,
    flaggedTerms: [
      { term: "per my last email", meaning: "as I already said" },
      { term: "circle back", meaning: "talk about it again later" },
      { term: "align on", meaning: "agree on" },
      { term: "bandwidth", meaning: "time or capacity" },
    ],
  },
  {
    polite: "From now on, we'll be simplifying things and focusing on what we do best.",
    plain: "We're cutting the project. Please stop working on it.",
    blunt: "The project is dead. Stop working on it.",
    brutal: "Your project is cancelled, and some people on your team are about to lose their jobs.",
    jargonScore: 64,
    flaggedTerms: [
      { term: "going forward", meaning: "from now on" },
      { term: "streamline", meaning: "simplify" },
      { term: "core competency", meaning: "what we're good at" },
    ],
  },
  {
    polite: "Let's start with the easier tasks and work together to make real progress.",
    plain: "Let's do the easy stuff first so it looks like we made progress.",
    blunt: "Do the easy stuff so we look busy.",
    brutal: "I have no plan. Do whatever looks good in the next slide deck so nobody notices.",
    jargonScore: 91,
    flaggedTerms: [
      { term: "low-hanging fruit", meaning: "easy wins" },
      { term: "move the needle", meaning: "make a real difference" },
      { term: "synergy", meaning: "working well together" },
      { term: "leverage", meaning: "use" },
    ],
  },
];

// Plain -> Jargon: one version per slider position (1 to 5).
// No jargonScore or flaggedTerms here on purpose: fillInDefaults() works
// them out, the same way it does for Alex's real backend.
const MOCK_TO_CORPORATE = [
  {
    levels: [
      "Could we touch base tomorrow about next steps?",
      "Let's touch base tomorrow to align on next steps and action items.",
      "Let's touch base tomorrow to align on key action items and identify some quick wins going forward.",
      "Let's do a deep dive tomorrow to align on action items, leverage our core competency and grab the low-hanging fruit going forward.",
      "Per my last email, let's take this offline and do a deep dive tomorrow to align on action items, leverage our synergy, move the needle and grab the low-hanging fruit. Net-net: a paradigm shift. Hard stop at EOD.",
    ],
    brutal: "Can we have a meeting tomorrow so I can pretend I have a plan?",
  },
];

let mockCounter = 0; // so each click shows a different example

async function mockTranslate(text, direction, strength, brutal) {
  // Pretend the server takes about a second to think.
  await wait(1000);

  // Handy for testing the error message: type "test error" and translate.
  if (text.trim().toLowerCase() === "test error") {
    throw new Error(BACKEND_DOWN_MESSAGE);
  }

  const pool = direction === "toPlain" ? MOCK_TO_PLAIN : MOCK_TO_CORPORATE;
  const example = pool[mockCounter % pool.length];
  mockCounter++;

  if (direction === "toCorporate") {
    return { translation: brutal ? example.brutal : example.levels[strength - 1] };
  }

  // Slider 1-2 = polite, 3-4 = plain, 5 = blunt. Brutal mode beats all.
  let translation = strength <= 2 ? example.polite : strength <= 4 ? example.plain : example.blunt;
  if (brutal) translation = example.brutal;

  return { translation, jargonScore: example.jargonScore, flaggedTerms: example.flaggedTerms };
}

// A fake inbox for mock mode. All names and addresses are made up.
let mockSignedIn = false;

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toString();

const MOCK_EMAILS = [
  {
    id: "mock-1",
    from: "Chad, VP of Growth <chad@synergycorp.example>",
    subject: "Quick sync?",
    date: daysAgo(0),
    snippet: "Per my last email, let's circle back EOD to align on bandwidth...",
    body:
      "Hi team,\n\nPer my last email, let's circle back EOD to align on bandwidth for the Q3 deliverables. " +
      "I'd love to grab the low-hanging fruit and move the needle before the all-hands.\n\n" +
      "Happy to take any questions offline!\n\nBest,\nChad",
  },
  {
    id: "mock-2",
    from: "People & Culture <hr@synergycorp.example>",
    subject: "Exciting changes to your benefits!",
    date: daysAgo(1),
    snippet: "Going forward, we're streamlining our benefits to focus on our core competency...",
    body:
      "Hello everyone,\n\nGoing forward, we're streamlining our benefits package to better focus on our core " +
      "competency. This paradigm shift is a game changer for our stakeholders.\n\n" +
      "To celebrate, there will be pizza in the break room on Friday.\n\nWarmly,\nPeople & Culture",
  },
  {
    id: "mock-3",
    from: "Office of the CEO <ceo@synergycorp.example>",
    subject: "A paradigm shift for Q4",
    date: daysAgo(3),
    snippet: "Let's take a 30,000-foot view and leverage our synergy going forward...",
    body:
      "Team,\n\nLet's take a 30,000-foot view. Going forward, we will leverage our synergy, socialize the idea " +
      "of doing more with less, and run it up the flagpole with the board.\n\nNet-net: think outside the box.\n\nOnwards,\nThe CEO",
  },
  {
    id: "mock-4",
    from: "Dana (Project Lead) <dana@synergycorp.example>",
    subject: "Re: Re: Re: Following up",
    date: daysAgo(6),
    snippet: "Just wanted to gently follow up and touch base on the action items below...",
    body:
      "Hi,\n\nJust wanted to gently touch base on the action items below. Please ping me when this is on your " +
      "radar. I have a hard stop at 4.\n\nThanks!\nDana",
  },
];
