"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  partner_id: string;
  name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface MessagingInterfaceProps {
  initialRecipientId?: string | null;
}

export default function MessagingInterface({
  initialRecipientId,
}: MessagingInterfaceProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const supabase = createClient();

  // 1. Fetch Conversations via API
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        let convs = data.conversations || [];

        // If we have an initialRecipientId that's not in conversations, fetch their profile
        if (
          initialRecipientId &&
          !convs.find((c: Conversation) => c.partner_id === initialRecipientId)
        ) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", initialRecipientId)
            .single();

          if (profile) {
            const newConv = {
              partner_id: profile.id,
              name: `${profile.first_name} ${profile.last_name}`,
              avatar_url: profile.avatar_url,
              last_message: "Nouvelle conversation",
              last_message_time: new Date().toISOString(),
              unread_count: 0,
            };
            convs = [newConv, ...convs];
          }
        }

        setConversations(convs);

        if (initialRecipientId) {
          const target = convs.find(
            (c: Conversation) => c.partner_id === initialRecipientId
          );
          if (target) setSelectedConv(target);
        } else if (convs.length > 0 && !selectedConv) {
          setSelectedConv(convs[0]);
        }
      } catch (err: any) {
        console.error("Error fetching conversations:", err);
        toast.error("Impossible de charger les conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, initialRecipientId]);

  // 2. Fetch Messages for Selected Conversation
  useEffect(() => {
    if (!user || !selectedConv) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/messages?partner_id=${selectedConv.partner_id}`
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setMessages(data.messages || []);

        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c.partner_id === selectedConv.partner_id
              ? { ...c, unread_count: 0 }
              : c
          )
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [user, selectedConv?.partner_id]);

  // 3. Real-time Subscription
  useEffect(() => {
    if (!user) return;

    // Listen for ALL messages where user is sender OR receiver
    const channel = supabase
      .channel("messages_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const msg = payload.new as Message;

          // Only care if user is involved
          if (msg.sender_id !== user.id && msg.receiver_id !== user.id) return;

          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

          // If current conversation
          if (selectedConv && partnerId === selectedConv.partner_id) {
            setMessages((prev) => {
               // Avoid duplicates if we sent it ourselves and already added it
               if (prev.find(m => m.id === msg.id)) return prev;
               return [...prev, msg];
            });
            
            // Mark as read if it's incoming
            if (msg.receiver_id === user.id) {
              await supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
            }
          }

          // Update conversations list
          setConversations((prev) => {
            const index = prev.findIndex((c) => c.partner_id === partnerId);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                last_message: msg.content,
                last_message_time: msg.created_at,
                unread_count:
                  msg.receiver_id === user.id && (!selectedConv || partnerId !== selectedConv.partner_id)
                    ? updated[index].unread_count + 1
                    : updated[index].unread_count,
              };
              return updated.sort(
                (a, b) =>
                  new Date(b.last_message_time).getTime() -
                  new Date(a.last_message_time).getTime()
              );
            } else {
              // New partner, fetch profile
              fetchNewPartner(partnerId, msg);
              return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConv?.partner_id]);

  const fetchNewPartner = async (pid: string, msg: Message) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .eq("id", pid)
      .single();
    if (profile) {
      setConversations((prev) => [
        {
          partner_id: pid,
          name: `${profile.first_name} ${profile.last_name}`,
          avatar_url: profile.avatar_url,
          last_message: msg.content,
          last_message_time: msg.created_at,
          unread_count: msg.receiver_id === user?.id ? 1 : 0,
        },
        ...prev,
      ]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConv) return;

    const content = newMessage.trim();
    setNewMessage(""); // Clear early for better UX

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedConv.partner_id,
          content: content,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Add to local messages if not already there via realtime
      setMessages((prev) => {
        if (prev.find(m => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });

      // Update conversation list item
      setConversations((prev) =>
        prev
          .map((c) =>
            c.partner_id === selectedConv.partner_id
              ? {
                  ...c,
                  last_message: content,
                  last_message_time: data.message.created_at,
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.last_message_time).getTime() -
              new Date(a.last_message_time).getTime()
          )
      );
    } catch (err) {
      toast.error("Échec de l'envoi du message");
      setNewMessage(content); // Restore if failed
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-xl border border-border">
        <div className="flex flex-col items-center gap-2">
            <span className="material-icons animate-spin text-primary">hourglass_empty</span>
            <p className="text-sm text-muted-foreground font-medium">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row h-full max-h-[750px] sm:max-h-none sm:h-[calc(100vh-12rem)]">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-80 border-r border-border flex flex-col bg-secondary/10">
        <div className="p-4 border-b border-border bg-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary/20 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredConversations.map((conv) => (
            <div
              key={conv.partner_id}
              onClick={() => setSelectedConv(conv)}
              className={`p-4 cursor-pointer transition-all flex gap-3 border-l-4 ${
                selectedConv?.partner_id === conv.partner_id
                  ? "bg-primary/5 border-l-primary"
                  : "hover:bg-secondary/30 border-l-transparent"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-11 h-11 border border-border shadow-sm">
                  <AvatarImage src={conv.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                    {conv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {conv.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3
                    className={`text-sm truncate pr-2 ${
                      conv.unread_count > 0
                        ? "font-bold text-foreground"
                        : "font-semibold text-foreground/80"
                    }`}
                  >
                    {conv.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                    {new Date(conv.last_message_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p
                  className={`text-xs truncate ${
                    conv.unread_count > 0
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {conv.last_message}
                </p>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucune conversation trouvée.
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/95 backdrop-blur-md z-10 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={selectedConv.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {selectedConv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-foreground text-sm">
                    {selectedConv.name}
                  </h2>
                  <p className="text-[10px] text-success flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>{" "}
                    En ligne
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-secondary/50 rounded-full"
                >
                  <MoreVertical size={20} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium">
                  Chargement des messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                   <span className="material-icons text-4xl">waving_hand</span>
                   <p className="text-sm font-medium">Dites bonjour !</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showDate = idx === 0 || 
                    new Date(msg.created_at).toDateString() !== new Date(messages[idx-1].created_at).toDateString();

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-secondary/50 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {new Date(msg.created_at).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex flex-col ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${
                            isOwn ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div
                              className={`p-3.5 rounded-2xl shadow-sm ${
                                isOwn
                                  ? "bg-primary text-white rounded-br-none"
                                  : "bg-white text-foreground rounded-bl-none border border-border/60"
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isOwn ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span className="text-[10px] text-muted-foreground font-medium uppercase">
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                              {isOwn && (
                                <CheckCheck
                                  size={14}
                                  className={
                                    msg.is_read
                                      ? "text-primary"
                                      : "text-muted-foreground/50"
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white sticky bottom-0">
              <div className="flex items-end gap-2 bg-secondary/20 p-2 rounded-2xl border border-border/50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-md transition-all">
                <button className="p-2.5 text-muted-foreground hover:text-primary transition-colors shrink-0 rounded-xl hover:bg-primary/5">
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Écrire à ${selectedConv.name}...`}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm py-2 px-2 leading-relaxed outline-none min-h-[40px]"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'inherit';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                ></textarea>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  variant="luxury"
                  size="icon"
                  className="shrink-0 h-10 w-10 rounded-xl shadow-lg"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare size={40} className="text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Vos Messages</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-3 leading-relaxed">
              Sélectionnez une conversation pour commencer à discuter avec des professionnels ou des clients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
