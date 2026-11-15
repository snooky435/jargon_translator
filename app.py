import os
import secrets

import anthropic
from dotenv import load_dotenv

load_dotenv()  # read ANTHROPIC_API_KEY etc. from .env before the client is created

# Local development only: allow OAuth over http://localhost, and accept Google
# returning scopes in a different order than requested.
os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")
os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")

from flask import Flask, jsonify, redirect, render_template, request, session
from google.auth.exceptions import RefreshError
from googleapiclient.errors import HttpError

import gmail_client
from translator import translate

app = Flask(__name__)
# Signs the session cookie. Without FLASK_SECRET_KEY, a random key is used and
# everyone is signed out whenever the server restarts.
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or secrets.token_hex(32)

MAX_CHARS = 10_000
REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:5001/oauth2callback")

# Google tokens live in server memory, keyed by a random id in the user's session
# cookie, so tokens never reach the browser. Restarting the server signs everyone out.
_TOKENS: dict[str, str] = {}


class NotSignedIn(Exception):
    pass


def _current_creds():
    uid = session.get("uid")
    data = _TOKENS.get(uid) if uid else None
    if not data:
        raise NotSignedIn
    try:
        creds = gmail_client.credentials_from_json(data)
    except RefreshError:
        _TOKENS.pop(session.pop("uid", None), None)
        raise NotSignedIn
    _TOKENS[uid] = creds.to_json()  # keep a refreshed access token
    return creds


def _gmail_call(fn):
    """Run fn(creds) for the signed-in user and return JSON, mapping errors."""
    try:
        return jsonify(fn(_current_creds()))
    except NotSignedIn:
        return jsonify(error="Not signed in to Google. Sign in again."), 401
    except HttpError as e:
        return jsonify(error=f"Gmail API error ({e.resp.status})."), 502


@app.get("/")
def index():
    return render_template("index.html")


# ---------- Google sign-in ----------

@app.get("/login")
def login():
    if not gmail_client.is_configured():
        return "Google sign-in isn't configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.", 500
    flow = gmail_client.make_flow(REDIRECT_URI)
    # select_account: always show Google's account picker, so users can switch Gmail accounts
    auth_url, state = flow.authorization_url(access_type="offline", prompt="consent select_account")
    session["oauth_state"] = state
    session["code_verifier"] = flow.code_verifier  # PKCE: needed again in the callback
    return redirect(auth_url)


@app.get("/oauth2callback")
def oauth2callback():
    if request.args.get("error"):
        return redirect("/?gmail_error=" + request.args["error"])
    state = session.pop("oauth_state", None)
    if not state or state != request.args.get("state"):
        return redirect("/?gmail_error=state_mismatch")

    flow = gmail_client.make_flow(
        REDIRECT_URI, state=state, code_verifier=session.pop("code_verifier", None)
    )
    flow.fetch_token(authorization_response=request.url)

    uid = secrets.token_urlsafe(24)
    _TOKENS[uid] = flow.credentials.to_json()
    session["uid"] = uid
    return redirect("/")


@app.post("/logout")
def logout():
    _TOKENS.pop(session.pop("uid", None), None)
    return jsonify(ok=True)


# ---------- Gmail API ----------

@app.get("/api/me")
def api_me():
    if not gmail_client.is_configured():
        return jsonify(configured=False, signed_in=False)
    try:
        email = gmail_client.get_profile_email(_current_creds())
    except (NotSignedIn, HttpError):
        return jsonify(configured=True, signed_in=False)
    return jsonify(configured=True, signed_in=True, email=email)


@app.get("/api/emails")
def api_emails():
    return _gmail_call(lambda c: {"emails": gmail_client.list_messages(c)})


@app.get("/api/emails/<msg_id>")
def api_email(msg_id):
    return _gmail_call(lambda c: gmail_client.get_message_text(c, msg_id))


# ---------- Translation ----------

@app.post("/api/translate")
def api_translate():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    direction = data.get("direction", "to_plain")

    if not text:
        return jsonify(error="Paste some text first."), 400
    if len(text) > MAX_CHARS:
        return jsonify(error=f"Text is too long (max {MAX_CHARS:,} characters)."), 400

    if not os.environ.get("ANTHROPIC_API_KEY"):
        return jsonify(error="ANTHROPIC_API_KEY is not set. Paste your key into .env and restart the server."), 500

    try:
        return jsonify(result=translate(text, direction))
    except ValueError as e:
        return jsonify(error=str(e)), 400
    except anthropic.AuthenticationError:
        return jsonify(error="API key is invalid. Check ANTHROPIC_API_KEY in .env."), 500
    except anthropic.RateLimitError:
        return jsonify(error="Rate limited. Try again in a moment."), 429
    except anthropic.APIStatusError as e:
        return jsonify(error=f"Claude API error ({e.status_code})."), 502
    except anthropic.APIConnectionError:
        return jsonify(error="Couldn't reach the Claude API."), 502
    except RuntimeError as e:
        return jsonify(error=str(e)), 422


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", port=5001)
