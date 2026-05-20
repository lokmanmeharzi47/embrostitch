"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            setError(`Erreur de profil : ${profileError.message}`);
            setLoading(false);
            return;
          }

          // Decide where to redirect
          if (profile) {
            if (profile.role === "admin") router.push("/admin/dashboard");
            else if (profile.role === "couturiere") router.push("/couturiere/dashboard");
            else if (profile.role === "creator") router.push("/creator");
            else router.push("/client/dashboard");
          } else {
            // Profile missing - might be a sync issue
            console.warn("Profile missing for user:", user.id);
            // Check metadata as fallback
            const role = user.user_metadata?.role || "client";
            if (role === "admin") router.push("/admin/dashboard");
            else if (role === "couturiere") router.push("/couturiere/dashboard");
            else if (role === "creator") router.push("/creator");
            else router.push("/client/dashboard");
          }
        } catch (err) {
          console.error("Unexpected error fetching profile:", err);
          setError("Une erreur inattendue est survenue avec le profil.");
          setLoading(false);
          return;
        }
      } else {
        router.push("/client/dashboard");
      }
      setTimeout(() => {
        router.refresh();
      }, 100);
    }
  };

  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=2070&auto=format&fit=crop"
      imageAlt="Couturière travaillant sur une machine"
      quote="Découvrez l'élégance de la couture traditionnelle algérienne sur mesure."
      author="Bienvenue sur EmbroCraftDZ"
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Bon Retour
        </h1>
        <p className="text-muted-foreground mb-8">
          Entrez vos identifiants pour vous connecter à EmbroCraftDZ
        </p>

        {registered && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <span className="material-icons text-emerald-600 text-lg">check_circle</span>
            <span>Votre compte a été créé avec succès ! Connectez-vous maintenant.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
            <span className="material-icons text-base">error</span>
            {error}
          </div>
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

          <div className="flex items-center justify-between w-full pb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-foreground"
              >
                Se souvenir de moi
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-primary hover:underline transition-all"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full relative"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="material-icons animate-spin text-lg">
                  sync
                </span>
                <span>Connexion...</span>
              </div>
            ) : (
              "Se Connecter"
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center mb-2 font-semibold">Comptes de démonstration</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Client</p>
              <p>a@gmail.com</p>
            </div>
            <div>
              <p className="font-medium text-foreground">couturiere</p>
              <p>d@gmail.com</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Creator</p>
              <p>b@gmail.com</p>
            </div>
            <div>
              <p className="font-medium text-foreground">admin</p>
              <p>c@gmail.com</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse animate-in fade-in" />}>
      <LoginContent />
    </Suspense>
  );
}
