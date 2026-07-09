# SilRahi AI Style Advisor

FastAPI service for natural-language outfit recommendations.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

## Optional Gemini setup

Set `GEMINI_API_KEY` before running the service. Without the key, the service uses a local fallback extractor so the demo still works.

## Endpoint

`POST /recommend`

```json
{
  "prompt": "Mujhe summer wedding ke liye lightweight lehenga chahiye",
  "budget": 1500,
  "comfort": "high"
}
```

The Node backend calls this service through `AI_STYLE_SERVICE_URL`.
