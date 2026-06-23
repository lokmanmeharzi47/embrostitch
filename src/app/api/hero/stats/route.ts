import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Parallel requests for stats and top ranked professional
  const [
    { count: totalCreators },
    { count: totalOrdersCompleted },
    { data: creatorProfiles },
    { data: topProfile }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["creator", "creator"]),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("creator_profiles").select("location, avg_rating"),
    supabase.from("creator_profiles")
      .select("*, profiles!inner(first_name, last_name, avatar_url)")
      .order("avg_rating", { ascending: false })
      .limit(1)
      .single()
  ]);

  // Unique cities / wilayas
  const locations = new Set();
  let totalRating = 0;
  let countWithRatings = 0;

  if (creatorProfiles) {
    for (const p of creatorProfiles) {
      if (p.location) locations.add(p.location.toLowerCase());
      if (p.avg_rating && p.avg_rating > 0) {
        totalRating += Number(p.avg_rating);
        countWithRatings++;
      }
    }
  }

  const overallAvgRating = countWithRatings > 0 ? (totalRating / countWithRatings) : 5.0;

  return NextResponse.json({
    stats: {
      total_creators: totalCreators || 0,
      total_orders_completed: totalOrdersCompleted || 0,
      overall_avg_rating: overallAvgRating,
      cities_covered: locations.size > 0 ? locations.size : 1
    },
    topProfile: topProfile ? {
      first_name: (topProfile.profiles as any)?.first_name || "Artisan",
      last_name: (topProfile.profiles as any)?.last_name || "Expert",
      avatar_url: (topProfile.profiles as any)?.avatar_url,
      specialty: topProfile.specialty || ["Sur Mesure"],
      location: topProfile.location || "Algérie",
      avg_rating: topProfile.avg_rating || 5,
      total_reviews: topProfile.total_reviews || 0,
      id: topProfile.id
    } : null
  });
}
