"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "creator">("client");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      role,
    });

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push(`/login?registered=true`);
      }, 1200);
    }
  };

  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070&auto=format&fit=crop"
      imageAlt="Tailleur mesurant un tissu"
      quote="Connecter les meilleurs artisans du monde avec ceux qui valorisent l'expression personnelle."
      author="Mission MALIXA"
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Créer un Compte
        </h1>
        <p className="text-muted-foreground mb-8">
          Rejoignez la communauté de créateurs et passionnés de mode.
        </p>

        {success && (
          <div className="mb-4 p-4 rounded-2xl bg-success/10 border border-success/20 text-success text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-top-2">
            <Sparkles className="h-5 w-5" />
            Compte créé ! Redirection vers la page de connexion…
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-start gap-3 animate-in slide-in-from-top-2">
            <span className="material-icons text-base mt-0.5 shrink-0">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center w-full"
        >
          {/* Role Selection */}
          <div className="w-full mb-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Je souhaite m&apos;inscrire en tant que :
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label
                className={`relative flex cursor-pointer border p-3 rounded-xl transition-colors ${role === "client"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="client"
                  className="sr-only"
                  checked={role === "client"}
                  onChange={() => setRole("client")}
                />
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    role === "client" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <User size={18} />
                  </div>
                  <span className="text-sm font-semibold">Client</span>
                </div>
              </label>

              <label
                className={`relative flex cursor-pointer border p-3 pl-1 rounded-xl transition-colors ${role === "creator"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  className="sr-only"
                  checked={role === "creator"}
                  onChange={() => setRole("creator")}
                />
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    role === "creator" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <Sparkles size={18} />
                  </div>
                  <span className="text-sm font-semibold">Créatrice</span>
                </div>
              </label>

            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <Input
              label="Prénom"
              type="text"
              placeholder="Amina"
              required
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target.value)
              }
            />
            <Input
              label="Nom"
              type="text"
              placeholder="Belkacem"
              required
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target.value)
              }
            />
          </div>

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
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />

          <p className="text-xs text-muted-foreground pt-2 text-center">
            En créant un compte, vous acceptez nos{" "}
            <Link
              href="/terms"
              className="font-medium text-primary hover:underline"
            >
              Conditions d&apos;utilisation
            </Link>{" "}
            et{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary hover:underline"
            >
              Politique de confidentialité
            </Link>
            .
          </p>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles size={18} />
                </motion.div>
                Création...
              </span>
            ) : (
              "Créer le Compte"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Déjà inscrit(e) ?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
