import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/orders/[id]/status - Update order status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ["pending", "accepted", "in_progress", "completed", "rejected"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Status invalide. Valeurs acceptées: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify user is a participant in this order
  const { data: order } = await supabase
    .from("orders")
    .select("client_id, couturiere_id")
    .eq("id", id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
  }

  if (order.client_id !== user.id && order.couturiere_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
