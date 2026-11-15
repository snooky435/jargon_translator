"""Google OAuth sign-in and read-only Gmail access."""

import base64
import html
import json
import os
import re

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
TOKEN_URI = "https://oauth2.googleapis.com/token"
MAX_BODY_CHARS = 10_000


def is_configured() -> bool:
    return bool(os.environ.get("GOOGLE_CLIENT_ID") and os.environ.get("GOOGLE_CLIENT_SECRET"))


def _client_config() -> dict:
    return {
        "web": {
            "client_id": os.environ["GOOGLE_CLIENT_ID"],
            "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": TOKEN_URI,
        }
    }


def make_flow(redirect_uri: str, state: str | None = None, code_verifier: str | None = None) -> Flow:
    return Flow.from_client_config(
        _client_config(),
        scopes=SCOPES,
        redirect_uri=redirect_uri,
        state=state,
        code_verifier=code_verifier,
    )


def credentials_from_json(data: str) -> Credentials:
    creds = Credentials.from_authorized_user_info(json.loads(data), SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def _service(creds: Credentials):
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def get_profile_email(creds: Credentials) -> str:
    return _service(creds).users().getProfile(userId="me").execute()["emailAddress"]


def list_messages(creds: Credentials, max_results: int = 15) -> list[dict]:
    """Recent inbox messages: id, from, subject, date, snippet (newest first)."""
    service = _service(creds)
    ids = [
        m["id"]
        for m in service.users()
        .messages()
        .list(userId="me", labelIds=["INBOX"], maxResults=max_results)
        .execute()
        .get("messages", [])
    ]

    results: dict[str, dict] = {}

    def on_message(request_id, response, exception):
        if exception is not None:
            return
        headers = {h["name"].lower(): h["value"] for h in response["payload"].get("headers", [])}
        results[request_id] = {
            "id": response["id"],
            "from": headers.get("from", ""),
            "subject": headers.get("subject", "(no subject)"),
            "date": headers.get("date", ""),
            "snippet": html.unescape(response.get("snippet", "")),
        }

    batch = service.new_batch_http_request(callback=on_message)
    for msg_id in ids:
        batch.add(
            service.users().messages().get(
                userId="me", id=msg_id, format="metadata",
                metadataHeaders=["From", "Subject", "Date"],
            ),
            request_id=msg_id,
        )
    if ids:
        batch.execute()

    return [results[i] for i in ids if i in results]


def _decode(data: str) -> str:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4)).decode("utf-8", errors="replace")


def _html_to_text(markup: str) -> str:
    markup = re.sub(r"(?is)<(script|style|head).*?</\1>", "", markup)
    markup = re.sub(r"(?i)<br\s*/?>|</p>|</div>|</li>|</tr>|</h\d>", "\n", markup)
    text = html.unescape(re.sub(r"<[^>]+>", "", markup))
    text = re.sub(r"[ \t ]+", " ", text)
    return re.sub(r"\n\s*\n\s*\n+", "\n\n", text).strip()


def _find_part(payload: dict, mime_type: str) -> str | None:
    if payload.get("mimeType") == mime_type and payload.get("body", {}).get("data"):
        return _decode(payload["body"]["data"])
    for part in payload.get("parts", []) or []:
        found = _find_part(part, mime_type)
        if found:
            return found
    return None


def get_message_text(creds: Credentials, msg_id: str) -> dict:
    """Full message as plain text (prefers text/plain, falls back to stripped HTML)."""
    msg = _service(creds).users().messages().get(userId="me", id=msg_id, format="full").execute()
    payload = msg["payload"]
    headers = {h["name"].lower(): h["value"] for h in payload.get("headers", [])}

    body = _find_part(payload, "text/plain")
    if body is None:
        html_body = _find_part(payload, "text/html")
        body = _html_to_text(html_body) if html_body else msg.get("snippet", "")

    body = body.replace("\r\n", "\n").strip()
    truncated = len(body) > MAX_BODY_CHARS
    return {
        "id": msg_id,
        "from": headers.get("from", ""),
        "subject": headers.get("subject", "(no subject)"),
        "body": body[:MAX_BODY_CHARS],
        "truncated": truncated,
    }
