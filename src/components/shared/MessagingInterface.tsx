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
        // Listen to any message where the sender or receiver is the partner
        // and the other participant is the current user.
        // We'll filter in JS to be sure.
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
      <div className="h-full flex items-center justify-center bg-card rounded-xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <span className="material-icons animate-spin text-primary">hourglass_empty</span>
          <p className="text-sm text-muted-foreground font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row h-full max-h-[750px] sm:max-h-none sm:h-[calc(100vh-12rem)]">
      <div className="w-full lg:w-80 border-r border-border flex flex-col bg-secondary/10">
        <div className="p-4 border-b border-border bg-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search a conversation..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary/20 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedConv(conversation)}
              className={`w-full text-left p-4 cursor-pointer transition-all flex gap-3 border-l-4 ${
                selectedConv?.id === conversation.id
                  ? "bg-primary/5 border-l-primary"
                  : "hover:bg-secondary/30 border-l-transparent"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-11 h-11 border border-border shadow-sm">
                  <AvatarImage src={conversation.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                    {conversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm truncate pr-2 font-semibold text-foreground/90">
                    {conversation.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                    {new Date(conversation.last_message_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-primary truncate mb-1">
                  {conversation.order_title}
                </p>
                <p className="text-xs truncate text-muted-foreground">
                  {conversation.last_message}
                </p>
              </div>
            </button>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/95 backdrop-blur-md z-10 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-10 h-10 border border-border shrink-0">
                  <AvatarImage src={selectedConv.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {selectedConv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="font-bold text-foreground text-sm truncate">
                    {selectedConv.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {selectedConv.order_title}
                  </p>
                  <p className={`text-[10px] font-bold uppercase ${
                    connectionStatus === "connected" ? "text-success" : "text-muted-foreground"
                  }`}>
                    {connectionStatus === "connected" ? "Realtime connected" : connectionStatus}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-secondary/50 rounded-full"
              >
                <MoreVertical size={20} />
              </Button>
            </div>

            {errorMessage && (
              <div className="mx-4 mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                  <MessageSquare className="w-10 h-10" />
                  <p className="text-sm font-medium">No messages yet.</p>
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
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-secondary/50 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {new Date(message.created_at).toLocaleDateString("fr-FR", {
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
                            className={`p-3.5 rounded-2xl shadow-sm ${
                              isOwn
                                ? "bg-primary text-white rounded-br-none"
                                : "bg-white text-foreground rounded-bl-none border border-border/60"
                            } ${message.failed ? "border border-destructive" : ""}`}
                          >
                            {message.content && (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                            {message.attachment_url && (
                              <a
                                href={message.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block overflow-hidden rounded-xl border border-white/30 text-xs font-semibold underline-offset-2 hover:underline"
                              >
                                {isImageAttachment(message.attachment_url) ? (
                                  <img
                                    src={message.attachment_url}
                                    alt="Attachment"
                                    className="max-h-48 w-full object-cover"
                                  />
                                ) : (
                                  <span className="flex items-center gap-2">
                                    <ImageIcon size={14} />
                                    Open attachment
                                  </span>
                                )}
                              </a>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">
                              {message.failed
                                ? "Failed"
                                : message.optimistic
                                  ? "Sending..."
                                  : new Date(message.created_at).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                            </span>
                            {isOwn && !message.failed && (
                              <CheckCheck
                                size={14}
                                className={message.is_read ? "text-primary" : "text-muted-foreground/50"}
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

            <div className="p-4 border-t border-border bg-white sticky bottom-0">
              {showAttachmentInput && (
                <Input
                  value={attachmentUrl}
                  onChange={(event) => setAttachmentUrl(event.target.value)}
                  placeholder="Attachment URL (optional)"
                  className="mb-2 rounded-xl bg-secondary/20"
                />
              )}
              <div className="flex items-end gap-2 bg-secondary/20 p-2 rounded-2xl border border-border/50 focus-within:border-primary/50 focus-within:bg-white focus-within:shadow-md transition-all">
                <button
                  type="button"
                  onClick={() => setShowAttachmentInput((current) => !current)}
                  className="p-2.5 text-muted-foreground hover:text-primary transition-colors shrink-0 rounded-xl hover:bg-primary/5"
                  aria-label="Add attachment"
                >
                  <Paperclip size={20} />
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
                  placeholder={`Write to ${selectedConv.name}...`}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm py-2 px-2 leading-relaxed outline-none min-h-[40px]"
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !attachmentUrl.trim()) || sending}
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
            <h3 className="text-xl font-bold text-foreground">Your Messages</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-3 leading-relaxed">
              Select a conversation to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
