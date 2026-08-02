"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { number: 1, key: "height" },
  { number: 2, key: "bust" },
  { number: 3, key: "waist" },
  { number: 4, key: "hips" },
] as const;

function GuideBadge({ number, x, y }: { number: number; x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="11" fill="var(--color-primary)" />
      <text
        x="0"
        y="1"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="700"
        fill="var(--color-primary-foreground)"
      >
        {number}
      </text>
    </g>
  );
}

function MannequinIllustration() {
  return (
    <svg viewBox="0 0 240 420" className="mx-auto h-auto w-full max-w-xs" aria-hidden="true">
      {/* Height indicator */}
      <line x1="22" y1="14" x2="22" y2="398" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M17,14 L22,6 L27,14" fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
      <path d="M17,398 L22,406 L27,398" fill="none" stroke="var(--color-border)" strokeWidth="1.5" />

      {/* Guide lines to silhouette */}
      <line x1="34" y1="145" x2="55" y2="145" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="34" y1="210" x2="82" y2="210" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="34" y1="290" x2="48" y2="290" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Mannequin silhouette */}
      <path
        d="M106,30 C134,30 138,50 138,55 C138,60 175,70 175,75 C182,95 185,120 185,145 C185,170 158,190 158,210 C158,230 192,260 192,290 C192,320 150,330 150,350 L130,380 L146,400 L94,400 L110,380 C90,330 48,320 48,290 C48,260 82,230 82,210 C82,190 55,170 55,145 C55,120 58,95 65,75 C65,70 102,60 102,55 C102,50 106,30 106,30 Z"
        fill="var(--color-secondary)"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <GuideBadge number={1} x={22} y={206} />
      <GuideBadge number={2} x={45} y={145} />
      <GuideBadge number={3} x={70} y={210} />
      <GuideBadge number={4} x={40} y={290} />
    </svg>
  );
}

export default function MeasurementGuide() {
  const t = useTranslations("Measurements");
  const [collapsed, setCollapsed] = useState(false);

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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
