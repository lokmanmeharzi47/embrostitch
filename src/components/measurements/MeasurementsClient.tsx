"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles, X, Check } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { validateMeasurements, deriveSizeChart, type MeasurementAnalysisResult } from "@/lib/measurements";
import MeasurementGuide from "./MeasurementGuide";
import MeasurementForm, { type MeasurementFormValues, type MeasurementFormErrors } from "./MeasurementForm";
import AnalysisResult from "./AnalysisResult";
import SavedProfilesList from "./SavedProfilesList";

export interface SavedMeasurementProfile {
  id: string;
  user_id: string;
  label: string;
  height: number;
  bust: number;
  waist: number;
  hips: number;
  age: number | null;
  weight: number | null;
  dress_type: string | null;
  recommended_size: string | null;
  ai_confidence: number | null;
  ai_analysis: string | null;
  ai_warnings: string[] | null;
  ai_suggestions: string[] | null;
  created_at: string;
  updated_at: string;
}

const EMPTY_VALUES: MeasurementFormValues = {
  height: "",
  bust: "",
  waist: "",
  hips: "",
  age: "",
  weight: "",
  dress_type: "",
};

export default function MeasurementsClient({
  initialProfiles,
  isLoggedIn,
}: {
  initialProfiles: SavedMeasurementProfile[];
  isLoggedIn: boolean;
}) {
  const t = useTranslations("Measurements");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [values, setValues] = useState<MeasurementFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<MeasurementFormErrors>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MeasurementAnalysisResult | null>(null);
  const [profiles, setProfiles] = useState<SavedMeasurementProfile[]>(initialProfiles);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (patch: Partial<MeasurementFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  };

  const handleUseProfile = (profile: SavedMeasurementProfile) => {
    setValues({
      height: String(profile.height),
      bust: String(profile.bust),
      waist: String(profile.waist),
      hips: String(profile.hips),
      age: profile.age ? String(profile.age) : "",
      weight: profile.weight ? String(profile.weight) : "",
      dress_type: profile.dress_type || "",
    });
    setErrors({});
    setResult(
      profile.ai_analysis && profile.recommended_size && profile.ai_confidence !== null
        ? {
            valid: !(profile.ai_warnings && profile.ai_warnings.length > 0),
            confidence: profile.ai_confidence,
            recommended_size: profile.recommended_size,
            analysis: profile.ai_analysis,
            warnings: profile.ai_warnings || [],
            suggestions: profile.ai_suggestions || [],
          }
        : null
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnalyze = async () => {
    const validation = validateMeasurements(values);
    setErrors(validation.errors);
    if (!validation.valid) {
      toast.error(t("fixErrorsToast"));
      return;
    }

    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch("/api/measurements/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: Number(values.height),
          bust: Number(values.bust),
          waist: Number(values.waist),
          hips: Number(values.hips),
          age: values.age ? Number(values.age) : undefined,
          weight: values.weight ? Number(values.weight) : undefined,
          dress_type: values.dress_type || undefined,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.result as MeasurementAnalysisResult);
    } catch (err) {
      console.error(err);
      toast.error(t("analyzeErrorToast"));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveClick = () => {
    if (!user) {
      router.push("/login?redirect=/measurements");
      return;
    }
    setSaveLabel(t("defaultLabel"));
    setShowSavePrompt(true);
  };

  const confirmSave = async () => {
    if (!user || !result) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("saved_measurements")
      .insert({
        user_id: user.id,
        label: saveLabel.trim() || t("defaultLabel"),
        height: Number(values.height),
        bust: Number(values.bust),
        waist: Number(values.waist),
        hips: Number(values.hips),
        age: values.age ? Number(values.age) : null,
        weight: values.weight ? Number(values.weight) : null,
        dress_type: values.dress_type || null,
        recommended_size: result.recommended_size,
        ai_confidence: result.confidence,
        ai_analysis: result.analysis,
        ai_warnings: result.warnings,
        ai_suggestions: result.suggestions,
      })
      .select()
      .single();

    setSaving(false);
    if (!error && data) {
      setProfiles((prev) => [data as SavedMeasurementProfile, ...prev]);
      setShowSavePrompt(false);
      toast.success(t("saveSuccessToast"));
    } else {
      toast.error(t("saveErrorToast"));
    }
  };

  const sizeChart = result ? deriveSizeChart(Number(values.bust)) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("eyebrow")}</span>
        </div>
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">{t("pageTitle")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base font-light text-muted-foreground">{t("pageSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
          <MeasurementGuide />
        </div>

        <div>
          <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm md:p-8">
            <MeasurementForm
              values={values}
              onChange={handleChange}
              errors={errors}
              onSubmit={handleAnalyze}
              submitting={analyzing}
            />
          </div>

          {result && sizeChart && (
            <>
              <AnalysisResult result={result} sizeChart={sizeChart} canSave saving={saving} onSave={handleSaveClick} />

              {showSavePrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4"
                >
                  <input
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    placeholder={t("labelPlaceholder")}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/40"
                    autoFocus
                  />
                  <button
                    onClick={confirmSave}
                    disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowSavePrompt(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </>
          )}

          {isLoggedIn && (
            <div className="mt-12">
              <h2 className="mb-4 font-serif text-xl text-foreground">{t("savedProfilesTitle")}</h2>
              <SavedProfilesList profiles={profiles} onProfilesChange={setProfiles} onUseProfile={handleUseProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
