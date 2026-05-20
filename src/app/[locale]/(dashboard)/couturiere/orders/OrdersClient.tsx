"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
  client: { first_name: string; last_name: string } | { first_name: string; last_name: string }[];
}

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (loadingId) return;
    setLoadingId(`${orderId}-${newStatus}`);
    try {
      const supabase = createClient();
      const { error, data } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select();

      if (error) {
        console.error("Order status update error:", error);
        toast.error(`Erreur: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("Order update returned 0 rows — possible RLS block for orderId:", orderId);
        toast.error("Mise à jour impossible — vérifiez vos permissions.");
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success("Statut mis à jour");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered =
    statusFilter === "all"
      ? orders
      : statusFilter === "cancelled"
        ? orders.filter((o) => ["rejected", "cancelled"].includes(o.status))
        : statusFilter === "in_progress"
          ? orders.filter((o) => ["accepted", "in_progress"].includes(o.status))
          : orders.filter((o) => o.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    accepted: "bg-primary/10 text-primary",
    in_progress: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    cancelled: "bg-rose-100 text-rose-600",
  };

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    accepted: "Acceptée",
    in_progress: "En cours",
    completed: "Terminée",
    rejected: "Refusée",
    cancelled: "Annulée",
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Mes Commandes
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Gérez vos commandes en temps réel.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Toutes", count: orders.length },
          {
            key: "pending",
            label: "En attente",
            count: orders.filter((o) => o.status === "pending").length,
          },
          {
            key: "in_progress",
            label: "En cours",
            count: orders.filter((o) =>
              ["accepted", "in_progress"].includes(o.status)
            ).length,
          },
          {
            key: "completed",
            label: "Terminées",
            count: orders.filter((o) => o.status === "completed").length,
          },
          {
            key: "cancelled",
            label: "Annulées",
            count: orders.filter((o) => ["rejected", "cancelled"].includes(o.status)).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((order) => {
            const client = Array.isArray(order.client)
              ? order.client[0]
              : order.client;
            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all relative"
              >
                <Link href={`/couturiere/orders/${order.id}`} className="block">
                  <div className="flex flex-col sm:flex-row gap-5 mb-3">
                    {/* Thumbnail */}
                    {order.images?.[0] ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={order.images[0]} alt={order.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <span className="material-icons text-primary/30 text-3xl">checkroom</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {order.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            par {(client?.first_name || client?.last_name) ? `${client.first_name || ""} ${client.last_name || ""}`.trim() : "Anonyme"} ·{" "}
                            {new Date(order.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-foreground">
                            {Number(order.price).toLocaleString()} DA
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[order.status] ||
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {order.description}
                    </p>
                  )}

                  {order.delivery_date && (
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                      <span className="material-icons text-sm">event</span>
                      Livraison:{" "}
                      {new Date(order.delivery_date).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </Link>

                {/* Action Buttons */}
                <div className="relative z-10">
                  {order.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        disabled={!!loadingId}
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, "accepted"); }}
                      >
                        <span className="material-icons text-sm mr-1">
                          {loadingId === `${order.id}-accepted` ? "hourglass_empty" : "check"}
                        </span>
                        {loadingId === `${order.id}-accepted` ? "…" : "Accepter"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!!loadingId}
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, "rejected"); }}
                        className="text-destructive border-destructive/30 hover:bg-destructive/5"
                      >
                        <span className="material-icons text-sm mr-1">close</span>
                        {loadingId === `${order.id}-rejected` ? "…" : "Refuser"}
                      </Button>
                    </div>
                  )}

                  {order.status === "accepted" && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={!!loadingId}
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, "in_progress"); }}
                      className="mt-2"
                    >
                      <span className="material-icons text-sm mr-1">play_arrow</span>
                      {loadingId === `${order.id}-in_progress` ? "…" : "Commencer"}
                    </Button>
                  )}

                  {order.status === "in_progress" && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={!!loadingId}
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, "completed"); }}
                      className="mt-2 bg-success hover:bg-success/90"
                    >
                      <span className="material-icons text-sm mr-1">check_circle</span>
                      {loadingId === `${order.id}-completed` ? "…" : "Marquer Terminée"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <span className="material-icons text-5xl mb-3 opacity-30">
              inbox
            </span>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Aucune commande
            </h3>
            <p className="text-sm">
              {statusFilter !== "all"
                ? "Essayez un autre filtre."
                : "Vos commandes apparaîtront ici lorsque des clients vous contacteront."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
