import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      comment, rating, created_at,
      client:profiles!reviews_reviewer_id_fkey (first_name, last_name),
      creator:profiles!reviews_creator_id_fkey (first_name, last_name),
      order:orders!reviews_order_id_fkey (id, title)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate stats
  const count = reviews?.length || 0;
  const average = count > 0 
    ? reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / count
    : 0;

  // We only send back top 6 to limit payload
  const topReviews = reviews?.slice(0, 6).map(r => {
    const client = Array.isArray(r.client) ? r.client[0] : r.client;
    const order = Array.isArray(r.order) ? r.order[0] : r.order;
    
    const firstName = client?.first_name || "";
    const lastName = client?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      comment: r.comment,
      rating: r.rating,
      client_name: fullName || "Anonyme",
      order_title: order?.title || "Commande personnalisée"
    };
  });

  return NextResponse.json({
    reviews: topReviews,
    stats: {
      count,
      average: Number(average.toFixed(1))
    }
  });
}
