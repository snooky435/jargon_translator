# Jargon Translator: Front End

React + Vite + Tailwind front end for Alex's Flask backend (in the folder above this one).
It covers everything Alex's original page (`templates/index.html`) does (translate, swap, copy,
Gmail inbox), plus the Jargon-o-Meter, strength slider, Brutally Honest Mode, a dictionary-style
"What they REALLY mean" panel, and the stock-photo styling.

## Run it

You need [Node.js](https://nodejs.org) (LTS) for the front end and Python for the backend.

**Terminal 1: backend** (from the repo root)

```powershell
pip install -r requirements.txt
Copy-Item .env.example .env      # Mac/Linux: cp .env.example .env
# open .env and paste your ANTHROPIC_API_KEY
python app.py                    # runs on http://localhost:5001
```

**Terminal 2: front end**

```powershell
cd frontend
npm install      # first time only
npm run dev      # runs on http://localhost:5173
```

Open **http://localhost:5173**. Stop either server with `Ctrl + C`.

## Mock mode vs. the real backend

In `src/api.js`:

```js
export const USE_MOCK = true;   // fake answers + a fake demo inbox, no backend needed
export const USE_MOCK = false;  // talk to Alex's real backend
```

Save the file and the browser reloads by itself.

The browser never calls port 5001 directly. Vite's proxy (`vite.config.js`) forwards `/api`,
`/login`, `/oauth2callback` and `/logout` to the backend, so there are no CORS problems and the
backend needs no changes.

## Gmail sign-in

The Gmail panel only appears when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
(see the main README for the Google Cloud setup).

By default, Google sends you back to the backend (`localhost:5001`) after sign-in, which shows
Alex's original page. To come back to this front end instead, add this to `.env`:

```
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth2callback
```

Then add `http://localhost:5173/oauth2callback` as an authorized redirect URI in Google Cloud
Console, and restart `python app.py`.

## Where things are

| Path | What it is |
|---|---|
| `src/api.js` | Every backend call (translate + Gmail), plus the `USE_MOCK` switch and mock data |
| `src/jargon.js` | Jargon score and term detection, using Alex's `../phrases.json` directly |
| `src/data/brutalMeanings.json` | What each phrasebook term REALLY means (Brutally Honest Mode) |
| `src/data/stockPhotos.js` | Stock photo captions (images in `public/stock/`, from Unsplash) |
| `src/pages/` | Home (translator), Dictionary (coming soon), About |
| `src/components/` | Building blocks: GmailPanel, ToneSlider, JargonMeter, BrutalModeToggle... |
