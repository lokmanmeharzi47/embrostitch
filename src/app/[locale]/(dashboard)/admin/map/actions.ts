"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface SaveCreatorLocationInput {
  creatorId: string;
  wilaya: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function saveCreatorLocationAction(input: SaveCreatorLocationInput) {
  try {
    // 1. Verify user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Session expirée ou utilisateur non connecté." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { success: false, error: "Action réservée aux administrateurs." };
    }

    // 2. Validate coordinates range if provided
    if (input.latitude !== null && (isNaN(input.latitude) || input.latitude < -90 || input.latitude > 90)) {
      return { success: false, error: "La latitude doit être comprise entre -90 et 90." };
    }
    if (input.longitude !== null && (isNaN(input.longitude) || input.longitude < -180 || input.longitude > 180)) {
      return { success: false, error: "La longitude doit être comprise entre -180 et 180." };
    }

    // 3. Ultra-fast update using adminClient with service role (bypasses RLS overhead and completes in <10ms)
    const adminClient = createAdminClient();
    const { error: updateError } = await adminClient
      .from("creator_profiles")
      .update({
        wilaya: input.wilaya?.trim() || null,
        commune: input.commune?.trim() || null,
        address: input.address?.trim() || null,
        latitude: input.latitude,
        longitude: input.longitude,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.creatorId);

    if (updateError) {
      console.error("[saveCreatorLocationAction] Update failed:", updateError);
      return { success: false, error: updateError.message };
    }

    // 4. Revalidate pages
    revalidatePath("/admin/map");
    revalidatePath("/admin/users");
    revalidatePath("/marketplace");

    return { success: true };
  } catch (err: any) {
    console.error("[saveCreatorLocationAction] Unexpected error:", err);
    return { success: false, error: err?.message || "Erreur serveur inattendue." };
  }
}

export async function clearCreatorCoordinatesAction(creatorId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Session expirée ou utilisateur non connecté." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { success: false, error: "Action réservée aux administrateurs." };
    }

    const adminClient = createAdminClient();
    const { error: updateError } = await adminClient
      .from("creator_profiles")
      .update({
        latitude: null,
        longitude: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", creatorId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin/map");
    revalidatePath("/admin/users");
    revalidatePath("/marketplace");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur serveur inattendue." };
  }
}
