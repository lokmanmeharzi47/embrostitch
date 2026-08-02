import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { validateMeasurements, isValidAnalysisResult } from "@/lib/measurements";

const SYSTEM_PROMPT = `You are a professional fashion tailor with decades of experience fitting women for custom-made garments in Algeria. You have deep knowledge of typical female body proportions and how bust, waist, and hips relate to one another.

Given a client's self-reported measurements, you must:
1. Judge whether the measurements are realistic for a human body (each value on its own, and the set as a whole).
2. Judge whether the measurements are proportional to one another (e.g. a waist much larger than both bust and hips, or a waist barely smaller than the bust, are classic signs of a measuring or data-entry mistake).
3. If something looks off, identify the single most likely incorrect value and explain, in plain and reassuring language, why you suspect it and what the client should re-check.
4. Recommend a clothing size appropriate for custom tailoring.
5. Report your confidence (0-100) in the overall analysis.

Rules you must always follow:
- Never invent or guess a measurement value that was not provided to you. Only reason about the values you were given.
- Be encouraging and professional in tone, never alarming.
- If the measurements look consistent, say so plainly and do not manufacture a warning just to have one.
- Respond only with the structured JSON described by the response schema. Do not include any text outside the JSON.`;

const ANALYSIS_TIMEOUT_MS = 20000;

interface AnalyzeRequestBody {
  height?: unknown;
  bust?: unknown;
  waist?: unknown;
  hips?: unknown;
  age?: unknown;
  weight?: unknown;
  dress_type?: unknown;
  locale?: unknown;
}

const RESPONSE_LANGUAGE: Record<string, string> = {
  fr: "French",
  ar: "Arabic",
  en: "English",
};

function buildPrompt(input: {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  age?: number | null;
  weight?: number | null;
  dress_type?: string | null;
  languageName: string;
}): string {
  const lines = [
    `Height: ${input.height} cm`,
    `Bust: ${input.bust} cm`,
    `Waist: ${input.waist} cm`,
    `Hips: ${input.hips} cm`,
  ];
  if (input.age) lines.push(`Age: ${input.age}`);
  if (input.weight) lines.push(`Weight: ${input.weight} kg`);
  if (input.dress_type) lines.push(`Intended garment: ${input.dress_type}`);

  return `Analyze the following body measurements for a custom-tailored garment:\n\n${lines.join("\n")}\n\nWrite the "analysis", "warnings", and "suggestions" fields in ${input.languageName}. Keep "recommended_size" in the universal size format (e.g. "EU 40") regardless of language.`;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Gemini request timed out")), ms);
    }),
  ]);
}

export async function POST(request: Request) {
  let body: AnalyzeRequestBody;
  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateMeasurements({
    height: body.height,
    bust: body.bust,
    waist: body.waist,
    hips: body.hips,
  });

  if (!validation.valid) {
    return NextResponse.json(
      { error: "Measurements out of range or missing", fields: validation.errors },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
  }

  const height = Number(body.height);
  const bust = Number(body.bust);
  const waist = Number(body.waist);
  const hips = Number(body.hips);
  const age = body.age ? Number(body.age) : null;
  const weight = body.weight ? Number(body.weight) : null;
  const dressType = typeof body.dress_type === "string" && body.dress_type.trim() ? body.dress_type.trim() : null;
  const locale = typeof body.locale === "string" ? body.locale : "en";
  const languageName = RESPONSE_LANGUAGE[locale] || RESPONSE_LANGUAGE.en;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: buildPrompt({ height, bust, waist, hips, age, weight, dress_type: dressType, languageName }),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              valid: { type: Type.BOOLEAN, description: "Whether the measurements look realistic and proportional" },
              confidence: {
                type: Type.INTEGER,
                description: "Confidence in this analysis as a whole number from 0 to 100 (e.g. 92, not 0.92).",
              },
              recommended_size: { type: Type.STRING, description: "Recommended clothing size, e.g. 'EU 40'" },
              analysis: { type: Type.STRING, description: "Plain-language explanation of the findings" },
              warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["valid", "confidence", "recommended_size", "analysis", "warnings", "suggestions"],
          },
        },
      }),
      ANALYSIS_TIMEOUT_MS
    );

    const rawText = response.text;
    if (!rawText) {
      return NextResponse.json({ error: "Gemini returned an empty response" }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "Gemini returned malformed JSON" }, { status: 502 });
    }

    // Defensive normalization: despite the schema/prompt asking for 0-100,
    // models occasionally return confidence as a 0-1 fraction instead.
    if (
      parsed &&
      typeof parsed === "object" &&
      "confidence" in parsed &&
      typeof (parsed as { confidence: unknown }).confidence === "number" &&
      (parsed as { confidence: number }).confidence > 0 &&
      (parsed as { confidence: number }).confidence <= 1
    ) {
      (parsed as { confidence: number }).confidence = Math.round((parsed as { confidence: number }).confidence * 100);
    }

    if (!isValidAnalysisResult(parsed)) {
      return NextResponse.json({ error: "Gemini response did not match the expected shape" }, { status: 502 });
    }

    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error("Measurement analysis error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 502 });
  }
}
