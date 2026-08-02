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

export interface SizeBand {
  maxBust: number;
  maxWaist: number;
  maxHips: number;
  eu: string;
  us: string;
  fr: string;
}

// Standard European ready-to-wear grading: ~4cm per size step, using the
// conventional bust/waist/hips deltas (waist runs ~18cm under bust, hips
// ~6cm over bust). Bust breakpoints match this project's original chart;
// waist/hips are added so a size is judged on all three measurements
// instead of bust alone. Deterministic and independent of the Gemini call —
// shown alongside its qualitative analysis, not derived from it.
export const SIZE_CHART: SizeBand[] = [
  { maxBust: 81, maxWaist: 63, maxHips: 87, eu: "34", us: "2", fr: "34" },
  { maxBust: 85, maxWaist: 67, maxHips: 91, eu: "36", us: "4", fr: "36" },
  { maxBust: 89, maxWaist: 71, maxHips: 95, eu: "38", us: "6", fr: "38" },
  { maxBust: 93, maxWaist: 75, maxHips: 99, eu: "40", us: "8", fr: "40" },
  { maxBust: 97, maxWaist: 79, maxHips: 103, eu: "42", us: "10", fr: "42" },
  { maxBust: 102, maxWaist: 84, maxHips: 108, eu: "44", us: "12", fr: "44" },
  { maxBust: 107, maxWaist: 89, maxHips: 113, eu: "46", us: "14", fr: "46" },
  { maxBust: 112, maxWaist: 94, maxHips: 118, eu: "48", us: "16", fr: "48" },
  { maxBust: 117, maxWaist: 99, maxHips: 123, eu: "50", us: "18", fr: "50" },
  { maxBust: 122, maxWaist: 104, maxHips: 128, eu: "52", us: "20", fr: "52" },
];

function bandIndexFor(value: number, key: "maxBust" | "maxWaist" | "maxHips"): number {
  const idx = SIZE_CHART.findIndex((b) => value <= b[key]);
  return idx === -1 ? SIZE_CHART.length - 1 : idx;
}

// Judges the band on all three measurements by taking the median of the
// three independently-implied bands, so one outlying measurement (e.g. a
// data-entry slip) doesn't swing the result on its own.
export function getMatchedBandIndex(bust: number, waist: number, hips: number): number {
  const indices = [bandIndexFor(bust, "maxBust"), bandIndexFor(waist, "maxWaist"), bandIndexFor(hips, "maxHips")].sort(
    (a, b) => a - b
  );
  return indices[1];
}

export interface SizeChartResult {
  eu: string;
  us: string;
  fr: string;
}

export function deriveSizeChart(bust: number, waist: number, hips: number): SizeChartResult {
  const band = SIZE_CHART[getMatchedBandIndex(bust, waist, hips)];
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
