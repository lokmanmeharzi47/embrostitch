import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ProfileSummary {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface OrderConversation {
  id: string;
  title: string;
  status: string;
  client_id: string;
  couturiere_id: string;
  created_at: string;
  client: ProfileSummary | ProfileSummary[] | null;
  couturiere: ProfileSummary | ProfileSummary[] | null;
}

interface MessageSummary {
  id: string;
  order_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

function getJoinedProfile(profile: ProfileSummary | ProfileSummary[] | null) {
  return Array.isArray(profile) ? profile[0] || null : profile;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 1. Find all partners from messages
  const { data: allMessages } = await supabase
    .from("messages")
    .select("sender_id, receiver_id, created_at, content, is_read")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // 2. Find all partners from direct conversations
  const { data: directConvs } = await supabase
    .from("conversations")
    .select("id, client_id, creator_id, created_at")
    .or(`client_id.eq.${user.id},creator_id.eq.${user.id}`);

  // 3. Find all partners from orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, client_id, couturiere_id, created_at")
    .or(`client_id.eq.${user.id},couturiere_id.eq.${user.id}`);

  const partnersMap = new Map<string, { last_message: string; last_message_time: string; unread_count: number; order_title?: string; order_status?: string; associated_orders: string[] }>();
  
  // Initialize map with unique partners from all sources
  const addPartner = (partnerId: string, time: string, msg: string = "Démarrer la discussion", order?: any) => {
    if (!partnersMap.has(partnerId)) {
      partnersMap.set(partnerId, {
        last_message: msg,
        last_message_time: time,
        unread_count: 0,
        associated_orders: [],
      });
    }
    const current = partnersMap.get(partnerId)!;
    if (new Date(time) > new Date(current.last_message_time)) {
      partnersMap.set(partnerId, { ...current, last_message: msg, last_message_time: time });
    }
    if (order) {
      if (!current.associated_orders.includes(order.id)) {
        current.associated_orders.push(order.id);
      }
      if (!current.order_title || (order.status !== "completed" && order.status !== "rejected")) {
         partnersMap.set(partnerId, { ...partnersMap.get(partnerId)!, order_title: order.title, order_status: order.status });
      }
    }
  };

  (directConvs || []).forEach(c => {
    const partnerId = c.client_id === user.id ? c.creator_id : c.client_id;
    addPartner(partnerId, c.created_at, "Message direct");
  });

  (orders || []).forEach(o => {
    const partnerId = o.client_id === user.id ? o.couturiere_id : o.client_id;
    addPartner(partnerId, o.created_at, "Discussion", o);
  });

  (allMessages || []).forEach((msg) => {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    addPartner(partnerId, msg.created_at, msg.content);
    if (!msg.is_read && msg.receiver_id === user.id) {
      const current = partnersMap.get(partnerId)!;
      partnersMap.set(partnerId, { ...current, unread_count: current.unread_count + 1 });
    }
  });

  const partnerIds = Array.from(partnersMap.keys());
  if (partnerIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .in("id", partnerIds);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const unifiedConversations = profiles.map((profile) => {
    const stats = partnersMap.get(profile.id)!;

    return {
      id: profile.id,
      type: "messenger",
      order_title: stats.order_title || "Discussion",
      order_status: stats.order_status || "active",
      partner_id: profile.id,
      associated_order_ids: stats.associated_orders,
      name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Utilisateur",
      avatar_url: profile.avatar_url || null,
      last_message: stats.last_message,
      last_message_time: stats.last_message_time,
      unread_count: stats.unread_count,
    };
  });

  unifiedConversations.sort(
    (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  );

  return NextResponse.json({ conversations: unifiedConversations });
}
