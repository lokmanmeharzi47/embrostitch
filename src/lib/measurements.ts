export const MEASUREMENT_RANGES = {
  height: { min: 120, max: 220 },
  bust: { min: 50, max: 170 },
  waist: { min: 40, max: 160 },
  hips: { min: 60, max: 180 },
} as const;

export type MeasurementField = keyof typeof MEASUREMENT_RANGES;

export interface RawMeasurementInput {
  height: unknown;
  bust: unknown;
  waist: unknown;
  hips: unknown;
}

export interface MeasurementValidation {
  valid: boolean;
  errors: Partial<Record<MeasurementField, "required" | "range">>;
}

// Server-side re-validation, defense in depth against a client that bypasses
// the form's own inline checks. Same ranges as MEASUREMENT_RANGES above.
export function validateMeasurements(input: RawMeasurementInput): MeasurementValidation {
  const errors: MeasurementValidation["errors"] = {};

  (Object.keys(MEASUREMENT_RANGES) as MeasurementField[]).forEach((field) => {
    const raw = input[field];
    if (raw === undefined || raw === null || raw === "") {
      errors[field] = "required";
      return;
    }
    const value = typeof raw === "number" ? raw : Number(raw);
    const { min, max } = MEASUREMENT_RANGES[field];
    if (Number.isNaN(value) || value < min || value > max) {
      errors[field] = "range";
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

interface SizeBand {
  maxBust: number;
  eu: string;
  us: string;
  fr: string;
}

// Standard women's ready-to-wear size chart, keyed primarily on bust
// circumference (the conventional single-axis proxy most charts use).
// Deterministic and independent of the Gemini call — shown alongside its
// qualitative analysis, not derived from it.
const SIZE_CHART: SizeBand[] = [
  { maxBust: 81, eu: "34", us: "2", fr: "34" },
  { maxBust: 85, eu: "36", us: "4", fr: "36" },
  { maxBust: 89, eu: "38", us: "6", fr: "38" },
  { maxBust: 93, eu: "40", us: "8", fr: "40" },
  { maxBust: 97, eu: "42", us: "10", fr: "42" },
  { maxBust: 102, eu: "44", us: "12", fr: "44" },
  { maxBust: 107, eu: "46", us: "14", fr: "46" },
  { maxBust: 112, eu: "48", us: "16", fr: "48" },
  { maxBust: 117, eu: "50", us: "18", fr: "50" },
  { maxBust: 122, eu: "52", us: "20", fr: "52" },
];

export interface SizeChartResult {
  eu: string;
  us: string;
  fr: string;
}

export function deriveSizeChart(bust: number): SizeChartResult {
  const band = SIZE_CHART.find((b) => bust <= b.maxBust) ?? SIZE_CHART[SIZE_CHART.length - 1];
  return { eu: band.eu, us: band.us, fr: band.fr };
}

export interface MeasurementAnalysisResult {
  valid: boolean;
  confidence: number;
  recommended_size: string;
  analysis: string;
  warnings: string[];
  suggestions: string[];
}

// Hand-written type guard for Gemini's structured JSON response — even with
// responseSchema set, the SDK's own docs caveat that output should still be
// validated app-side before trusting it.
export function isValidAnalysisResult(value: unknown): value is MeasurementAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.valid === "boolean" &&
    typeof v.confidence === "number" &&
    typeof v.recommended_size === "string" &&
    typeof v.analysis === "string" &&
    Array.isArray(v.warnings) &&
    v.warnings.every((w) => typeof w === "string") &&
    Array.isArray(v.suggestions) &&
    v.suggestions.every((s) => typeof s === "string")
  );
}
