import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ROLES = ["client", "couturiere", "creator"] as const;
type Role = typeof VALID_ROLES[number];

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name, role } = await req.json();

    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role as Role)) {
      return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Create user with email_confirm: true → no confirmation email sent, account immediately active
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, role },
    });

    if (error) {
      // Translate Supabase errors to French
      const msg = translateAuthError(error.message);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Ensure profile row exists (trigger may not have run yet)
    await supabase.from("profiles").upsert(
      { id: data.user.id, first_name, last_name, role },
      { onConflict: "id" }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin register error:", err);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("email rate limit") || m.includes("over_email_send_rate_limit"))
    return "Limite d'emails atteinte. Attendez quelques minutes avant de réessayer.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Cette adresse email est déjà utilisée.";
  if (m.includes("invalid email"))
    return "Adresse email invalide.";
  if (m.includes("password") && m.includes("short"))
    return "Le mot de passe est trop court (minimum 6 caractères).";
  if (m.includes("weak password"))
    return "Mot de passe trop faible. Utilisez des lettres, chiffres et symboles.";
  if (m.includes("network") || m.includes("fetch"))
    return "Erreur réseau. Vérifiez votre connexion internet.";
  return message;
}
