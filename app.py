import os

import anthropic
from flask import Flask, jsonify, render_template, request

from translator import translate

app = Flask(__name__)
MAX_CHARS = 10_000


@app.get("/")
def index():
    return render_template("index.html")


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
        return jsonify(error="ANTHROPIC_API_KEY is not set on the server."), 500

    try:
        return jsonify(result=translate(text, direction))
    except ValueError as e:
        return jsonify(error=str(e)), 400
    except anthropic.AuthenticationError:
        return jsonify(error="API key missing or invalid. Set ANTHROPIC_API_KEY."), 500
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
