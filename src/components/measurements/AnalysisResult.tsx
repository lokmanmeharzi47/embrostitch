"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertTriangle, Sparkles, BookmarkPlus, Loader2 } from "lucide-react";
import type { MeasurementAnalysisResult, SizeChartResult } from "@/lib/measurements";

interface Props {
  result: MeasurementAnalysisResult;
  sizeChart: SizeChartResult;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
}

export default function AnalysisResult({ result, sizeChart, canSave, saving, onSave }: Props) {
  const t = useTranslations("Measurements");
  const hasWarnings = result.warnings.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-8 overflow-hidden rounded-[24px] border border-border bg-card shadow-lg"
    >
      <div
        className={`flex items-start gap-3 border-b border-border p-6 ${
          hasWarnings ? "bg-warning-light" : "bg-success-light"
        }`}
      >
        {hasWarnings ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        )}
        <div>
          <p className={`font-serif text-lg ${hasWarnings ? "text-warning" : "text-success"}`}>
            {hasWarnings ? t("resultWarningTitle") : t("resultOkTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">{result.analysis}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("recommendedSize")}</p>
          <p className="mt-1 font-serif text-3xl text-primary">{result.recommended_size}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("confidence")}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(0, Math.min(100, result.confidence))}%` }}
              />
            </div>
            <span className="text-sm font-bold text-foreground">{Math.round(result.confidence)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-border px-6 py-5">
        <div className="rounded-xl bg-secondary/40 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("sizeEu")}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{sizeChart.eu}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("sizeUs")}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{sizeChart.us}</p>
        </div>
        <div className="rounded-xl bg-secondary/40 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("sizeFr")}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{sizeChart.fr}</p>
        </div>
      </div>

      {hasWarnings && (
        <div className="border-t border-border px-6 py-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-warning">{t("warnings")}</p>
          <ul className="space-y-1.5">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/80">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="border-t border-border px-6 py-5">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" />
            {t("suggestions")}
          </p>
          <ul className="space-y-1.5">
            {result.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-foreground/80">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canSave && (
        <div className="border-t border-border p-6">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary/10 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
            {t("saveThisProfile")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
