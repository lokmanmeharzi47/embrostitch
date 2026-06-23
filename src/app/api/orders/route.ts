import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/orders - List orders for the authenticated user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("orders")
    .select(`
      id, title, description, price, status, delivery_date, created_at, updated_at, images,
      client:profiles!orders_client_id_fkey (id, first_name, last_name, avatar_url),
      creator:profiles!orders_creator_id_fkey (id, first_name, last_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (profile?.role === "client") {
    query = query.eq("client_id", user.id);
  } else if (profile?.role === "creator") {
    query = query.eq("creator_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { creator_id, title, description, price, delivery_date, images } = body;

  if (!creator_id || !title) {
    return NextResponse.json(
      { error: "creator_id et title sont requis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: user.id,
      creator_id,
      title,
      description: description || "",
      price: price || 0,
      delivery_date: delivery_date || null,
      status: "pending",
      images: images || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data }, { status: 201 });
}
