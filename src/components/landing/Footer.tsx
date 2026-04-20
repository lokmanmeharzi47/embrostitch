"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

const FOOTER_LINKS = {
  platform: [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Comment ça marche", href: "/how-it-works" },
    { label: "Devenir Couturière", href: "/register" },
    { label: "Tarification", href: "#" },
  ],
  support: [
    { label: "Centre d'aide", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Signaler un problème", href: "#" },
    { label: "Communauté", href: "#" },
  ],
  company: [
    { label: "À propos", href: "#" },
    { label: "Notre mission", href: "#" },
    { label: "Carrières", href: "#" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Confidentialité", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-[#0a0a14] text-white overflow-hidden">
      {/* Decorative gradient top edge */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-[120px] pointer-events-none" />

      {/* Newsletter strip */}
      <div className="relative border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-lg text-center lg:text-left">
              <h3 className="text-2xl font-black text-white mb-3">
                Restez inspiré(e) ✨
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                Recevez nos sélections de couturières, conseils de style et actualités de la mode algérienne. Zéro spam, 100% inspiration.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-success/15 border border-success/30 rounded-2xl px-6 py-4"
                >
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <span className="text-success text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Inscrit(e) avec succès !</p>
                    <p className="text-white/50 text-xs">Vous allez recevoir nos meilleures sélections.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-2xl p-2">
                  <div className="flex items-center gap-2 px-3">
                    <Mail className="w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="bg-transparent text-sm text-white placeholder:text-white/35 outline-none min-w-[200px]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 primary-gradient text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
                  >
                    S&apos;abonner
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}


            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-white shadow-lg transition-shadow group-hover:shadow-xl">

                <Image
                  src="/logoa.png"
                  alt="EmbroCraftDZ Logo"
                  fill
                  className="object-contain p-1"
                />

                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-[#0a0a14]" />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors">
                  EmbroCraft<span className="text-primary">DZ</span>
                </p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">
                  Premium Stitch
                </p>
              </div>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-xs">
              La première marketplace de couture artisanale algérienne — connectant créateurs et clients depuis Alger jusqu&apos;à Tamanrasset.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-8">
              {[
                { icon: MapPin, text: "Alger, Algérie" },
                { icon: Mail, text: "embrocraftdz@gmail.com" },
                { icon: Phone, text: "+213 (0) 561 16 71 42" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/45">
                  <Icon className="w-4 h-4 text-white/30 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-5">Plateforme</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.platform.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-5">Support</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-5">Entreprise</h4>
            <ul className="space-y-3 mb-8">
              {FOOTER_LINKS.company.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-5">Légal</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} EmbroCraftDZ. Tous droits réservés.
          </p>
          <p className="text-xs text-white/25 flex items-center gap-1.5">
            Conçu avec{" "}
            <span className="text-rose-400">♥</span>
            {" "}pour les artisans algériens
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>🇩🇿 Made in Algeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
