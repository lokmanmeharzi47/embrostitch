import React from "react";
import Link from "next/link";

const footerLinks = {
  company: [
    { label: "À propos", href: "#" },
    { label: "Notre mission", href: "#" },
    { label: "Presse", href: "#" },
    { label: "Carrières", href: "#" },
  ],
  support: [
    { label: "Centre d'aide", href: "#" },
    { label: "Sécurité", href: "#" },
    { label: "Communauté", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Politique de confidentialité", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                EmbroCraftDZ
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Connecter les meilleurs artisans algériens avec ceux qui
              valorisent la qualité, la tradition et l&apos;expression
              personnelle.
            </p>
            <div className="flex items-center gap-3">
              {["facebook", "twitter", "instagram", "linkedin"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors duration-200"
                    aria-label={social}
                  >
                    <span className="text-white text-xs font-bold uppercase">
                      {social.charAt(0)}
                    </span>
                  </a>
                )
              )}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">
              Entreprise
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">
              Légal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © 2026 EmbroCraftDZ. Tous droits réservés.
          </p>
          <p className="text-xs text-white/40">
            Conçu avec amour pour les artisans algériens.
          </p>
        </div>
      </div>
    </footer>
  );
}
