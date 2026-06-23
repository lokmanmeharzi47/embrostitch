"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CreatorOption {
  id: string;
  first_name: string;
  last_name: string;
}

export default function CreateOrderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    creator_id: "",
    delivery_date: "",
    garment_type: "",
    fabric: "",
    delivery_address: "",
    delivery_country: "",
  });

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("role", "creator");

        if (error) {
          console.error("Error fetching creators:", error);
          toast.error("Impossible de charger la liste des couturières");
        } else {
          setCreators((data || []) as CreatorOption[]);
        }
      } catch (err) {
        console.error("Unexpected error fetching creators:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title || !form.creator_id || !form.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from("orders").insert({
      client_id: user.id,
      creator_id: form.creator_id,
      title: form.title,
      description: form.description || null,
      price: parseFloat(form.price),
      delivery_date: form.delivery_date || null,
      garment_type: form.garment_type || null,
      fabric: form.fabric || null,
      delivery_address: form.delivery_address || null,
      delivery_country: form.delivery_country || null,
      status: "pending",
    });

    if (error) {
      toast.error("Erreur lors de la création de la commande");
      setSubmitting(false);
    } else {
      toast.success("Commande créée avec succès !");

      // Create notification for the creator
      await supabase.from("notifications").insert({
        user_id: form.creator_id,
        type: "order_update",
        title: "Nouvelle commande reçue",
        body: `${form.title} — ${parseFloat(form.price).toLocaleString()} DA`,
        link: "/creator",
      });

      router.push("/client/orders");
    }
  };

  if (loading || authLoading) {
    return (
    <>
        <div className="animate-pulse space-y-6 max-w-2xl">
          <div className="h-10 bg-muted rounded-xl w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
    </>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Nouvelle Commande
          </h1>
          <p className="text-muted-foreground">
            Décrivez votre projet et choisissez une couturière.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Titre du projet *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Robe de soirée en soie"
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Décrivez votre projet en détail : style, couleurs, mesures..."
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Creator Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Créatrice *
            </label>
            {creators.length > 0 ? (
              <select
                value={form.creator_id}
                onChange={(e) =>
                  setForm({ ...form, creator_id: e.target.value })
                }
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                required
              >
                <option value="">Sélectionner une couturière</option>
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-xl">
                Aucune couturière disponible pour le moment.
              </p>
            )}
          </div>

          {/* Garment Type & Fabric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Type de vêtement
              </label>
              <input
                type="text"
                value={form.garment_type}
                onChange={(e) => setForm({ ...form, garment_type: e.target.value })}
                placeholder="Ex: Robe, Karakou, Costume..."
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tissu souhaité
              </label>
              <input
                type="text"
                value={form.fabric}
                onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                placeholder="Ex: Soie, Velours, Broderie..."
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Price & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Budget (DA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="5000"
                  min="0"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  DA
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Date de livraison souhaitée
              </label>
              <input
                type="date"
                value={form.delivery_date}
                onChange={(e) =>
                  setForm({ ...form, delivery_date: e.target.value })
                }
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Delivery Address (optional - for diaspora) */}
          <div className="border border-border/50 rounded-xl p-4 bg-secondary/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Livraison internationale (optionnel)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Pays de livraison
                </label>
                <select
                  value={form.delivery_country}
                  onChange={(e) => setForm({ ...form, delivery_country: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  <option value="">Algérie (par défaut)</option>
                  <option value="FR">France</option>
                  <option value="CA">Canada</option>
                  <option value="BE">Belgique</option>
                  <option value="CH">Suisse</option>
                  <option value="DE">Allemagne</option>
                  <option value="ES">Espagne</option>
                  <option value="IT">Italie</option>
                  <option value="GB">Royaume-Uni</option>
                  <option value="US">États-Unis</option>
                  <option value="AE">Émirats Arabes Unis</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Adresse complète
                </label>
                <input
                  type="text"
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  placeholder="Rue, ville, code postal..."
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <span className="material-icons text-sm animate-spin mr-2">
                    hourglass_empty
                  </span>
                  Création...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-2">send</span>
                  Envoyer la Commande
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
