"use client";

import { useTranslations, useLocale } from "next-intl";
import { Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { MEASUREMENT_RANGES, type MeasurementField } from "@/lib/measurements";
import { SPECIALTY_CATEGORIES, getSpecialtyLabel } from "@/lib/map-helpers";

export interface MeasurementFormValues {
  height: string;
  bust: string;
  waist: string;
  hips: string;
  age: string;
  weight: string;
  dress_type: string;
}

export type MeasurementFormErrors = Partial<Record<MeasurementField, "required" | "range">>;

interface Props {
  values: MeasurementFormValues;
  onChange: (patch: Partial<MeasurementFormValues>) => void;
  errors: MeasurementFormErrors;
  onSubmit: () => void;
  submitting: boolean;
}

const REQUIRED_FIELDS: { key: MeasurementField; labelKey: string }[] = [
  { key: "height", labelKey: "heightLabel" },
  { key: "bust", labelKey: "bustLabel" },
  { key: "waist", labelKey: "waistLabel" },
  { key: "hips", labelKey: "hipsLabel" },
];

export default function MeasurementForm({ values, onChange, errors, onSubmit, submitting }: Props) {
  const t = useTranslations("Measurements");
  const locale = useLocale();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {REQUIRED_FIELDS.map(({ key, labelKey }) => {
          const range = MEASUREMENT_RANGES[key];
          const error = errors[key];
          return (
            <div key={key} className="space-y-1.5">
              <Input
                type="number"
                inputMode="decimal"
                label={`${t(labelKey)} (cm)`}
                value={values[key]}
                onChange={(e) => onChange({ [key]: e.target.value } as Partial<MeasurementFormValues>)}
                placeholder={`${range.min}–${range.max}`}
                className={error ? "border-destructive focus-visible:ring-destructive/30" : undefined}
                required
              />
              {error && (
                <p className="text-xs font-medium text-destructive">
                  {error === "required" ? t("errorRequired") : t("errorRange", { min: range.min, max: range.max })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Input
          type="number"
          inputMode="numeric"
          label={t("ageLabel")}
          value={values.age}
          onChange={(e) => onChange({ age: e.target.value })}
          placeholder={t("optional")}
        />
        <Input
          type="number"
          inputMode="decimal"
          label={`${t("weightLabel")} (kg)`}
          value={values.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          placeholder={t("optional")}
        />
        <div className="w-full space-y-1.5">
          <label className="text-sm font-semibold tracking-tight text-foreground">{t("dressTypeLabel")}</label>
          <select
            value={values.dress_type}
            onChange={(e) => onChange({ dress_type: e.target.value })}
            className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
          >
            <option value="">{t("optional")}</option>
            {SPECIALTY_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {getSpecialtyLabel(cat.value, locale)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {submitting ? t("analyzing") : t("analyzeButton")}
      </button>
    </form>
  );
}
