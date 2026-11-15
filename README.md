# Jargon Translator

Paste an email and translate it **from corporate jargon to plain English**, or **from plain English to corporate jargon**. Built with Flask and the Claude API.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env    # then paste your API key into .env
python app.py
```

Open http://localhost:5001.

## Gmail sign-in (optional)

Load emails straight from your inbox instead of pasting them. Access is read-only.

1. In [Google Cloud Console](https://console.cloud.google.com), create a project and enable the **Gmail API**.
2. **OAuth consent screen**: choose External, add the `gmail.readonly` scope, keep it in **Testing**, and add each teammate's Gmail under **Test users**.
3. **Credentials → Create credentials → OAuth client ID**: choose Web application, with redirect URI `http://localhost:5001/oauth2callback`.
4. Put the client ID and secret in `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then restart the app.

The "Sign in with Google" panel appears once those are set. Google tokens are kept in server memory only, so restarting the server signs everyone out.

## How it works

No model training is involved. `translator.py` sends Claude a system prompt that holds:
- the phrasebook in `phrases.json`
- a couple of before/after examples
- the direction (`to_plain` or `to_jargon`)

The system prompt is cached, so repeated requests are cheaper and faster.

## Customizing

- **Add phrases:** edit `phrases.json` and restart the app.
- **Change the model:** set `JARGON_MODEL=claude-haiku-5-5` in `.env` for a cheaper, faster option (the default is `claude-opus-5-5`).
- **Tune the tone:** edit `SYSTEM_PROMPT` in `translator.py`.

## Files

| File | Purpose |
|---|---|
| `app.py` | Flask server: serves the page and `POST /api/translate` |
| `translator.py` | Prompt and Claude API call |
| `gmail_client.py` | Google OAuth and read-only Gmail access |
| `phrases.json` | Jargon ↔ plain-English phrasebook |
| `templates/index.html` | Frontend (single page, no build step) |
