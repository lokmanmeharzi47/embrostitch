import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("couturiere_profiles")
      .select(`
        id, specialty, avg_rating, total_reviews, price_range, category,
        profile:profiles!couturiere_profiles_id_fkey (first_name, last_name, city, avatar_url)
      `)
      .eq("is_available", true)
      .order("avg_rating", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ professional: null });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ professional: data });
  } catch (error) {
    console.error("Top professional API error:", error);
    return NextResponse.json({ error: "Unable to load top professional" }, { status: 500 });
  }
}
