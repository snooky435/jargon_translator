// Alex's Gmail feature, in our style: sign in with Google, see your newest
// emails, click one to load it into the translator.
//
// It stays hidden if Gmail isn't set up on the server (no Google keys in
// Alex's .env) or if the backend isn't running.
//
// Props:
//   onEmailLoaded: function called with { subject, body, truncated }
//                  when the user picks an email

import { useEffect, useState } from "react";
import { USE_MOCK, getGmailStatus, getInbox, getEmail, signInToGmail, signOutOfGmail } from "../api.js";

// "Chad <chad@example.com>" -> "Chad"
function senderName(from) {
  const match = from.match(/^\s*"?([^"<]+?)"?\s*</);
  return match ? match[1].trim() : from;
}

// Today's emails show the time ("3:05 PM"), older ones the date ("Nov 12").
function shortDate(raw) {
  const date = new Date(raw);
  if (isNaN(date)) return "";
  const isToday = new Date().toDateString() === date.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function GmailPanel({ onEmailLoaded }) {
  const [status, setStatus] = useState(null); // { configured, signedIn, email }
  const [emails, setEmails] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [message, setMessage] = useState(""); // errors or "Loading email…"

  // Load the inbox list.
  async function loadInbox() {
    setInboxLoading(true);
    setMessage("");
    try {
      setEmails(await getInbox());
    } catch (err) {
      setMessage(err.message);
    } finally {
      setInboxLoading(false);
    }
  }

  // Ask the backend whether Gmail is set up and whether we're signed in.
  async function checkStatus() {
    try {
      const newStatus = await getGmailStatus();
      setStatus(newStatus);
      if (newStatus.signedIn) loadInbox();
    } catch {
      setStatus(null); // backend not running: keep the panel hidden
    }
  }

  // Runs once when the page opens.
  useEffect(() => {
    // After Google sign-in fails, Alex's backend sends us back to
    // "/?gmail_error=...". Show a message, then tidy up the address bar.
    const params = new URLSearchParams(window.location.search);
    const gmailError = params.get("gmail_error");
    if (gmailError) {
      setMessage(
        gmailError === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed. Try again."
      );
      window.history.replaceState(null, "", "/");
    }
    checkStatus();
  }, []);

  async function handleSignIn() {
    await signInToGmail(); // real mode: the browser leaves for Google here
    checkStatus(); // mock mode: we're "signed in", so refresh the panel
  }

  async function handleSignOut() {
    try {
      await signOutOfGmail();
    } catch (err) {
      setMessage(err.message);
    }
    setEmails([]);
    checkStatus();
  }

  async function handlePickEmail(id) {
    setMessage("Loading email…");
    try {
      const email = await getEmail(id);
      setMessage("");
      onEmailLoaded(email);
    } catch (err) {
      setMessage(err.message);
    }
  }

  // Hidden until we know Gmail is set up on the server.
  if (!status?.configured) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      {/* Top bar: who is signed in + buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-white">
            📥 Inbox Intelligence Suite™
            {USE_MOCK && (
              <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 align-middle font-sans text-xs font-medium text-amber-300">
                demo inbox
              </span>
            )}
          </p>
          <p className="break-all text-sm text-gray-400">
            {status.signedIn ? (
              <>
                Signed in as <strong className="text-gray-200">{status.email}</strong>
              </>
            ) : (
              "Load an email straight from Gmail (read-only) and find out what it actually says."
            )}
          </p>
        </div>

        <div className="flex gap-2">
          {status.signedIn ? (
            <>
              <button
                type="button"
                onClick={loadInbox}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
              >
                Refresh inbox
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-amber-300">{message}</p>}

      {/* The inbox list (only when signed in) */}
      {status.signedIn && (
        <ul className="mt-3 max-h-72 divide-y divide-white/10 overflow-y-auto border-t border-white/10" aria-label="Recent emails">
          {inboxLoading && <li className="py-3 text-sm text-gray-400">Loading inbox…</li>}
          {!inboxLoading && emails.length === 0 && (
            <li className="py-3 text-sm text-gray-400">Your inbox is empty. Suspiciously empty.</li>
          )}
          {!inboxLoading &&
            emails.map((email) => (
              <li key={email.id}>
                <button
                  type="button"
                  onClick={() => handlePickEmail(email.id)}
                  className="block w-full px-1 py-2.5 text-left transition hover:bg-violet-500/10"
                >
                  <span className="flex justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-gray-100">{senderName(email.from)}</span>
                    <span className="shrink-0 text-gray-500">{shortDate(email.date)}</span>
                  </span>
                  <span className="block truncate text-sm text-gray-200">{email.subject}</span>
                  <span className="block truncate text-xs text-gray-500">{email.snippet}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
