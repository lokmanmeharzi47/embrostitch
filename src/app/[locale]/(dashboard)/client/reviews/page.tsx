import React from "react";
import { createClient } from "@/lib/supabase/server";
import ReviewsClient from "./ReviewsClient";

export default async function ClientReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch existing reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at, order_id,
      couturiere:profiles!reviews_couturiere_id_fkey (first_name, last_name),
      order:orders!reviews_order_id_fkey (title)
    `
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch completed orders without reviews
  const { data: completedOrders } = await supabase
    .from("orders")
    .select(
      `
      id, title, couturiere_id,
      couturiere:profiles!orders_couturiere_id_fkey (first_name, last_name)
    `
    )
    .eq("client_id", user.id)
    .eq("status", "completed");

  const reviewedOrderIds = new Set(
    (reviewsData || []).map((r: any) => r.order_id)
  );

  const unreviewedOrders = (completedOrders || []).filter(
    (o) => !reviewedOrderIds.has(o.id)
  );

  return (
    <ReviewsClient
      initialReviews={(reviewsData || []) as any}
      initialUnreviewed={unreviewedOrders as any}
      userId={user.id}
    />
  );
}
