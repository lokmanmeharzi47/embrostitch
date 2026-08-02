"use client";

import { useTranslations } from "next-intl";
import { SIZE_CHART, type SizeBand } from "@/lib/measurements";

interface Props {
  highlightIndex?: number;
}

function rangeLabel(band: SizeBand, prevBand: SizeBand | undefined, key: "maxBust" | "maxWaist" | "maxHips") {
  const max = band[key];
  if (!prevBand) return `≤ ${max}`;
  return `${prevBand[key] + 1}–${max}`;
}

export default function SizeChartTable({ highlightIndex }: Props) {
  const t = useTranslations("Measurements");

  return (
    <div className="mt-6 border-t border-border pt-6">
      <p className="text-sm font-bold text-foreground">{t("sizeChartTitle")}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("sizeChartHint")}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pe-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("sizeEu")}
              </th>
              <th className="py-2 pe-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("sizeUs")}
              </th>
              <th className="py-2 pe-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("sizeFr")}
              </th>
              <th className="py-2 pe-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("bustLabel")} (cm)
              </th>
              <th className="py-2 pe-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("waistLabel")} (cm)
              </th>
              <th className="py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("hipsLabel")} (cm)
              </th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((band, i) => {
              const prevBand = SIZE_CHART[i - 1];
              const isMatch = i === highlightIndex;
              return (
                <tr
                  key={band.eu}
                  className={`border-b border-border/60 last:border-0 ${isMatch ? "bg-primary/10 font-bold text-primary" : "text-foreground/80"}`}
                >
                  <td className="py-2 pe-3">{band.eu}</td>
                  <td className="py-2 pe-3">{band.us}</td>
                  <td className="py-2 pe-3">{band.fr}</td>
                  <td className="py-2 pe-3">{rangeLabel(band, prevBand, "maxBust")}</td>
                  <td className="py-2 pe-3">{rangeLabel(band, prevBand, "maxWaist")}</td>
                  <td className="py-2">{rangeLabel(band, prevBand, "maxHips")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
