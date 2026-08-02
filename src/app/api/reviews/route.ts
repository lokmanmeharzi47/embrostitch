import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/reviews - Create a review
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { creator_id, order_id, rating, comment } = body;

  if (!creator_id || !order_id || !rating) {
    return NextResponse.json(
      { error: "creator_id, order_id et rating sont requis" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "La note doit être entre 1 et 5" },
      { status: 400 }
    );
  }

  // Verify the order belongs to this user and is completed
  const { data: order } = await supabase
    .from("orders")
    .select("client_id, status")
    .eq("id", order_id)
    .single();

  if (!order || order.client_id !== user.id) {
    return NextResponse.json(
      { error: "Commande non trouvée ou non autorisée" },
      { status: 403 }
    );
  }

  if (order.status !== "completed") {
    return NextResponse.json(
      { error: "Vous ne pouvez noter qu'une commande terminée" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      reviewer_id: user.id,
      creator_id,
      order_id,
      rating,
      comment: comment || "",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Vous avez déjà noté cette commande" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}

// GET /api/reviews - List reviews (optionally filtered by creator_id)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creator_id");

  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select(
      `
      id, rating, comment, created_at,
      reviewer:profiles!reviews_reviewer_id_fkey (first_name, last_name),
      order:orders!reviews_order_id_fkey (title)
    `
    )
    .order("created_at", { ascending: false });

  if (creatorId) {
    query = query.eq("creator_id", creatorId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}
