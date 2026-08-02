"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface Order {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  delivery_date: string | null;
  created_at: string;
  images: string[];
  client: { first_name: string; last_name: string };
}

export default function CreatorOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(
          `
          id, title, price, status, delivery_date, created_at, images,
          client:profiles!orders_client_id_fkey (first_name, last_name)
        `
        )
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((data || []) as unknown as Order[]);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success("Statut mis à jour");
    }
  };

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const statusColors: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning",
    ACCEPTED: "bg-primary/10 text-primary",
    IN_PRODUCTION: "bg-primary/10 text-primary",
    READY: "bg-info/10 text-info",
    SHIPPED: "bg-info/10 text-info",
    DELIVERED: "bg-success/10 text-success",
    COMPLETED: "bg-success/10 text-success",
    CANCELLED: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    ACCEPTED: "Acceptée",
    IN_PRODUCTION: "En production",
    READY: "Prête",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
  };

  if (loading) {
    return (
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Mes Commandes
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez vos commandes et suivez l'évolution de vos projets.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-muted/30 p-1 rounded-2xl w-fit">
        {[
          { key: "all", label: "Toutes", count: orders.length },
          {
            key: "PENDING",
            label: "En attente",
            count: orders.filter((o) => o.status === "PENDING").length,
          },
          {
            key: "IN_PRODUCTION",
            label: "En production",
            count: orders.filter((o) =>
              ["ACCEPTED", "IN_PRODUCTION", "READY"].includes(o.status)
            ).length,
          },
          {
            key: "SHIPPED",
            label: "En livraison",
            count: orders.filter((o) => ["SHIPPED", "DELIVERED"].includes(o.status)).length,
          },
          {
            key: "COMPLETED",
            label: "Terminées",
            count: orders.filter((o) => o.status === "COMPLETED").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              statusFilter === tab.key
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} <span className="ml-1 opacity-50">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.length > 0 ? (
          filtered.map((order) => {
            const client = Array.isArray(order.client)
              ? order.client[0]
              : order.client;
            return (
              <Card
                key={order.id}
                className="group border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                  {/* Link wrapper for the left part */}
                  <Link href={`/creator/orders/${order.id}`} className="flex flex-col md:flex-row gap-6 flex-1">
                    {/* Image Column */}
                    <div className="shrink-0">
                      {order.images?.[0] ? (
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-sm">
                          <img src={order.images[0]} alt={order.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-muted flex items-center justify-center">
                          <ShoppingBag size={32} className="text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Status & Price Column */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <Badge
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            statusColors[order.status] ||
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          N° {order.id.substring(0, 8)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                          {order.title}
                        </h3>
                        <p className="text-muted-foreground font-medium">
                          Client: <span className="text-foreground">{(client?.first_name || client?.last_name) ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "Client inconnu"}</span> ·{" "}
                          {new Date(order.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>

                      {order.description && (
                        <p className="text-sm text-muted-foreground/80 max-w-2xl line-clamp-2">
                          {order.description}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Pricing and Actions Section */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-6 pt-6 md:pt-0 md:pl-8 md:border-l border-border/50 relative z-10">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Montant</p>
                      <div className="text-3xl font-black text-foreground">
                        {Number(order.price).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">DA</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                         {/* Action Buttons */}
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="rounded-xl px-6"
                              onClick={() =>
                                handleStatusUpdate(order.id, "ACCEPTED")
                              }
                            >
                              Accepter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5"
                              onClick={() =>
                                handleStatusUpdate(order.id, "CANCELLED")
                              }
                            >
                              Refuser
                            </Button>
                          </>
                        )}

                        {order.status === "ACCEPTED" && (
                          <Button
                            variant="primary"
                            className="rounded-xl px-8"
                            onClick={() =>
                              handleStatusUpdate(order.id, "IN_PRODUCTION")
                            }
                          >
                            Commencer prod.
                          </Button>
                        )}

                        {order.status === "IN_PRODUCTION" && (
                          <Button
                            variant="primary"
                            className="rounded-xl px-8"
                            onClick={() =>
                              handleStatusUpdate(order.id, "READY")
                            }
                          >
                            Marquer Prête
                          </Button>
                        )}

                        {order.status === "READY" && (
                          <Button
                            variant="primary"
                            className="rounded-xl px-8"
                            onClick={() =>
                              handleStatusUpdate(order.id, "SHIPPED")
                            }
                          >
                            Marquer Expédiée
                          </Button>
                        )}

                        {order.status === "SHIPPED" && (
                          <Button
                            variant="primary"
                            className="rounded-xl px-8 bg-success hover:bg-success/90"
                            onClick={() =>
                              handleStatusUpdate(order.id, "DELIVERED")
                            }
                          >
                            Confirmer Livraison
                          </Button>
                        )}

                        {order.status === "DELIVERED" && (
                          <Button
                            variant="primary"
                            className="rounded-xl px-8 bg-success hover:bg-success/90"
                            onClick={() =>
                              handleStatusUpdate(order.id, "COMPLETED")
                            }
                          >
                            Terminer la commande
                          </Button>
                        )}

                        {order.status === "COMPLETED" && (
                            <Button variant="outline" className="rounded-xl" disabled>
                                Terminée
                            </Button>
                        )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingBag size={32} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Aucune commande trouvée
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {statusFilter !== "all"
                ? "Aucune commande ne correspond à ce filtre pour le moment."
                : "Vous recevrez une notification dès qu'un client passera une commande."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
