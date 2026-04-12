"use client";

import React, { useState } from "react";
import OrderCard from "@/components/dashboard/OrderCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: string;
  title: string;
  price: number;
  status: string;
  delivery_date: string | null;
  created_at: string;
  couturiere: { first_name: string; last_name: string } | { first_name: string; last_name: string }[];
}

interface OrdersClientProps {
  initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const mapStatus = (
    s: string
  ): "Pending" | "In Progress" | "Completed" | "Shipped" | "Queued" => {
    const map: Record<
      string,
      "Pending" | "In Progress" | "Completed" | "Shipped" | "Queued"
    > = {
      pending: "Pending",
      accepted: "Queued",
      in_progress: "In Progress",
      completed: "Completed",
    };
    return map[s] || "Pending";
  };

  let filtered = orders;
  if (statusFilter !== "all") {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((o) => o.title.toLowerCase().includes(q));
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    in_progress: orders.filter((o) =>
      ["accepted", "in_progress"].includes(o.status)
    ).length,
    completed: orders.filter((o) => o.status === "completed").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Mes Commandes
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Suivez vos projets de couture en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-muted-foreground text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <Link href="/client/orders/new">
            <Button variant="default">
              <span className="material-icons text-sm mr-2">add</span>
              Nouvelle Commande
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 flex gap-6 overflow-x-auto">
        {[
          { key: "all", label: "Toutes" },
          { key: "pending", label: "En attente" },
          { key: "in_progress", label: "En cours" },
          { key: "completed", label: "Terminées" },
          { key: "rejected", label: "Annulées" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`text-sm font-medium pb-3 whitespace-nowrap transition-colors border-b-2 ${
              statusFilter === tab.key
                ? "text-primary border-primary font-semibold"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            {tab.label} (
            {statusCounts[tab.key as keyof typeof statusCounts] || 0})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((order) => {
            const c = Array.isArray(order.couturiere)
              ? order.couturiere[0]
              : order.couturiere;
            return (
              <OrderCard
                key={order.id}
                id={order.id}
                title={order.title}
                partnerName={`${c.first_name} ${c.last_name}`}
                price={`${Number(order.price).toLocaleString()} DA`}
                deliveryDate={
                  order.delivery_date
                    ? new Date(order.delivery_date).toLocaleDateString(
                        "fr-FR",
                        { month: "short", day: "numeric" }
                      )
                    : "À définir"
                }
                status={mapStatus(order.status)}
              />
            );
          })
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <span className="material-icons text-5xl mb-3 opacity-30">
              inbox
            </span>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Aucune commande
            </h3>
            <p className="text-sm mb-6">
              {statusFilter !== "all"
                ? "Aucune commande avec ce statut."
                : "Vous n'avez pas encore de commandes. Trouvez une couturière et passez votre première commande !"}
            </p>
            <Link href="/search">
              <Button variant="default">
                <span className="material-icons text-sm mr-2">search</span>
                Trouver une Couturière
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
