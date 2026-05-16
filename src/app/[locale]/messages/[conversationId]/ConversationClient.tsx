"use client";

import React, { useEffect, useState, useRef } from "react";
import { type RealtimeMessage } from "@/components/shared/MessagingInterface";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

interface ConversationClientProps {
  conversationId: string;
  initialMessages: RealtimeMessage[];
  currentUser: any;
  otherParticipant: any;
  allConversations: any[];
}

export default function ConversationClient({
  conversationId,
  initialMessages,
  currentUser,
  otherParticipant,
  allConversations,
}: ConversationClientProps) {
  const [messages, setMessages] = useState<RealtimeMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      const channel = supabase.channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const message = payload.new as RealtimeMessage;
            if (mounted) {
              setMessages((prev) => {
                if (prev.find(m => m.id === message.id)) return prev;
                const filtered = prev.filter(m => !(m.id.toString().startsWith("temp-") && m.content === message.content));
                return [...filtered, message];
              });
              
              if (message.receiver_id === currentUser.id) {
                supabase.from("messages").update({ is_read: true }).eq("id", message.id).then();
              }
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const message = payload.new as RealtimeMessage;
            if (mounted) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === message.id ? { ...msg, is_read: message.is_read } : msg
                )
              );
            }
          }
        )
        .subscribe();

      channelRef.current = channel;

      supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", currentUser.id)
        .eq("is_read", false)
        .then();
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, currentUser.id, supabase.auth]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelRef.current) return;

    const content = newMessage.trim();
    const optimisticId = `temp-${Date.now()}`;
    
    // Optimistic update
    const optimisticMessage = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      receiver_id: otherParticipant.id,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    } as any;

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      receiver_id: otherParticipant.id,
      content,
      is_read: false,
    }).select().single().then(({ data, error }) => {
      if (error) {
        toast.error("Message could not be sent");
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setNewMessage(content);
      } else if (data) {
        setMessages((prev) => 
          prev.map((m) => m.id === optimisticId ? data as RealtimeMessage : m)
        );
      }
    });
  };

  const filteredConversations = allConversations.filter((conv) => {
    const partner = conv.client_id === currentUser.id ? conv.creator : conv.client;
    const name = `${partner?.first_name || ""} ${partner?.last_name || ""}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row w-full h-full">
      {/* Sidebar */}
      <div className="w-full lg:w-80 border-r border-border flex flex-col bg-secondary/10 shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/20 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/30 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredConversations.map((conv) => {
            const partner = conv.client_id === currentUser.id ? conv.creator : conv.client;
            const isSelected = conv.id === conversationId;
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`w-full text-left p-4 cursor-pointer transition-all flex gap-3 border-l-4 ${
                  isSelected ? "bg-primary/5 border-l-primary" : "hover:bg-secondary/30 border-l-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border shadow-sm">
                    {partner?.avatar_url ? (
                      <Image src={partner.avatar_url} alt="Avatar" width={44} height={44} className="object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-base">{partner?.first_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-sm truncate font-semibold text-foreground/90">
                    {partner?.first_name} {partner?.last_name}
                  </h3>
                  <p className="text-[11px] font-bold text-primary truncate mt-0.5">Message direct</p>
                </div>
              </Link>
            );
          })}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucune conversation trouvée.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-white/95 backdrop-blur-md z-10 sticky top-0 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border shrink-0">
            {otherParticipant?.avatar_url ? (
              <Image src={otherParticipant.avatar_url} alt="Avatar" width={40} height={40} className="object-cover" />
            ) : (
              <span className="text-primary font-bold">{otherParticipant?.first_name?.charAt(0) || "U"}</span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">
              {otherParticipant?.first_name} {otherParticipant?.last_name}
            </h2>
            <p className="text-[11px] text-muted-foreground">En ligne</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] ${isMine ? "text-right" : "text-left"}`}>
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm ${
                      isMine
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white text-foreground rounded-bl-none border border-border/60"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">
                      {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMine && (
                      <span className="material-icons text-[12px] text-primary align-middle ml-1">
                        {msg.is_read ? "done_all" : "check"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-white sticky bottom-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-secondary/20 p-2 rounded-2xl border border-border/50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-md transition-all">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              placeholder="Écrivez votre message..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm py-2 px-3 leading-relaxed outline-none min-h-[40px]"
              rows={1}
            />
            <Button type="submit" variant="luxury" size="icon" className="shrink-0 h-10 w-10 rounded-xl shadow-lg" disabled={!newMessage.trim()}>
              <span className="material-icons text-base">send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
