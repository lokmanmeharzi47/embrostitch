import React from "react";
import { createClient } from "@/lib/supabase/server";
import ReviewsClient from "./ReviewsClient";

export default async function CreatorReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at,
      client:profiles!reviews_reviewer_id_fkey (first_name, last_name),
      order:orders!reviews_order_id_fkey (id)
    `
    )
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  const reviews = data || [];

  return <ReviewsClient initialReviews={reviews as any} />;
}
