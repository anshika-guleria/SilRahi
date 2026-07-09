import express from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();

const styleAdvisorSchema = z.object({
  prompt: z.string().trim().min(5, "Please describe what you want to wear."),
  budget: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  ageGroup: z.string().trim().optional(),
  location: z.string().trim().optional(),
  comfort: z.string().trim().optional(),
  bodyType: z.string().trim().optional()
});

const fallbackFabricBySeason = {
  summer: ["Chiffon", "Georgette"],
  winter: ["Silk", "Velvet"],
  monsoon: ["Crepe", "Georgette"],
  festive: ["Silk Blend", "Organza"]
};

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function extractFallback(payload) {
  const text = payload.prompt.toLowerCase();
  const season = includesAny(text, ["summer", "garmi", "garam"]) ? "summer" : includesAny(text, ["winter", "sardi"]) ? "winter" : "festive";
  const occasion = includesAny(text, ["wedding", "shaadi", "shadi", "marriage"]) ? "wedding" : includesAny(text, ["party", "function"]) ? "party" : "casual";
  const garment = includesAny(text, ["lehenga", "lahenga"]) ? "lehenga" : includesAny(text, ["suit", "salwar"]) ? "salwar suit" : includesAny(text, ["blouse", "choli"]) ? "blouse" : "custom outfit";
  const style = includesAny(text, ["lightweight", "light weight", "halka", "comfortable"]) ? "lightweight" : includesAny(text, ["heavy", "embroidery"]) ? "embroidered" : "elegant";

  return {
    occasion,
    season,
    garment,
    style,
    budget: payload.budget,
    age_group: payload.ageGroup,
    location: payload.location,
    comfort: payload.comfort || (style === "lightweight" ? "high" : undefined),
    body_type: payload.bodyType
  };
}

function recommendationFromExtracted(extracted, source = "backend-fallback") {
  const fabrics = fallbackFabricBySeason[extracted.season] || ["Cotton Blend", "Crepe"];
  const budget = Number(extracted.budget || 1800);
  const min = Math.max(900, Math.round(budget * 0.85));
  const max = Math.round(budget * 1.35);
  const isSummerWeddingLehenga =
    extracted.season === "summer" &&
    extracted.occasion === "wedding" &&
    String(extracted.garment || "").includes("lehenga");

  return {
    extracted,
    recommendation: {
      fabric: fabrics,
      design: isSummerWeddingLehenga
        ? "Light embroidery lehenga with breathable lining"
        : `${extracted.style} ${extracted.garment} with breathable lining and neat finishing`,
      color: extracted.season === "summer" ? ["Pastel pink", "Mint green", "Lavender"] : ["Wine", "Emerald", "Royal blue"],
      estimatedPrice: isSummerWeddingLehenga ? "\u20b91400\u2013\u20b92200" : `\u20b9${min}\u2013\u20b9${max}`,
      tailorType: String(extracted.garment || "").includes("lehenga") ? "Women ethnic wear specialist" : "Custom stitching specialist",
      reason: isSummerWeddingLehenga
        ? "Summer wedding ke liye lightweight fabric comfortable aur elegant rahega."
        : `${extracted.season} ${extracted.occasion} ke liye ${fabrics.join(" / ")} comfortable aur elegant rahega.`
    },
    source
  };
}

function fallbackRecommendation(payload) {
  return recommendationFromExtracted(extractFallback(payload), "backend-fallback");
}

async function extractWithGemini(payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const instruction = {
    task: "Extract structured fashion recommendation features as strict JSON.",
    schema: {
      occasion: "string",
      season: "string",
      garment: "string",
      style: "string",
      budget: "number or null",
      comfort: "string or null",
      age_group: "string or null",
      location: "string or null",
      body_type: "string or null"
    },
    user_input: payload
  };

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Return only valid JSON. Do not include markdown. ${JSON.stringify(instruction)}`
              }
            ]
          }
        ]
      }),
      signal: AbortSignal.timeout(Number(process.env.GEMINI_TIMEOUT_MS || 15000))
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) return null;
  return JSON.parse(text);
}

function mergeGeminiPayload(extracted, payload) {
  return {
    ...extracted,
    budget: payload.budget ?? extracted.budget,
    comfort: payload.comfort || extracted.comfort,
    age_group: payload.ageGroup || extracted.age_group,
    location: payload.location || extracted.location,
    body_type: payload.bodyType || extracted.body_type
  };
}

async function requestAiService(payload) {
  const baseUrl = (process.env.AI_STYLE_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(Number(process.env.AI_STYLE_SERVICE_TIMEOUT_MS || 12000))
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(response.status, data.detail || data.error || "AI style service failed");
  }
  return data;
}

router.post(
  "/style-advisor",
  asyncHandler(async (req, res) => {
    const parsed = styleAdvisorSchema.safeParse(req.body || {});
    if (!parsed.success) {
      throw new HttpError(400, "Validation failed", parsed.error.flatten());
    }

    const payload = parsed.data;

    try {
      const data = await requestAiService(payload);
      if (data?.source === "gemini") {
        return res.json(data);
      }

      const extracted = await extractWithGemini(payload);
      if (extracted) {
        return res.json(recommendationFromExtracted(mergeGeminiPayload(extracted, payload), "gemini"));
      }

      return res.json(data);
    } catch (error) {
      if (process.env.AI_STYLE_STRICT === "true") {
        throw error.status ? error : new HttpError(502, "AI style service is unavailable");
      }

      const extracted = await extractWithGemini(payload);
      if (extracted) {
        return res.json(recommendationFromExtracted(mergeGeminiPayload(extracted, payload), "gemini"));
      }

      return res.json(fallbackRecommendation(payload));
    }
  })
);

export default router;
