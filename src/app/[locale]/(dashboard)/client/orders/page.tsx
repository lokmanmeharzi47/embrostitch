import React from "react";
import { createClient } from "@/lib/supabase/server";
import OrdersClient from "./OrdersClient";

export default async function ClientOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Or redirect to login
  }

  const { data } = await supabase
    .from("orders")
    .select(
      `
      id, title, price, status, delivery_date, created_at,
      couturiere:profiles!orders_couturiere_id_fkey (first_name, last_name)
    `
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const orders = data || [];

  return <OrdersClient initialOrders={orders as any} />;
}
