"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Palette, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Découvrez les Talents",
    description:
      "Parcourez des centaines de portfolios vérifiés. Filtrez par spécialité, ville, budget et note. Chaque artisan est authentifié par notre équipe.",
    color: "from-violet-500 to-indigo-600",
    bg: "bg-violet-50",
    accent: "text-violet-600",
    badge: "Facile",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    number: "02",
    icon: Palette,
    title: "Personnalisez & Commandez",
    description:
      "Collaborez directement avec votre couturière. Partagez vos inspirations, choisissez les tissus, définissez les mesures et validez le projet ensemble.",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    accent: "text-amber-600",
    badge: "Rapide",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    number: "03",
    icon: Package,
    title: "Recevez Votre Pièce",
    description:
      "Votre création sur mesure est méticuleusement confectionnée et livrée directement chez vous. Satisfaction garantie ou remboursée.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    accent: "text-emerald-600",
    badge: "Garanti",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden section-gradient">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="section-label mb-4 inline-flex">
            <span>⚡</span>
            Processus Simple
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-5 leading-tight">
            De l&apos;idée à la{" "}
            <span className="text-gradient-primary">réalité</span>
            <br />
            en 3 étapes
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Un processus pensé pour être simple, transparent et agréable — du premier contact jusqu&apos;à la livraison.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px z-0">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-border to-transparent" />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-400 via-amber-400 to-emerald-400 animate-gradient"
              style={{ width: "100%", opacity: 0.4, backgroundSize: "200% 100%" }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="relative group bg-white rounded-3xl border border-border/60 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 card-shadow h-full">
                    {/* Step number badge */}
                    <div className="absolute -top-4 right-6 z-10">
                      <div className={`px-3 py-1 rounded-full text-xs font-black ${step.badgeColor} shadow-sm`}>
                        {step.badge}
                      </div>
                    </div>

                    {/* Icon container */}
                    <div className="mb-6">
                      <div className="relative inline-flex">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div
                          className={`absolute -top-1.5 -right-1.5 w-7 h-7 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
                        >
                          <span className="text-white text-[9px] font-black">{step.number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black text-foreground mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {/* Arrow indicator */}
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
            className="inline-flex items-center gap-3 px-8 py-4 primary-gradient text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-95 transition-all group"
          >
            Commencer maintenant
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Inscription gratuite · Aucune commission cachée
          </p>
        </motion.div>
      </div>
    </section>
  );
}
