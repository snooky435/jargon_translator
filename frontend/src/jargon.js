// Works out a "jargon score" and the list of jargon terms in a piece of text,
// right here in the browser.
//
// Why? Alex's backend only returns the translated text. It does NOT return
// a jargonScore or flaggedTerms, so we calculate them ourselves using
// Alex's phrasebook (phrases.json in the repo root).

// Alex's phrasebook, read straight from the repo root (one shared copy).
import phrases from "../../phrases.json";

// Escape characters like "." or "?" so they are matched literally in a regex.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Find every phrasebook term that appears in the text.
// Returns: [ { term, meaning }, ... ]
export function findJargon(text) {
  const found = [];
  for (const phrase of phrases) {
    // Match the whole phrase only (so "leverage" doesn't match inside another word).
    // "i" = ignore upper/lower case.
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(phrase.jargon)}($|[^a-z0-9])`, "i");
    if (pattern.test(text)) {
      found.push({ term: phrase.jargon, meaning: phrase.plain });
    }
  }
  return found;
}

// Turn the text into a score from 0 (plain) to 100 (synergy overload).
export function analyzeJargon(text) {
  const flaggedTerms = findJargon(text);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount === 0) return { jargonScore: 0, flaggedTerms };

  // Each jargon term adds points, and a short text packed with jargon
  // scores higher than a long text with the same number of terms.
  const density = flaggedTerms.length / wordCount;
  const score = flaggedTerms.length * 12 + density * 150;

  return {
    jargonScore: Math.min(100, Math.round(score)),
    flaggedTerms,
  };
}
