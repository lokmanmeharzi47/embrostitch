import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get("id"); // This is now the partner's user ID

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId est requis" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, order_id, conversation_id, sender_id, receiver_id, content, attachment_url, is_read, created_at")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark messages from partner as read
  const { error: readError } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (readError) {
    console.error("Failed to mark messages as read:", readError);
  }

  return NextResponse.json({ messages: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const partnerId = body.id; // This is the partner's user ID
  const content = body.content?.trim() || "";
  const attachmentUrl = body.attachment_url || null;

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId est requis" }, { status: 400 });
  }

  if (!content && !attachmentUrl) {
    return NextResponse.json({ error: "content ou attachment_url est requis" }, { status: 400 });
  }

  // Find the most recent order to associate if none provided? 
  // For messenger style, we might not need to strictly associate every message with an order.
  // But let's check if there's an active order between them to keep context.
  const { data: latestOrder } = await supabase
    .from("orders")
    .select("id")
    .or(`and(client_id.eq.${user.id},couturiere_id.eq.${partnerId}),and(client_id.eq.${partnerId},couturiere_id.eq.${user.id})`)
    .in("status", ["pending", "accepted", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content,
      attachment_url: attachmentUrl,
      order_id: latestOrder?.id || null,
    })
    .select("id, order_id, conversation_id, sender_id, receiver_id, content, attachment_url, is_read, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const senderName = `${senderProfile?.first_name || ""} ${senderProfile?.last_name || ""}`.trim() || "EmbroCraftDZ";
  const notificationMessage = content.length > 120 ? `${content.substring(0, 117)}...` : content || "Pièce jointe";

  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: partnerId,
    type: "message",
    title: `Nouveau message de ${senderName}`,
    message: notificationMessage,
    body: notificationMessage,
    related_order_id: latestOrder?.id || null,
    link: "/messages",
  });

  if (notificationError) {
    console.error("Failed to create message notification:", notificationError);
  }

  return NextResponse.json({ message: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const partnerId = body.id;

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId est requis" }, { status: 400 });
  }

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", partnerId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
