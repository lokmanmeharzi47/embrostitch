"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Mail,
  ArrowLeft,
  Star,
  CheckCircle,
  Lock,
  Shield,
  Eye,
  Sparkles,
} from "lucide-react";

/* ─── Template definitions ─── */
const TEMPLATES = [
  {
    id: "welcome",
    label: "Email de bienvenue",
    subject: "Bienvenue dans la communauté EmbroCraftDZ ✨",
    sender: "EmbroCraftDZ <hello@embrocraftdz.com>",
    preview: "Votre compte a été créé avec succès — découvrez la marketplace",
    icon: Sparkles,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accentColor: "#c9954a",
    headerBg: "#1a1108",
    file: "/emails/welcome.html",
    description: "Envoyé après la création d'un compte. Accueille l'utilisateur et présente la plateforme.",
  },
  {
    id: "verify",
    label: "Confirmation d'email",
    subject: "Confirmez votre adresse email — EmbroCraftDZ",
    sender: "EmbroCraftDZ <noreply@embrocraftdz.com>",
    preview: "Une dernière étape pour activer votre compte EmbroCraftDZ",
    icon: Mail,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accentColor: "#4f46e5",
    headerBg: "#1a1108",
    file: "/emails/verify-email.html",
    description: "Envoyé lors de l'inscription. Contient le lien de vérification de l'adresse email.",
  },
  {
    id: "reset",
    label: "Réinitialisation",
    subject: "Réinitialiser votre mot de passe — EmbroCraftDZ",
    sender: "EmbroCraftDZ <noreply@embrocraftdz.com>",
    preview: "Lien de réinitialisation valide 1 heure — ignorez si ce n'était pas vous",
    icon: Lock,
    iconBg: "bg-zinc-100",
    iconColor: "text-zinc-600",
    accentColor: "#c9954a",
    headerBg: "#141414",
    file: "/emails/reset-password.html",
    description: "Envoyé lors d'une demande de mot de passe oublié. Contient un lien sécurisé expirant en 1h.",
  },
  {
    id: "changed",
    label: "Mot de passe modifié",
    subject: "✅ Votre mot de passe a été mis à jour",
    sender: "EmbroCraftDZ Security <security@embrocraftdz.com>",
    preview: "Modification confirmée — contactez-nous si ce n'était pas vous",
    icon: Shield,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accentColor: "#10b981",
    headerBg: "#0d2218",
    file: "/emails/password-changed.html",
    description: "Confirmation de sécurité envoyée après chaque modification réussie de mot de passe.",
  },
];

type ViewMode = "desktop" | "mobile";

/* ─── Inbox preview row ─── */
function InboxRow({
  template,
  isActive,
  onClick,
}: {
  template: (typeof TEMPLATES)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = template.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
        isActive
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-muted/60 border border-transparent"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${template.iconBg}`}
      >
        <Icon size={14} className={template.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-bold text-foreground truncate">
            EmbroCraftDZ
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            Maintenant
          </span>
        </div>
        <p className="text-xs font-medium text-foreground/80 truncate leading-tight mb-0.5">
          {template.subject}
        </p>
        <p className="text-[11px] text-muted-foreground truncate leading-tight">
          {template.preview}
        </p>
      </div>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );
}

/* ─── Main page ─── */
export default function EmailPreviewPage() {
  const [active, setActive] = useState(TEMPLATES[0]);
  const [view, setView] = useState<ViewMode>("desktop");

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border/60 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
            Accueil
          </Link>
          <span className="text-border/60">·</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">
              EmbroCraft<span className="text-primary">DZ</span>
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-wide">
              Email Preview
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setView("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === "desktop"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor size={13} />
            Desktop
          </button>
          <button
            onClick={() => setView("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === "mobile"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone size={13} />
            Mobile
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-72 shrink-0 bg-white border-r border-border/60 flex flex-col overflow-hidden">
          {/* Inbox header */}
          <div className="px-4 pt-5 pb-3 border-b border-border/40">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground">Boîte de réception</h2>
              <span className="text-[11px] font-semibold text-white bg-primary rounded-full px-2 py-0.5">
                {TEMPLATES.length}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Aperçu de tous les emails transactionnels
            </p>
          </div>

          {/* Template list as inbox rows */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {TEMPLATES.map((t) => (
              <InboxRow
                key={t.id}
                template={t}
                isActive={active.id === t.id}
                onClick={() => setActive(t)}
              />
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-border/40">
            <div className="text-[11px] text-muted-foreground space-y-1">
              <p className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-emerald-500" />
                Responsive mobile-first
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-emerald-500" />
                Dark mode compatible
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-emerald-500" />
                Compatible Gmail / Outlook
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN PREVIEW AREA ── */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Email header bar (simulated Gmail) */}
          <div className="bg-white border-b border-border/60 px-6 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-foreground mb-1 leading-tight">
                  {active.subject}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${active.iconBg}`}
                    >
                      <active.icon size={12} className={active.iconColor} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {active.sender}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60">
                    → vous
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star size={14} className="text-muted-foreground/40" />
                <Eye size={14} className="text-muted-foreground/40" />
              </div>
            </div>

            {/* Preview text row */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/60 italic">
                {active.preview}
              </span>
            </div>
          </div>

          {/* Email iframe preview */}
          <div className="flex-1 overflow-auto bg-zinc-100 flex items-start justify-center py-8 px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id + view}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`bg-white shadow-2xl shadow-black/10 rounded-2xl overflow-hidden transition-all ${
                  view === "mobile"
                    ? "w-[390px] ring-4 ring-zinc-800 rounded-[36px] shadow-[0_0_0_8px_#18181b,0_20px_60px_rgba(0,0,0,0.35)]"
                    : "w-full max-w-[680px]"
                }`}
                style={view === "mobile" ? { minHeight: 700 } : {}}
              >
                {/* Mobile notch */}
                {view === "mobile" && (
                  <div className="h-8 bg-zinc-900 flex items-center justify-center">
                    <div className="w-20 h-1.5 bg-zinc-600 rounded-full" />
                  </div>
                )}

                <iframe
                  key={active.file + view}
                  src={active.file}
                  title={active.label}
                  className="w-full border-0 block"
                  style={{
                    height: view === "mobile" ? "780px" : "820px",
                    display: "block",
                  }}
                  sandbox="allow-same-origin"
                />

                {/* Mobile home bar */}
                {view === "mobile" && (
                  <div className="h-8 bg-zinc-900 flex items-center justify-center">
                    <div className="w-28 h-1 bg-zinc-500 rounded-full" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ── RIGHT META PANEL ── */}
        <aside className="w-64 shrink-0 bg-white border-l border-border/60 flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-border/40">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1">
              Infos template
            </h3>
          </div>

          <div className="p-5 space-y-5">
            {/* Template badge */}
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${active.iconBg} mb-3`}
              >
                <active.icon size={13} className={active.iconColor} />
                <span className={`text-xs font-bold ${active.iconColor}`}>
                  {active.label}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {active.description}
              </p>
            </div>

            {/* Subject line */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                Objet
              </p>
              <p className="text-xs text-foreground font-medium leading-relaxed bg-muted/50 rounded-lg px-3 py-2">
                {active.subject}
              </p>
            </div>

            {/* Sender */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                Expéditeur
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed break-all">
                {active.sender}
              </p>
            </div>

            {/* Variables */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                Variables
              </p>
              <div className="space-y-1.5">
                {getVariables(active.id).map((v) => (
                  <div
                    key={v}
                    className="text-[11px] font-mono bg-muted/50 text-primary px-2.5 py-1 rounded-md"
                  >
                    {`{{${v}}}`}
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
                Compatibilité
              </p>
              <div className="space-y-1.5">
                {[
                  "Gmail Web",
                  "Gmail Mobile",
                  "Apple Mail",
                  "Outlook 2019+",
                  "Dark mode",
                  "RTL (Arabe)",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                    <span className="text-[11px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File path */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1.5">
                Fichier
              </p>
              <p className="text-[10px] font-mono text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-2 break-all leading-relaxed">
                src/emails/{active.file.split("/").pop()}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getVariables(id: string): string[] {
  switch (id) {
    case "welcome":
      return ["first_name", "dashboard_url", "privacy_url", "terms_url", "unsubscribe_url"];
    case "verify":
      return ["first_name", "confirm_url", "privacy_url", "terms_url"];
    case "reset":
      return ["first_name", "email", "reset_url", "privacy_url", "terms_url"];
    case "changed":
      return ["first_name", "email", "changed_at", "login_url", "privacy_url", "terms_url"];
    default:
      return [];
  }
}
