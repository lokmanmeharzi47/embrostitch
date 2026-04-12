import React from "react";
import { createClient } from "@/lib/supabase/server";
import ProfessionalProfileClient from "@/components/shared/ProfessionalProfileClient";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Profile Data
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, bio, city, avatar_url")
    .eq("id", id)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 text-center w-full">
            <span className="material-icons text-6xl text-muted-foreground">person_off</span>
            <h1 className="text-2xl font-bold mt-4">Profil non trouvé</h1>
            <p className="text-muted-foreground mt-2 mb-4">
            Ce professionnel n&apos;existe pas ou a été supprimé.
            </p>
            <Link href="/marketplace" className="text-primary hover:underline inline-block">
            Retour au marketplace
            </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Couturiere Specific Profile
  const { data: cpData } = await supabase
    .from("couturiere_profiles")
    .select(
      "specialty, description, location, category, price_range, avg_rating, total_reviews, portfolio_images, is_verified, is_available, years_experience"
    )
    .eq("id", id)
    .single();

  if (!cpData) {
    // If it's a client profile viewing their own public profile or similar
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 text-center w-full">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-primary text-5xl">person</span>
            </div>
            <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
            <p className="text-muted-foreground mt-2">{profile.city || "Client Member"}</p>
            <p className="max-w-md mx-auto mt-6 text-muted-foreground italic">
                {profile.bio || "No public bio available."}
            </p>
            <Link href="/" className="mt-8 text-primary hover:underline inline-block">
                Back to Home
            </Link>
        </div>
      </div>
    );
  }

  // 3. Fetch Reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at,
      client:profiles!reviews_client_id_fkey (first_name, last_name)
    `
    )
    .eq("couturiere_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />
      <div className="pt-20">
        <ProfessionalProfileClient
          id={id}
          profile={profile as any}
          couturiereProfile={cpData as any}
          reviews={(reviewsData || []) as any}
        />
      </div>
    </div>
  );
}
