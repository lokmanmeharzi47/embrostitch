"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle, RefreshCw, Shield, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const startCountdown = () => setCountdown(60);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` }
    );

    setLoading(false);
    if (resetError) {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
    } else {
      setSent(true);
      startCountdown();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendSuccess(false);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setResending(false);
    setResendSuccess(true);
    startCountdown();
    setTimeout(() => setResendSuccess(false), 3000);
  };

  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop"
      imageAlt="Fils de broderie dorés"
      quote="Chaque difficulté est un fil que l'on retisse avec patience et sagesse."
      author="Artisanes MALIXA"
    >
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group"
            >
              <ArrowLeft
                size={15}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Retour à la connexion
            </Link>

            <div className="mb-8">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <Mail className="w-6 h-6 text-amber-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                Mot de passe oublié ?
              </h1>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                Pas de panique. Saisissez votre adresse email et nous vous
                enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start gap-3"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 flex flex-col items-center w-full"
            >
              <Input
                label="Adresse Email"
                type="email"
                placeholder="nom@exemple.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        ease: "linear",
                      }}
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                    Envoi en cours…
                  </span>
                ) : (
                  "Envoyer les instructions"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/60 flex items-start gap-3">
              <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pour votre sécurité, le lien de réinitialisation expire après{" "}
                <strong className="text-foreground/70">1 heure</strong>.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Success icon */}
            <div className="flex justify-center mb-7">
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-300"
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2 text-center tracking-tight">
              Vérifiez votre email
            </h1>
            <p className="text-muted-foreground mb-1 text-center text-[14px] leading-relaxed">
              Un lien de réinitialisation a été envoyé à
            </p>
            <p className="text-foreground font-semibold text-center mb-7 text-sm bg-muted/50 border border-border/60 rounded-lg px-4 py-2 inline-block mx-auto">
              {email}
            </p>

            {/* Steps */}
            <div className="space-y-2.5 mb-7">
              {[
                "Ouvrez votre boîte de réception",
                "Cliquez sur « Réinitialiser le mot de passe »",
                "Créez un nouveau mot de passe sécurisé",
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 border border-primary/20">
                    {i + 1}
                  </div>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </motion.div>
              ))}
            </div>

            {/* Spam notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 mb-7">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Vous ne trouvez pas l'email ? Vérifiez votre dossier{" "}
                <strong>spam</strong> ou <strong>courrier indésirable</strong>.
              </p>
            </div>

            {/* Resend section */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-3">
                Vous n'avez pas reçu l'email ?
              </p>

              <button
                onClick={handleResend}
                disabled={countdown > 0 || resending}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all disabled:cursor-not-allowed"
                style={{
                  color:
                    resendSuccess
                      ? "#10b981"
                      : countdown > 0
                      ? "var(--muted-foreground)"
                      : "var(--primary)",
                  opacity: countdown > 0 && !resending ? 0.65 : 1,
                }}
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
                ) : resendSuccess ? (
                  <>
                    <CheckCircle size={13} />
                    Email renvoyé !
                  </>
                ) : countdown > 0 ? (
                  `Renvoyer dans ${countdown}s`
                ) : (
                  "Renvoyer l'email"
                )}
              </button>

              {countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-3"
                >
                  <div className="relative w-9 h-9">
                    <svg
                      className="w-9 h-9 -rotate-90"
                      viewBox="0 0 36 36"
                    >
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
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                Retour à la connexion
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
