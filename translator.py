"""Two-way corporate jargon translator built on the Claude API."""

import json
import os
from pathlib import Path

import anthropic

MODEL = os.environ.get("JARGON_MODEL", "claude-opus-5-5")
PHRASES_PATH = Path(__file__).parent / "phrases.json"

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment


def _load_phrases() -> str:
    phrases = json.loads(PHRASES_PATH.read_text())
    return "\n".join(f'- "{p["jargon"]}" <-> "{p["plain"]}"' for p in phrases)


SYSTEM_PROMPT = f"""You are a two-way corporate jargon translator.

You receive a piece of text (usually an email) and a direction:
- "to_jargon": rewrite plain, direct writing as polished corporate-speak. Lean into buzzwords,
  euphemisms and business clichés while keeping every fact, name, date and request intact.
- "to_plain": rewrite corporate-speak as plain, direct, friendly English that anyone could
  understand. Say what the writer actually means, including any implied subtext.

Rules:
- Keep the same format (greeting, paragraphs, sign-off) and roughly the same length.
- Never invent facts, deadlines or people that aren't in the original.
- Output ONLY the translated text: no preamble, no explanation, no quotes around it.

Reference phrasebook (use these, and any other common jargon you know):
{_load_phrases()}

Example (to_plain):
Input: "Per my last email, let's circle back EOD to align on next steps and leverage our bandwidth."
Output: "As I already said, let's talk again at the end of the day to agree on what to do next and use the time we have."

Example (to_jargon):
Input: "Can you send me the report by Friday? We need it for the client meeting."
Output: "Could you circle back with the deliverable by EOD Friday? It's mission-critical for aligning with the client on key takeaways."
"""

DIRECTIONS = {"to_jargon", "to_plain"}


def translate(text: str, direction: str) -> str:
    if direction not in DIRECTIONS:
        raise ValueError(f"direction must be one of {sorted(DIRECTIONS)}")

    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        output_config={"effort": "low"},  # simple rewriting task: keep it fast
        system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": f"Direction: {direction}\n\nText:\n{text}"}],
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",  # if a safety classifier declines, retry on a fallback model
    )

    if response.stop_reason == "refusal":
        raise RuntimeError("The model declined to translate this text.")

    return "".join(b.text for b in response.content if b.type == "text").strip()
