"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Inbox,
  ArrowLeft,
} from "lucide-react";

function maskEmail(email: string): string {
  if (!email.includes("@")) return email;
  const [name, domain] = email.split("@");
  const domainParts = domain.split(".");
  const maskedName =
    name.length <= 2
      ? name[0] + "•".repeat(Math.max(1, name.length - 1))
      : name.slice(0, 2) + "•".repeat(name.length - 2);
  const maskedDomain =
    domainParts[0][0] +
    "•".repeat(Math.max(1, domainParts[0].length - 1)) +
    "." +
    domainParts.slice(1).join(".");
  return maskedName + "@" + maskedDomain;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendError, setResendError] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return;
    setResending(true);
    setResendError(false);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setResendDone(true);
      setCountdown(60);
      setTimeout(() => setResendDone(false), 4000);
    } catch {
      setResendError(true);
      setTimeout(() => setResendError(false), 4000);
    } finally {
      setResending(false);
    }
  };

  const STEPS = [
    { icon: Inbox, label: "Ouvrez votre boîte de réception" },
    { icon: Mail, label: "Trouvez l'email d'MALIXA" },
    { icon: CheckCircle, label: "Cliquez sur « Confirmer mon email »" },
  ];

  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated envelope */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative inline-flex items-center justify-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-100/60">
          <Mail className="w-9 h-9 text-amber-500" />
        </div>
        {/* Floating dots */}
        {[
          { top: "-6px", right: "-6px", delay: 0 },
          { top: "4px", right: "-14px", delay: 0.25 },
          { top: "-14px", right: "4px", delay: 0.5 },
        ].map(({ top, right, delay }, i) => (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full bg-amber-300/70"
            style={{ top, right }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, delay }}
          />
        ))}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
      >
        Vérifiez votre email
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <p className="text-muted-foreground text-sm mb-2">
          Nous avons envoyé un lien de confirmation à
        </p>
        {email && (
          <div className="inline-block bg-muted/50 border border-border/70 rounded-lg px-4 py-2 mb-4">
            <span className="text-foreground font-semibold text-sm tracking-wide">
              {maskEmail(email)}
            </span>
          </div>
        )}
        <p className="text-muted-foreground text-[13px] mb-8 leading-relaxed max-w-[320px] mx-auto">
          Cliquez sur le lien dans l'email pour activer votre compte et accéder
          à toutes les fonctionnalités d'MALIXA.
        </p>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="w-full space-y-2.5 mb-7 text-left"
      >
        {STEPS.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.07 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40"
          >
            <div className="w-8 h-8 bg-primary/10 border border-primary/15 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={15} className="text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Spam notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.48 }}
        className="w-full mb-7 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-left"
      >
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Vous ne trouvez pas l'email ? Vérifiez votre dossier{" "}
          <strong>spam</strong> ou <strong>courrier indésirable</strong>.
        </p>
      </motion.div>

      {/* Resend section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.54 }}
        className="w-full mb-8"
      >
        <p className="text-sm text-muted-foreground mb-3">
          Vous n'avez pas reçu l'email ?
        </p>

        <AnimatePresence mode="wait">
          {resendDone ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"
            >
              <CheckCircle size={14} />
              Email renvoyé avec succès !
            </motion.span>
          ) : resendError ? (
            <motion.span
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500"
            >
              <AlertCircle size={14} />
              Erreur lors du renvoi
            </motion.span>
          ) : (
            <motion.button
              key="btn"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {resending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.9,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw size={13} />
                  </motion.div>
                  Envoi en cours…
                </>
              ) : countdown > 0 ? (
                `Renvoyer dans ${countdown}s`
              ) : (
                "Renvoyer l'email de confirmation"
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Countdown ring */}
        {countdown > 0 && !resendDone && !resendError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-3"
          >
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeDasharray={`${(countdown / 60) * 100} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
                {countdown}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom links */}
      <div className="w-full pt-5 border-t border-border/40 flex flex-col gap-2 items-center">
        <p className="text-xs text-muted-foreground">
          Mauvaise adresse email ?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Recréer un compte
          </Link>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={12} />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2070&auto=format&fit=crop"
      imageAlt="Textile artisanal algérien"
      quote="Chaque fil est une promesse, chaque création une histoire à part entière."
      author="MALIXA"
    >
      <Suspense fallback={<div className="h-96 animate-pulse" />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
