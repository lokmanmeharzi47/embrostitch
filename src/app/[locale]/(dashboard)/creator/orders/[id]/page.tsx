import React from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import OrderReferenceGrid from '../../../client/orders/[id]/OrderReferenceGrid';

interface MeasurementsSnapshot {
  label?: string;
  height: number;
  bust: number;
  waist: number;
  hips: number;
  age?: number | null;
  weight?: number | null;
  dress_type?: string | null;
  recommended_size?: string | null;
  ai_confidence?: number | null;
  ai_analysis?: string | null;
  ai_warnings?: string[] | null;
  ai_suggestions?: string[] | null;
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:profiles!orders_client_id_fkey (*)
    `)
    .eq('id', id)
    .eq('creator_id', user.id)
    .single();

  if (error || !order) {
    console.error("Order fetch error:", error);
    notFound();
  }

  const { data: references } = await supabase
    .from('references')
    .select('file_url')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });

  const clientName = order.client 
    ? `${order.client.first_name} ${order.client.last_name}`
    : 'Unknown Client';
  
  const orderImages = Array.isArray(order.images)
    ? order.images.filter((image: unknown): image is string => typeof image === 'string')
    : [];
  const referenceImages = (references || [])
    .map((reference) => reference.file_url)
    .filter((image: unknown): image is string => typeof image === 'string');
  const initialReferenceImages = Array.from(new Set([...orderImages, ...referenceImages]));

  const measurements = order.measurements_snapshot as MeasurementsSnapshot | null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
         <Link href="/creator/orders" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <span className="material-icons text-[16px]">arrow_back</span>
            Retour aux Commandes
         </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Commande #{order.id.slice(0, 8)}</span>
            <span className="bg-primary/10 text-primary font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
               {order.status}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">{order.title}</h1>
        </div>
        <div className="flex gap-3">
           <Link href={`/creator/messages?orderId=${order.id}`}>
             <Button variant="primary" className="rounded-xl px-6">
               <span className="material-icons text-sm mr-2">chat</span>
               Message au Client
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-border bg-secondary/10">
                  <h2 className="text-xl font-bold text-foreground">Aperçu du Projet</h2>
               </div>
               <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Client</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                           <span className="text-primary font-bold text-sm">{clientName.charAt(0)}</span>
                        </div>
                        <p className="text-base font-bold text-foreground">{clientName}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Livraison Prévue</p>
                     <p className="text-base font-bold text-foreground flex items-center gap-2">
                        <span className="material-icons text-warning">event</span>
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('fr-FR') : 'À définir'}
                     </p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Prix Total</p>
                     <div className="text-2xl font-black text-primary">
                        {Number(order.price).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">DA</span>
                     </div>
                  </div>
               </div>
            </section>

            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-border bg-secondary/10">
                  <h2 className="text-xl font-bold text-foreground">Détails du Design</h2>
               </div>
               <div className="p-8">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Description du Projet</p>
                  <div className="text-base text-foreground leading-relaxed bg-muted/30 p-6 rounded-2xl border border-border/50">
                     {order.description || 'Aucune description fournie.'}
                  </div>
               </div>
            </section>

            {measurements && (
               <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border bg-secondary/10 flex items-center justify-between">
                     <h2 className="text-xl font-bold text-foreground">Mesures &amp; Analyse IA</h2>
                     {measurements.label && (
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">{measurements.label}</span>
                     )}
                  </div>
                  <div className="p-8">
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-muted/30 rounded-xl p-4 text-center border border-border/50">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Taille</p>
                           <p className="text-lg font-black text-foreground">{measurements.height} cm</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-4 text-center border border-border/50">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Poitrine</p>
                           <p className="text-lg font-black text-foreground">{measurements.bust} cm</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-4 text-center border border-border/50">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Taille (tour)</p>
                           <p className="text-lg font-black text-foreground">{measurements.waist} cm</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-4 text-center border border-border/50">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Hanches</p>
                           <p className="text-lg font-black text-foreground">{measurements.hips} cm</p>
                        </div>
                     </div>

                     {(measurements.recommended_size || measurements.ai_confidence != null) && (
                        <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-border/50">
                           {measurements.recommended_size && (
                              <div>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Taille Recommandée</p>
                                 <p className="text-2xl font-black text-primary">{measurements.recommended_size}</p>
                              </div>
                           )}
                           {measurements.ai_confidence != null && (
                              <div>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Confiance IA</p>
                                 <p className="text-2xl font-black text-foreground">{Math.round(measurements.ai_confidence)}%</p>
                              </div>
                           )}
                        </div>
                     )}

                     {measurements.ai_analysis && (
                        <div className="mb-6">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Analyse IA</p>
                           <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">{measurements.ai_analysis}</p>
                        </div>
                     )}

                     {measurements.ai_warnings && measurements.ai_warnings.length > 0 && (
                        <div>
                           <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-2">Points à vérifier</p>
                           <ul className="space-y-1.5">
                              {measurements.ai_warnings.map((w, i) => (
                                 <li key={i} className="text-sm text-foreground flex gap-2">
                                    <span className="material-icons text-warning text-base">warning</span>
                                    {w}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>
               </section>
            )}

            <OrderReferenceGrid orderId={order.id} initialImages={initialReferenceImages} readOnly={true} />
         </div>

         <div className="space-y-8">
            <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-border bg-secondary/10">
                  <h2 className="text-xl font-bold text-foreground">Timeline</h2>
               </div>
               <div className="p-8">
                  <div className="relative border-l-2 border-primary/20 ml-3 space-y-10">
                     <div className="relative pl-8">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-primary shadow-sm"></span>
                        <h3 className="text-sm font-bold text-foreground">Commande Créée</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
                     </div>
                     <div className="relative pl-8">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-muted shadow-sm"></span>
                        <h3 className="text-sm font-bold text-muted-foreground">En cours de fabrication</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">En attente</p>
                     </div>
                  </div>
               </div>
            </section>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center shadow-sm">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-primary/10">
                  <span className="material-icons text-primary text-3xl">help_outline</span>
               </div>
               <h3 className="text-lg font-bold text-foreground mb-2">Besoin d&apos;assistance ?</h3>
               <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Si vous avez des questions sur cette commande, contactez notre support.</p>
               <Button variant="outline" className="w-full rounded-xl bg-white border-primary/20 hover:border-primary/50 text-primary" asChild>
                 <a href="mailto:support@malixa.com">Contacter le Support</a>
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
