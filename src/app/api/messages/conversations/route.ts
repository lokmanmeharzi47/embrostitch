import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Fetch only the necessary fields to determine conversations
  // We fetch last 100 messages to find recent conversations
  // In a real production app, we might have a 'conversations' table or use a more complex SQL query
  const { data: messages, error } = await supabase
    .from("messages")
    .select("sender_id, receiver_id, content, created_at, is_read")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const partnerIds = new Set<string>();
  const conversationsMap = new Map();

  messages.forEach((msg) => {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, {
        partner_id: partnerId,
        last_message: msg.content,
        last_message_time: msg.created_at,
        unread_count: 0,
      });
      partnerIds.add(partnerId);
    }
    if (!msg.is_read && msg.receiver_id === user.id) {
      conversationsMap.get(partnerId).unread_count++;
    }
  });

  if (partnerIds.size === 0) {
    return NextResponse.json({ conversations: [] });
  }

  // Fetch profiles for all unique partners
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .in("id", Array.from(partnerIds));

  const conversations = profiles?.map((profile) => {
    const conv = conversationsMap.get(profile.id);
    return {
      ...conv,
      name: `${profile.first_name} ${profile.last_name}`,
      avatar_url: profile.avatar_url,
    };
  }).sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

  return NextResponse.json({ conversations: conversations || [] });
}
