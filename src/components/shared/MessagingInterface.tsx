"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
export interface RealtimeMessage {
  id: string;
  order_id?: string | null;
  conversation_id?: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  AlertCircle,
  CheckCheck,
  Image as ImageIcon,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Search,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Message extends RealtimeMessage {
  optimistic?: boolean;
  failed?: boolean;
}

interface Conversation {
  id: string; // This is the partner_id
  type: "messenger";
  order_title: string;
  order_status: string;
  partner_id: string;
  associated_order_ids: string[];
  name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface MessagingInterfaceProps {
  initialOrderId?: string | null;
  initialRecipientId?: string | null;
}

interface ConversationsResponse {
  conversations?: Conversation[];
  error?: string;
}

interface MessagesResponse {
  messages?: Message[];
  error?: string;
}

function mergeMessage(current: Message[], incoming: Message) {
  if (current.some((message) => message.id === incoming.id)) return current;

  const withoutOptimisticMatch = current.filter(
    (message) =>
      !(
        message.optimistic &&
        (message.order_id === incoming.order_id || message.conversation_id === incoming.conversation_id) &&
        message.sender_id === incoming.sender_id &&
        message.content === incoming.content &&
        message.attachment_url === incoming.attachment_url
      )
  );

  return [...withoutOptimisticMatch, incoming].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function isImageAttachment(url: string) {
  return /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);
}

export default function MessagingInterface({
  initialOrderId,
  initialRecipientId,
}: MessagingInterfaceProps) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/messages/conversations");
        const data = (await response.json()) as ConversationsResponse;
        if (!response.ok) throw new Error(data.error || "Unable to load conversations");

        const nextConversations = data.conversations || [];
        setConversations(nextConversations);

        const selected =
          nextConversations.find((conversation) => 
            conversation.id === initialOrderId || 
            conversation.associated_order_ids.includes(initialOrderId || "")
          ) ||
          nextConversations.find((conversation) => conversation.partner_id === initialRecipientId) ||
          nextConversations[0] ||
          null;

        setSelectedConv((current) => {
          if (!current) return selected;
          return nextConversations.find((conversation) => conversation.id === current.id) || selected;
        });
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setErrorMessage("Unable to load conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, initialOrderId, initialRecipientId]);

  useEffect(() => {
    if (!user || !selectedConv) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/messages?id=${selectedConv.id}&type=${selectedConv.type}`);
        const data = (await response.json()) as MessagesResponse;
        if (!response.ok) throw new Error(data.error || "Unable to load messages");

        setMessages(data.messages || []);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedConv.id
              ? { ...conversation, unread_count: 0 }
              : conversation
          )
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
        setErrorMessage("Unable to load this conversation.");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [user, selectedConv?.id]);

  useEffect(() => {
    if (!user || !selectedConv) return;

    let active = true;
    let cleanup: (() => void) | undefined;

    const setupRealtime = () => {
      try {
        setConnectionStatus("connecting");

        const channelName = `messenger-${selectedConv.id}`;
        const channel = supabase.channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
            },
            (payload) => {
              const incoming = payload.new as RealtimeMessage;
              const isRelevant = 
                (incoming.sender_id === user.id && incoming.receiver_id === selectedConv.id) ||
                (incoming.sender_id === selectedConv.id && incoming.receiver_id === user.id);

              if (!isRelevant) return;

              setMessages((current) => mergeMessage(current, incoming));
              setConversations((current) =>
                current
                  .map((conversation) => {
                    const partnerId = incoming.sender_id === user.id ? incoming.receiver_id : incoming.sender_id;
                    return conversation.id === partnerId
                      ? {
                          ...conversation,
                          last_message: incoming.content || "Attachment",
                          last_message_time: incoming.created_at,
                          unread_count: (incoming.receiver_id === user.id && conversation.id !== selectedConv.id) ? conversation.unread_count + 1 : 0,
                        }
                      : conversation;
                  })
                  .sort(
                    (a, b) =>
                      new Date(b.last_message_time).getTime() -
                      new Date(a.last_message_time).getTime()
                  )
              );

              if (incoming.receiver_id === user.id && selectedConv.id === incoming.sender_id) {
                fetch("/api/messages", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: selectedConv.id }),
                }).catch(console.error);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "messages",
            },
            (payload) => {
              const updated = payload.new as RealtimeMessage;
              const isRelevant = 
                (updated.sender_id === user.id && updated.receiver_id === selectedConv.id) ||
                (updated.sender_id === selectedConv.id && updated.receiver_id === user.id);
              
              if (!isRelevant) return;

              setMessages((current) =>
                current.map((msg) =>
                  msg.id === updated.id ? { ...msg, is_read: updated.is_read } : msg
                )
              );
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected");
            } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
              setConnectionStatus("disconnected");
            }
          });

        cleanup = () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Realtime setup failed:", error);
        setConnectionStatus("disconnected");
        setErrorMessage("Unable to connect to Realtime.");
      }
    };

    setupRealtime();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [selectedConv?.id, supabase, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachmentUrl.trim()) || !user || !selectedConv || sending) return;

    const content = newMessage.trim();
    const outgoingAttachment = attachmentUrl.trim() || null;
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      order_id: null,
      conversation_id: null,
      sender_id: user.id,
      receiver_id: selectedConv.id,
      content,
      attachment_url: outgoingAttachment,
      created_at: new Date().toISOString(),
      is_read: false,
      optimistic: true,
    };

    setMessages((current) => mergeMessage(current, optimisticMessage));
    setNewMessage("");
    setAttachmentUrl("");
    setShowAttachmentInput(false);
    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedConv.id,
          type: selectedConv.type,
          content,
          attachment_url: outgoingAttachment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const { message } = await response.json();

      setMessages((current) => mergeMessage(current, message));

      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.id === selectedConv.id
              ? {
                  ...conversation,
                  last_message: content || "Attachment",
                  last_message_time: optimisticMessage.created_at,
                }
              : conversation
          )
          .sort(
            (a, b) =>
              new Date(b.last_message_time).getTime() -
              new Date(a.last_message_time).getTime()
          )
      );
    } catch (error) {
      console.error("Send message failed:", error);
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticMessage.id ? { ...message, failed: true, optimistic: false } : message
        )
      );
      setNewMessage(content);
      setAttachmentUrl(outgoingAttachment || "");
      toast.error("Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    `${conversation.name} ${conversation.order_title}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-surface rounded-[24px] border border-border">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-secondary-foreground font-light tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[24px] shadow-sm overflow-hidden flex flex-col lg:flex-row h-full max-h-[750px] sm:max-h-none sm:h-[calc(100vh-12rem)]">
      
      {/* ── Sidebar: Conversations List ── */}
      <div className="w-full lg:w-80 flex flex-col bg-background/50 border-r border-border shrink-0">
        <div className="p-6 border-b border-border bg-surface">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10 pr-4 h-11 bg-secondary border-none rounded-full text-sm focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedConv(conversation)}
              className={`w-full text-left px-6 py-5 cursor-pointer transition-colors flex gap-4 ${
                selectedConv?.id === conversation.id
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-12 h-12 border border-border">
                  <AvatarImage src={conversation.avatar_url || ""} />
                  <AvatarFallback className="bg-surface text-primary font-serif text-lg">
                    {conversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-surface">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-medium text-foreground truncate pr-2">
                    {conversation.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0 uppercase tracking-widest">
                    {new Date(conversation.last_message_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {conversation.order_title && (
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate mb-1">
                    {conversation.order_title}
                  </p>
                )}
                <p className="text-xs truncate text-secondary-foreground font-light">
                  {conversation.last_message}
                </p>
              </div>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-secondary-foreground font-light text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* ── Main Panel: Messages ── */}
      <div className="flex-1 flex flex-col bg-surface overflow-hidden relative">
        {selectedConv ? (
          <>
            <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface z-10 sticky top-0">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="w-10 h-10 border border-border shrink-0">
                  <AvatarImage src={selectedConv.avatar_url || ""} />
                  <AvatarFallback className="bg-secondary text-primary font-serif">
                    {selectedConv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="font-serif text-lg text-foreground truncate">
                    {selectedConv.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedConv.order_title && (
                      <>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                          {selectedConv.order_title}
                        </p>
                        <span className="text-muted-foreground/30">•</span>
                      </>
                    )}
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${
                      connectionStatus === "connected" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {connectionStatus === "connected" ? "Online" : connectionStatus}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-secondary rounded-full"
              >
                <MoreVertical size={18} />
              </Button>
            </div>

            {errorMessage && (
              <div className="mx-8 mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-background/50">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-secondary-foreground font-light text-sm">
                  <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mr-3" />
                  Loading...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-light text-secondary-foreground">Start the conversation.</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showDate =
                    index === 0 ||
                    new Date(message.created_at).toDateString() !==
                      new Date(messages[index - 1].created_at).toDateString();

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-6">
                          <span className="px-3 py-1 bg-secondary rounded-full text-[9px] font-bold text-muted-foreground uppercase tracking-widest border border-border/50">
                            {new Date(message.created_at).toLocaleDateString("en-US", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                      )}
                      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? "text-right" : "text-left"}`}>
                          <div
                            className={`p-4 shadow-sm ${
                              isOwn
                                ? "bg-foreground text-background rounded-l-2xl rounded-tr-2xl"
                                : "bg-surface text-foreground border border-border rounded-r-2xl rounded-tl-2xl"
                            } ${message.failed ? "border border-destructive" : ""}`}
                          >
                            {message.content && (
                              <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                            {message.attachment_url && (
                              <a
                                href={message.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-3 block overflow-hidden rounded-xl border ${isOwn ? 'border-background/20' : 'border-border'} text-xs font-medium hover:opacity-80 transition-opacity`}
                              >
                                {isImageAttachment(message.attachment_url) ? (
                                  <img
                                    src={message.attachment_url}
                                    alt="Attachment"
                                    className="max-h-64 w-full object-cover"
                                  />
                                ) : (
                                  <span className="flex items-center justify-center p-4 gap-2 bg-secondary/50">
                                    <ImageIcon size={14} />
                                    View Attachment
                                  </span>
                                )}
                              </a>
                            )}
                          </div>
                          <div className={`flex items-center gap-2 mt-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                              {message.failed
                                ? "Failed"
                                : message.optimistic
                                  ? "Sending"
                                  : new Date(message.created_at).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                            </span>
                            {isOwn && !message.failed && (
                              <CheckCheck
                                size={14}
                                className={message.is_read ? "text-primary" : "text-muted-foreground/40"}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-border bg-surface sticky bottom-0">
              {showAttachmentInput && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
                  <Input
                    value={attachmentUrl}
                    onChange={(event) => setAttachmentUrl(event.target.value)}
                    placeholder="Paste image URL here..."
                    className="h-11 rounded-full bg-secondary border-none px-5 text-sm font-light"
                  />
                </motion.div>
              )}
              <div className="flex items-end gap-3 bg-secondary p-2 rounded-full border border-border/50 focus-within:border-primary/30 transition-all">
                <button
                  type="button"
                  onClick={() => setShowAttachmentInput((current) => !current)}
                  className="p-3 text-muted-foreground hover:text-primary transition-colors shrink-0 rounded-full"
                  aria-label="Add attachment"
                >
                  <Paperclip size={18} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm font-light py-3 px-2 leading-relaxed outline-none min-h-[44px]"
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !attachmentUrl.trim()) || sending}
                  variant="luxury"
                  size="icon"
                  className="shrink-0 h-11 w-11 rounded-full"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-surface">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <MessageSquare size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-serif text-foreground">Messaging</h3>
            <p className="text-secondary-foreground font-light text-sm max-w-xs mt-3 leading-relaxed">
              Select a conversation from the sidebar to connect with your designer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
