"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Palette, Package, ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const STEPS = [
  { key: "discover", icon: Search },
  { key: "customize", icon: Palette },
  { key: "receive", icon: Package },
] as const;

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");

  return (
    <section className="py-20 md:py-32 bg-secondary/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t("eyebrow")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-5 leading-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-secondary-foreground/70 font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            >
              <div className="relative bg-card rounded-[20px] border border-border p-8 h-full premium-shadow hover-lift">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-serif text-4xl text-primary/15 select-none">0{i + 1}</span>
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3 leading-tight">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {t(`steps.${key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            {t("cta")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground font-light">
            {t("ctaHint")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
