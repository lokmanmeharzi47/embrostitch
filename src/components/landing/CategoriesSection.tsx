"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const CATEGORIES = [
  {
    key: "karakou",
    image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80",
    href: "/marketplace?category=karakou",
  },
  {
    key: "wedding",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80",
    href: "/marketplace?category=wedding",
  },
  {
    key: "caftan",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80",
    href: "/marketplace?category=caftan",
  },
  {
    key: "hauteCouture",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80",
    href: "/marketplace?category=traditional",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function CategoriesSection() {
  const t = useTranslations("Categories");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/categories/stats');
        const data = await response.json();
        if (data.counts) {
          setCounts(data.counts);
        }
      } catch (e) {
        console.error("Failed to fetch category stats", e);
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
        >
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4 leading-tight">
              {t("title")}
            </h2>
            <p className="text-lg text-secondary-foreground/70 font-light leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors shrink-0 group uppercase tracking-widest"
          >
            {t("viewAll")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.key} variants={itemVariants}>
              <Link href={cat.href} className="block h-[400px] group relative overflow-hidden rounded-[20px]">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  {counts[cat.key] > 0 && (
                    <span className="mb-2 inline-flex w-fit items-center rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/20">
                      {counts[cat.key]}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl text-white mb-2 leading-tight">
                    {t(`items.${cat.key}.name`)}
                  </h3>
                  <p className="text-sm text-white/80 font-light leading-relaxed transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {t(`items.${cat.key}.description`)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
