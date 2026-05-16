import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
    }

    if (userId === creatorId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Check if creator exists
    const { data: creator, error: creatorError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(client_id.eq.${userId},creator_id.eq.${creatorId}),and(client_id.eq.${creatorId},creator_id.eq.${userId})`)
      .maybeSingle();

    if (existingConversation) {
      return NextResponse.json({
        conversationId: existingConversation.id,
        redirectUrl: `/client/messages?orderId=${existingConversation.id}`,
      });
    }

    // Create new conversation
    const { data: newConversation, error: insertError } = await supabase
      .from("conversations")
      .insert({
        client_id: userId,
        creator_id: creatorId,
      })
      .select("id")
      .single();

    if (insertError || !newConversation) {
      console.error("Error creating conversation:", insertError);
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
    }

    return NextResponse.json({
      conversationId: newConversation.id,
      redirectUrl: `/client/messages?orderId=${newConversation.id}`,
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
