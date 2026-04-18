import React from 'react';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Button from '@/components/ui/Button';
import { ShoppingBag, Search, Filter, Plus, Ruler, Star } from "lucide-react";

export default async function WardrobePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch completed orders to populate the wardrobe
  const { data: items } = await supabase
    .from("orders")
    .select(`
      id, title, created_at, category, price,
      professional:profiles!orders_couturiere_id_fkey (id, first_name, last_name, avatar_url),
      references (file_url)
    `)
    .eq("client_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const wardrobeItems = items || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">My Wardrobe</h1>
          <p className="text-muted-foreground max-w-xl text-lg font-medium">
            Your collection of bespoke garments. Handcrafted by artisans, preserved for eternity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="bg-white rounded-xl shadow-sm border-slate-200">
             <Filter size={18} className="mr-2" />
             Filter
           </Button>
           <Button variant="luxury" className="rounded-xl shadow-lg">
             <Plus size={18} className="mr-2" />
             Add External Item
           </Button>
        </div>
      </div>

      {/* Stats / Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShoppingBag size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Items</p>
                <p className="text-2xl font-black">{wardrobeItems.length}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Star size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Artisans Worked With</p>
                <p className="text-2xl font-black">
                    {new Set(wardrobeItems.map(i => {
                        const pro = Array.isArray(i.professional) ? i.professional[0] : i.professional;
                        return pro?.id;
                    })).size}
                </p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Ruler size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Measurements</p>
                <p className="text-2xl font-black">1 Profile</p>
            </div>
        </div>
      </div>

      {/* Wardrobe Grid */}
      {wardrobeItems.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Your wardrobe is empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
                Once your bespoke orders are completed, they will appear here as part of your digital collection.
            </p>
            <Button variant="outline" className="mt-8 rounded-xl" asChild>
                <Link href="/marketplace">Explore Artisans</Link>
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wardrobeItems.map((item: any) => (
            <div key={item.id} className="group h-[28rem] bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                
                {/* Image Area */}
                <div className="relative flex-1 bg-slate-50 overflow-hidden">
                    <img 
                    src={item.references?.[0]?.file_url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop"} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {item.category || "Couture"}
                        </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <Link href={`/orders/${item.id}`}>
                            <button className="w-12 h-12 rounded-2xl bg-white text-indigo-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                                <Search size={20} />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.title}
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium uppercase tracking-widest">Artisan</span>
                            <span className="font-bold text-slate-700">
                                {(() => {
                                    const pro = Array.isArray(item.professional) ? item.professional[0] : item.professional;
                                    return pro ? `${pro.first_name} ${pro.last_name}` : "Unknown Artisan";
                                })()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium uppercase tracking-widest">Added</span>
                            <span className="font-bold text-slate-700">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}
