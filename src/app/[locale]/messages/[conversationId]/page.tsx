import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import ConversationClient from "./ConversationClient";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale, conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  // Verify conversation access
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*, client:profiles!client_id(id, first_name, last_name, avatar_url), creator:profiles!creator_id(id, first_name, last_name, avatar_url)")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation || convError) {
    return redirect({ href: "/", locale });
  }

  const isParticipant = conversation.client_id === user.id || conversation.creator_id === user.id;
  if (!isParticipant) {
    return redirect({ href: "/", locale });
  }

  // Fetch initial messages
  const { data: initialMessages, error: msgsError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const otherParticipant = conversation.client_id === user.id ? conversation.creator : conversation.client;

  // Fetch all direct conversations for the user to display in the sidebar
  const { data: allConversations } = await supabase
    .from("conversations")
    .select("*, client:profiles!client_id(id, first_name, last_name, avatar_url), creator:profiles!creator_id(id, first_name, last_name, avatar_url)")
    .or(`client_id.eq.${user.id},creator_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div className="h-[calc(100vh-80px)] w-full max-w-6xl mx-auto flex py-4 px-2 sm:px-4">
      <ConversationClient
        conversationId={conversationId}
        initialMessages={initialMessages || []}
        currentUser={user}
        otherParticipant={otherParticipant}
        allConversations={allConversations || []}
      />
    </div>
  );
}
