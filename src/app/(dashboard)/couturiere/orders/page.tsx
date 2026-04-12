import React from "react";
import { createClient } from "@/lib/supabase/server";
import OrdersClient from "./OrdersClient";

export default async function CreatorOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      `
      id, title, description, price, status, delivery_date, created_at,
      client:profiles!orders_client_id_fkey (first_name, last_name)
    `
    )
    .eq("couturiere_id", user.id)
    .order("created_at", { ascending: false });

  const orders = data || [];

  return <OrdersClient initialOrders={orders as any} />;
}
