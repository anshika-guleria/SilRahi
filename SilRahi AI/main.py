import csv
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="SilRahi AI Style Advisor")
DATASET_PATH = Path(__file__).with_name("fashion_dataset.csv")
ENV_PATH = Path(__file__).with_name(".env")


def load_local_env() -> None:
    if not ENV_PATH.exists():
        return

    with ENV_PATH.open(encoding="utf-8") as file:
      for line in file:
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_local_env()


class StyleRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    budget: float | None = None
    ageGroup: str | None = None
    location: str | None = None
    comfort: str | None = None
    bodyType: str | None = None


def split_values(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split("|") if item.strip()]


def load_dataset() -> list[dict[str, str]]:
    with DATASET_PATH.open(newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def has_any(text: str, words: list[str]) -> bool:
    return any(word in text for word in words)


def local_extract(request: StyleRequest) -> dict[str, Any]:
    text = request.prompt.lower()
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
        "budget": request.budget or (float(budget_match.group(1)) if budget_match else None),
        "comfort": request.comfort or ("high" if style == "lightweight" else None),
        "age_group": request.ageGroup,
        "location": request.location,
        "body_type": request.bodyType,
    }


def gemini_extract(request: StyleRequest) -> dict[str, Any] | None:
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
        "user_input": request.model_dump(),
    }
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "Return only valid JSON. Do not include markdown. "
                            + json.dumps(instruction, ensure_ascii=False)
                        )
                    }
                ]
            }
        ]
    }
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as response:
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
    if features.get("age_group") and row.get("age_group", "").lower() == str(features["age_group"]).lower():
        score += 1

    budget = features.get("budget")
    if budget:
        if float(row["budget_min"]) <= float(budget) <= float(row["budget_max"]):
            score += 3
    return score


def recommend(features: dict[str, Any]) -> dict[str, Any]:
    rows = load_dataset()
    best = max(rows, key=lambda row: score_row(row, features))

    return {
        "fabric": split_values(best["fabric"]),
        "design": best["design"],
        "color": split_values(best["color"]),
        "estimatedPrice": best["price_range"],
        "tailorType": best["tailor_type"],
        "reason": best.get("reason")
        or (
            f"{features.get('season', best['season']).title()} {features.get('occasion', best['occasion'])} "
            f"ke liye {split_values(best['fabric'])[0]} comfortable aur elegant rahega."
        ),
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "SilRahi AI Style Advisor"}


@app.post("/recommend")
def style_recommendation(request: StyleRequest) -> dict[str, Any]:
    extracted = gemini_extract(request)
    source = "gemini" if extracted else "local-fallback"
    if not extracted:
        extracted = local_extract(request)

    for key, value in {
        "budget": request.budget,
        "comfort": request.comfort,
        "age_group": request.ageGroup,
        "location": request.location,
        "body_type": request.bodyType,
    }.items():
        if value not in (None, ""):
            extracted[key] = value

    return {
        "extracted": extracted,
        "recommendation": recommend(extracted),
        "source": source,
    }
