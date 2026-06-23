import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/creators - List creators with filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const category = searchParams.get("category");
  const minRating = searchParams.get("min_rating");
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      `
      id, first_name, last_name, city, avatar_url,
      creator_profiles!inner (
        specialty, description, location, category,
        price_range, avg_rating, total_reviews, is_verified, is_available, years_experience
      )
    `,
      { count: "exact" }
    )
    .eq("role", "creator");

  if (location) {
    query = query.ilike("creator_profiles.location", `%${location}%`);
  }
  if (category) {
    query = query.eq("creator_profiles.category", category);
  }
  if (minRating) {
    query = query.gte("creator_profiles.avg_rating", parseFloat(minRating));
  }

  query = query
    .order("creator_profiles(avg_rating)", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    creators: data,
    total: count,
    page,
    limit,
  });
}
