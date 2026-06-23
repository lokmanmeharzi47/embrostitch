"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import Button from '@/components/ui/Button';
import { ShoppingBag, Search, Filter, Plus, Star, X } from "lucide-react";

interface WardrobeItem {
  id: string;
  title: string;
  created_at: string;
  category: string | null;
  price: number | null;
  professional: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  references: { file_url: string }[];
}

interface ExternalItem {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  created_at: string;
  source: 'external';
}

type DisplayItem = (WardrobeItem & { source: 'order' }) | ExternalItem;

const CATEGORIES = [
  'Tous',
  'Karakou',
  'Robe de mariée',
  'Caftan',
  'Haute Couture',
  'Broderie',
  'Quotidien',
  'Costume',
  'Autre',
];

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [externalItems, setExternalItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', category: '', image_url: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUserId(user.id);

      const [ordersResult, externalResult] = await Promise.all([
        supabase
          .from("orders")
          .select(`
            id, title, created_at, category, price,
            professional:profiles!orders_creator_id_fkey (id, first_name, last_name, avatar_url),
            references (file_url)
          `)
          .eq("client_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false }),
        supabase
          .from("wardrobe_items")
          .select("id, title, category, image_url, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const rawOrders = (ordersResult.data || []) as unknown as Array<{
        id: string;
        title: string;
        created_at: string;
        category: string | null;
        price: number | null;
        professional: { id: string; first_name: string; last_name: string; avatar_url: string | null } | { id: string; first_name: string; last_name: string; avatar_url: string | null }[] | null;
        references: { file_url: string }[];
      }>;

      const mappedOrders: WardrobeItem[] = rawOrders.map((o) => ({
        ...o,
        professional: Array.isArray(o.professional) ? (o.professional[0] ?? null) : o.professional,
      }));

      setItems(mappedOrders);
      setExternalItems((externalResult.data || []).map((e) => ({ ...e, source: 'external' as const })));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAddExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !addForm.title.trim()) return;
    setAddLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert({
        user_id: userId,
        title: addForm.title.trim(),
        category: addForm.category.trim() || null,
        image_url: addForm.image_url.trim() || null,
      })
      .select("id, title, category, image_url, created_at")
      .single();
    setAddLoading(false);
    if (!error && data) {
      setExternalItems((prev) => [{ ...data, source: 'external' as const }, ...prev]);
      setShowAddModal(false);
      setAddForm({ title: '', category: '', image_url: '' });
    }
  };

  const allItems: DisplayItem[] = [
    ...items.map((i) => ({ ...i, source: 'order' as const })),
    ...externalItems,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = activeFilter === 'Tous'
    ? allItems
    : allItems.filter((i) => (i.category || '').toLowerCase().includes(activeFilter.toLowerCase()));

  const uniqueArtisans = new Set(
    items
      .map((i) => i.professional?.id)
      .filter(Boolean)
  ).size;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-80 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Ma Garde-robe</h1>
          <p className="text-muted-foreground max-w-xl text-lg font-medium">
            Votre collection de vêtements sur mesure. Façonnés par des artisans, conservés pour l&apos;éternité.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="bg-white rounded-xl shadow-sm border-slate-200"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter size={18} className="mr-2" />
            Filtrer
            {activeFilter !== 'Tous' && (
              <span className="ml-2 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                1
              </span>
            )}
          </Button>
          <Button
            variant="luxury"
            className="rounded-xl shadow-lg"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} className="mr-2" />
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveFilter(cat); setShowFilterPanel(false); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Articles</p>
            <p className="text-2xl font-black">{allItems.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Artisans Travaillés</p>
            <p className="text-2xl font-black">{uniqueArtisans}</p>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            {activeFilter !== 'Tous' ? `Aucun article "${activeFilter}"` : 'Votre garde-robe est vide'}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {activeFilter !== 'Tous'
              ? 'Essayez un autre filtre ou ajoutez un article externe.'
              : 'Vos commandes terminées et articles ajoutés apparaîtront ici.'}
          </p>
          {activeFilter !== 'Tous' ? (
            <Button variant="outline" className="mt-8 rounded-xl" onClick={() => setActiveFilter('Tous')}>
              Voir tous les articles
            </Button>
          ) : (
            <Button variant="outline" className="mt-8 rounded-xl" asChild>
              <Link href="/marketplace">Explorer les Artisans</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((item) => {
            const imageUrl = item.source === 'order'
              ? (item as WardrobeItem & { source: 'order' }).references?.[0]?.file_url || '/fabric-texture.png'
              : (item as ExternalItem).image_url || '/fabric-texture.png';

            const artisanName = item.source === 'order'
              ? (() => {
                  const pro = (item as WardrobeItem).professional;
                  return pro ? `${pro.first_name} ${pro.last_name}` : 'Artisan inconnu';
                })()
              : 'Article externe';

            const detailHref = item.source === 'order' ? `/client/orders/${item.id}` : undefined;

            return (
              <div key={item.id} className="group h-[28rem] bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                <div className="relative flex-1 bg-slate-50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/fabric-texture.png'; }}
                  />

                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {item.category || 'Couture'}
                    </span>
                  </div>

                  {item.source === 'external' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                        Externe
                      </span>
                    </div>
                  )}

                  {detailHref && (
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <Link href={detailHref}>
                        <button className="w-12 h-12 rounded-2xl bg-white text-indigo-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                          <Search size={20} />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium uppercase tracking-widest">Artisan</span>
                      <span className="font-bold text-slate-700">{artisanName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium uppercase tracking-widest">Ajouté le</span>
                      <span className="font-bold text-slate-700">{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add External Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Ajouter un article externe</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddExternal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Titre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="Ex: Robe traditionnelle héritée"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Catégorie</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {CATEGORIES.filter((c) => c !== 'Tous').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">URL de l&apos;image</label>
                <input
                  type="url"
                  value={addForm.image_url}
                  onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" className="flex-1" disabled={addLoading}>
                  {addLoading ? 'Ajout...' : 'Ajouter'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
