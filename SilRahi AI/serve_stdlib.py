import csv
import json
import os
import re
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "fashion_dataset.csv"
ENV_PATH = BASE_DIR / ".env"


def load_local_env() -> None:
    if not ENV_PATH.exists():
        return
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def split_values(value: str | None) -> list[str]:
    return [item.strip() for item in (value or "").split("|") if item.strip()]


def load_dataset() -> list[dict[str, str]]:
    with DATASET_PATH.open(newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def has_any(text: str, words: list[str]) -> bool:
    return any(word in text for word in words)


def local_extract(payload: dict[str, Any]) -> dict[str, Any]:
    text = str(payload.get("prompt", "")).lower()
    budget_match = re.search(r"(?:rs\.?|inr|₹)?\s*(\d{3,6})", text)
    season = "summer" if has_any(text, ["summer", "garmi", "garam"]) else "winter" if has_any(text, ["winter", "sardi"]) else "festive"
    occasion = "wedding" if has_any(text, ["wedding", "shaadi", "shadi", "marriage"]) else "party" if "party" in text else "casual"
    garment = "lehenga" if has_any(text, ["lehenga", "lahenga"]) else "salwar suit" if has_any(text, ["suit", "salwar"]) else "blouse" if "blouse" in text else "custom outfit"
    style = "lightweight" if has_any(text, ["lightweight", "light weight", "halka", "comfortable"]) else "embroidered" if has_any(text, ["heavy", "embroidery"]) else "elegant"
    return {
        "occasion": occasion,
        "season": season,
        "garment": garment,
        "style": style,
        "budget": payload.get("budget") or (float(budget_match.group(1)) if budget_match else None),
        "comfort": payload.get("comfort") or ("high" if style == "lightweight" else None),
        "age_group": payload.get("ageGroup"),
        "location": payload.get("location"),
        "body_type": payload.get("bodyType"),
    }


def gemini_extract(payload: dict[str, Any]) -> dict[str, Any] | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    instruction = {
        "task": "Extract structured fashion recommendation features as strict JSON.",
        "schema": {
            "occasion": "string",
            "season": "string",
            "garment": "string",
            "style": "string",
            "budget": "number or null",
            "comfort": "string or null",
            "age_group": "string or null",
            "location": "string or null",
            "body_type": "string or null",
        },
        "user_input": payload,
    }
    body = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Return only valid JSON. Do not include markdown. "
                        + json.dumps(instruction, ensure_ascii=False)
                    }
                ]
            }
        ]
    }
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    try:
        request = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = json.loads(response.read().decode("utf-8"))
        text = raw["candidates"][0]["content"]["parts"][0]["text"].strip()
        return json.loads(text)
    except (urllib.error.URLError, KeyError, json.JSONDecodeError, TimeoutError):
        return None


def score_row(row: dict[str, str], features: dict[str, Any]) -> int:
    score = 0
    for key in ["occasion", "season", "garment", "style"]:
        if row.get(key, "").lower() == str(features.get(key, "")).lower():
            score += 3
    if features.get("comfort") and row.get("comfort_level", "").lower() == str(features["comfort"]).lower():
        score += 2
    budget = features.get("budget")
    if budget and float(row["budget_min"]) <= float(budget) <= float(row["budget_max"]):
        score += 3
    return score


def recommend(features: dict[str, Any]) -> dict[str, Any]:
    best = max(load_dataset(), key=lambda row: score_row(row, features))
    return {
        "fabric": split_values(best["fabric"]),
        "design": best["design"],
        "color": split_values(best["color"]),
        "estimatedPrice": best["price_range"],
        "tailorType": best["tailor_type"],
        "reason": best.get("reason"),
    }


def build_response(payload: dict[str, Any]) -> dict[str, Any]:
    extracted = gemini_extract(payload)
    source = "gemini" if extracted else "local-fallback"
    if not extracted:
        extracted = local_extract(payload)
    for source_key, target_key in {
        "budget": "budget",
        "comfort": "comfort",
        "ageGroup": "age_group",
        "location": "location",
        "bodyType": "body_type",
    }.items():
        value = payload.get(source_key)
        if value not in (None, ""):
            extracted[target_key] = value
    return {"extracted": extracted, "recommendation": recommend(extracted), "source": source}


class Handler(BaseHTTPRequestHandler):
    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_json(200, {"status": "ok", "service": "SilRahi AI Style Advisor"})
            return
        self.send_json(404, {"detail": "Not found"})

    def do_POST(self) -> None:
        if self.path != "/recommend":
            self.send_json(404, {"detail": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if len(str(payload.get("prompt", "")).strip()) < 5:
                self.send_json(400, {"detail": "Please describe what you want to wear."})
                return
            self.send_json(200, build_response(payload))
        except Exception as error:
            self.send_json(500, {"detail": str(error)})


if __name__ == "__main__":
    load_local_env()
    server = ThreadingHTTPServer(("127.0.0.1", 8001), Handler)
    print("SilRahi AI service running on http://127.0.0.1:8001")
    server.serve_forever()
