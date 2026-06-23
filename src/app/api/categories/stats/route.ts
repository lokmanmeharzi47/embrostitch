import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creator_profiles")
    .select("category, specialty"); // specialty is an array, we could use category

  if (error || !data) {
    return NextResponse.json({ counts: {} }, { status: 500 });
  }

  const categoryMap: Record<string, number> = {};

  data.forEach((p) => {
    // Some are under `category`, some are under `specialty`. Let's just track all words in both.
    const tags = [p.category, ...(p.specialty || [])].filter(Boolean) as string[];
    tags.forEach(tag => {
      const lowered = tag.toLowerCase();
      categoryMap[lowered] = (categoryMap[lowered] || 0) + 1;
    });
  });

  return NextResponse.json({ counts: categoryMap });
}
