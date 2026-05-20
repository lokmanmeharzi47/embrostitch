"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle, Lock, Shield, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Strength {
  level: number;
  label: string;
  color: string;
  textColor: string;
}

function getStrength(pw: string): Strength {
  if (!pw) return { level: 0, label: "", color: "", textColor: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: "Très faible", color: "bg-red-500", textColor: "text-red-500" };
  if (score === 2) return { level: 2, label: "Faible", color: "bg-orange-500", textColor: "text-orange-500" };
  if (score === 3) return { level: 3, label: "Moyen", color: "bg-yellow-500", textColor: "text-yellow-600" };
  if (score === 4) return { level: 4, label: "Fort", color: "bg-emerald-500", textColor: "text-emerald-600" };
  return { level: 5, label: "Très fort", color: "bg-emerald-600", textColor: "text-emerald-700" };
}

const REQUIREMENTS = [
  { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre (0–9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caractère spécial (!@#…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const strength = getStrength(password);
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = password.length >= 8 && passwordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(
        "Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré."
      );
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3500);
    }
  };

  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070&auto=format&fit=crop"
      imageAlt="Broderie artisanale algérienne"
      quote="La sécurité est le fondement de la confiance entre artisans et clients."
      author="EmbroCraftDZ"
    >
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Lock className="w-6 h-6 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              Nouveau mot de passe
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed text-[15px]">
              Choisissez un mot de passe fort et unique pour sécuriser votre
              compte EmbroCraftDZ.
            </p>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 rounded-xl border border-border bg-background px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Strength meter */}
                <AnimatePresence>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="flex gap-1 mb-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                              i <= strength.level
                                ? strength.color
                                : "bg-muted"
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.04 }}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-xs font-semibold ${strength.textColor}`}>
                          {strength.label}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full h-11 rounded-xl border bg-background px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      confirm && !passwordsMatch
                        ? "border-red-400 focus:border-red-400"
                        : confirm && passwordsMatch
                        ? "border-emerald-400 focus:border-emerald-400"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? "Masquer" : "Afficher"}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <AnimatePresence>
                  {confirm && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xs mt-1 flex items-center gap-1 font-medium ${
                        passwordsMatch ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {passwordsMatch ? (
                        <>
                          <CheckCircle size={11} /> Les mots de passe
                          correspondent
                        </>
                      ) : (
                        <>
                          <AlertCircle size={11} /> Les mots de passe ne
                          correspondent pas
                        </>
                      )}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Requirements checklist */}
              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                      {REQUIREMENTS.map((req, i) => {
                        const met = req.test(password);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-2.5"
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                                met
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-muted text-muted-foreground/50"
                              }`}
                            >
                              {met ? (
                                <CheckCircle size={10} strokeWidth={2.5} />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-current block" />
                              )}
                            </div>
                            <span
                              className={`text-xs transition-colors duration-200 ${
                                met
                                  ? "text-emerald-700 font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {req.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={!canSubmit}
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
                      <Sparkles size={16} />
                    </motion.div>
                    Mise à jour…
                  </span>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </form>

            <div className="mt-5 p-3.5 rounded-xl bg-muted/50 border border-border/60 flex items-start gap-3">
              <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Après la mise à jour, vous serez déconnecté de tous vos
                appareils pour des raisons de sécurité.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            {/* Animated success icon */}
            <div className="flex justify-center mb-7">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.05,
                }}
                className="relative w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-emerald-300"
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    delay: 0.3,
                    ease: "easeOut",
                  }}
                />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mb-3 tracking-tight"
            >
              Mot de passe mis à jour !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-muted-foreground mb-8 leading-relaxed text-[14px]"
            >
              Votre mot de passe a été modifié avec succès. Vous allez être
              redirigé vers la connexion dans quelques secondes.
            </motion.p>

            {/* Loading dots */}
            <div className="flex justify-center gap-1.5 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Se connecter maintenant
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
