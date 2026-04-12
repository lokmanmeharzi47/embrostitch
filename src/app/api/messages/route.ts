import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages?partner_id=...
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("partner_id");

  if (!partnerId) {
    return NextResponse.json({ error: "partner_id est requis" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark messages from partner as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  return NextResponse.json({ messages: data });
}

// POST /api/messages
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { receiver_id, content, order_id } = body;

  if (!receiver_id || !content) {
    return NextResponse.json(
      { error: "receiver_id et content sont requis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id,
      content,
      order_id: order_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification for receiver
  await supabase.from("notifications").insert({
    user_id: receiver_id,
    type: "message",
    title: "Nouveau message",
    body: content.length > 50 ? content.substring(0, 47) + "..." : content,
    link: "/messages", // Adjust based on role if needed
  });

  return NextResponse.json({ message: data }, { status: 201 });
}
