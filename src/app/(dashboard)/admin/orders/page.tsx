"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
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
  client: { first_name: string; last_name: string };
  couturiere: { first_name: string; last_name: string };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(
          `
          id, title, description, price, status, delivery_date, created_at,
          client:profiles!orders_client_id_fkey (first_name, last_name),
          couturiere:profiles!orders_couturiere_id_fkey (first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      setOrders((data || []) as unknown as Order[]);
      setLoading(false);
    };
    fetchOrders();
  }, []);

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
    pending: "bg-warning/10 text-warning",
    accepted: "bg-primary/10 text-primary",
    in_progress: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    accepted: "Acceptée",
    in_progress: "En cours",
    completed: "Terminée",
    rejected: "Refusée",
  };

  if (loading) {
    return (
    <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="h-16 bg-muted rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Suivi des Commandes
          </h1>
          <p className="text-muted-foreground">
            {orders.length} commande{orders.length > 1 ? "s" : ""} sur la
            plateforme.
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Toutes", count: orders.length },
          {
            key: "pending",
            label: "En attente",
            count: orders.filter((o) => o.status === "pending").length,
          },
          {
            key: "accepted",
            label: "Acceptées",
            count: orders.filter((o) => o.status === "accepted").length,
          },
          {
            key: "in_progress",
            label: "En cours",
            count: orders.filter((o) => o.status === "in_progress").length,
          },
          {
            key: "completed",
            label: "Terminées",
            count: orders.filter((o) => o.status === "completed").length,
          },
          {
            key: "rejected",
            label: "Refusées",
            count: orders.filter((o) => o.status === "rejected").length,
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

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Commande</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Couturière</th>
                <th className="px-6 py-4 font-medium">Prix</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? (
                filtered.map((order) => {
                  const client = Array.isArray(order.client)
                    ? order.client[0]
                    : order.client;
                  const couturiere = Array.isArray(order.couturiere)
                    ? order.couturiere[0]
                    : order.couturiere;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-secondary/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground truncate max-w-[200px]">
                          {order.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {client?.first_name} {client?.last_name}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {couturiere?.first_name} {couturiere?.last_name}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {Number(order.price).toLocaleString()} DA
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[order.status] ||
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Voir détails"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <span className="material-icons text-[18px]">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <span className="material-icons text-4xl text-muted-foreground/30 mb-2 block">
                      receipt_long
                    </span>
                    <p className="text-muted-foreground">
                      Aucune commande trouvée.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedOrder.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  #{selectedOrder.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="text-sm font-medium text-foreground">
                    {(Array.isArray(selectedOrder.client)
                      ? selectedOrder.client[0]
                      : selectedOrder.client
                    )?.first_name}{" "}
                    {(Array.isArray(selectedOrder.client)
                      ? selectedOrder.client[0]
                      : selectedOrder.client
                    )?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Couturière
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {(Array.isArray(selectedOrder.couturiere)
                      ? selectedOrder.couturiere[0]
                      : selectedOrder.couturiere
                    )?.first_name}{" "}
                    {(Array.isArray(selectedOrder.couturiere)
                      ? selectedOrder.couturiere[0]
                      : selectedOrder.couturiere
                    )?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prix</p>
                  <p className="text-sm font-bold text-foreground">
                    {Number(selectedOrder.price).toLocaleString()} DA
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Livraison
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedOrder.delivery_date
                      ? new Date(
                          selectedOrder.delivery_date
                        ).toLocaleDateString("fr-FR")
                      : "Non définie"}
                  </p>
                </div>
              </div>

              {selectedOrder.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedOrder.description}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Changer le statut
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "pending",
                  "accepted",
                  "in_progress",
                  "completed",
                  "rejected",
                ].map((status) => (
                  <Button
                    key={status}
                    variant={
                      selectedOrder.status === status ? "primary" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, status);
                      setSelectedOrder({ ...selectedOrder, status });
                    }}
                    className="text-xs"
                  >
                    {statusLabels[status]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
