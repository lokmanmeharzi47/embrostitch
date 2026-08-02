"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getMatchedBandIndex } from "@/lib/measurements";
import SizeChartTable from "./SizeChartTable";

const STEPS = [
  { number: 1, key: "height" },
  { number: 2, key: "bust" },
  { number: 3, key: "waist" },
  { number: 4, key: "hips" },
] as const;

function MannequinIllustration() {
  return (
    <Image
      src="/mesure.png"
      alt=""
      width={1024}
      height={1536}
      className="mx-auto h-auto w-full max-w-xs"
      aria-hidden="true"
    />
  );
}

interface Props {
  bust?: number;
  waist?: number;
  hips?: number;
}

export default function MeasurementGuide({ bust, waist, hips }: Props) {
  const t = useTranslations("Measurements");
  const [collapsed, setCollapsed] = useState(false);
  const highlightIndex = bust && waist && hips ? getMatchedBandIndex(bust, waist, hips) : undefined;

  return (
    <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <Ruler className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">{t("guideEyebrow")}</span>
      </div>
      <h2 className="font-serif text-2xl text-foreground md:text-3xl">{t("guideTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("guideSubtitle")}</p>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary md:hidden"
      >
        {collapsed ? t("guideExpand") : t("guideCollapse")}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-180"}`} />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden md:!h-auto md:!opacity-100"
          >
            <div className="mt-6">
              <MannequinIllustration />
            </div>

            <ol className="mt-6 space-y-4">
              {STEPS.map((step) => (
                <li key={step.key} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {step.number}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t(`guide.${step.key}.title`)}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{t(`guide.${step.key}.hint`)}</p>
                  </div>
                </li>
              ))}
            </ol>

            <SizeChartTable highlightIndex={highlightIndex} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
