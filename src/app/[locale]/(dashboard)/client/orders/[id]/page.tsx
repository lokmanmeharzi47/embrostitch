import React from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Or redirect
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      couturiere:profiles!orders_couturiere_id_fkey (*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    console.error("Order fetch error:", error);
    notFound();
  }

  const professionalName = order.couturiere 
    ? `${order.couturiere.first_name} ${order.couturiere.last_name}`
    : 'Unknown Professional';

  // Hardcoded type and fabric for now as they are not in the schema
  const type = 'Custom Garment';
  const fabric = 'Selected by creator';

  return (
    <>
      <div className="mb-4">
         <Link href="/client/orders" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <span className="material-icons text-[16px]">arrow_back</span>
            Back to Orders
         </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{order.title}</h1>
          <div className="flex items-center gap-3">
             <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                {order.status}
             </span>
             <span className="text-sm text-muted-foreground font-medium">Order #{order.id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <Button variant="outline" className="bg-white">
             <span className="material-icons text-sm mr-2">receipt_long</span>
             Invoice
           </Button>
           <Button variant="primary">
             <span className="material-icons text-sm mr-2">chat</span>
             Message Creator
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20">
                  <h2 className="text-lg font-bold text-foreground">Project Summary</h2>
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Lead Professional</p>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                           <span className="text-primary font-bold text-[10px]">{professionalName.charAt(0)}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{professionalName}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estimated Delivery</p>
                     <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span className="material-icons text-warning text-[16px]">schedule</span>
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}
                     </p>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Project Price</p>
                     <p className="text-sm font-bold text-foreground">${order.price}</p>
                  </div>
               </div>
            </section>

            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20">
                  <h2 className="text-lg font-bold text-foreground">Design Details</h2>
               </div>
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Garment Type</p>
                        <p className="text-sm font-medium text-foreground">{type}</p>
                     </div>
                     <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fabric Sourcing</p>
                        <p className="text-sm font-medium text-foreground">{fabric}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Project Description</p>
                     <p className="text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-lg border border-border/50">
                        {order.description || 'No description provided.'}
                     </p>
                  </div>
               </div>
            </section>

            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Inspiration & Files</h2>
                  <Button variant="outline" size="sm" className="bg-white text-xs h-8">
                     <span className="material-icons text-[16px] mr-1">upload</span>
                     Upload New
                  </Button>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-wrap">
                     {order.images?.map((img: string, i: number) => (
                       <div key={i} className="aspect-square bg-secondary rounded-lg border border-border relative group cursor-pointer overflow-hidden">
                          <img src={img} alt={`Reference ${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="material-icons text-white">zoom_in</span>
                          </div>
                       </div>
                     ))}
                     <div className="aspect-square bg-secondary/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors hover:border-primary/50 text-muted-foreground hover:text-primary">
                        <span className="material-icons mb-1 text-[24px]">add_photo_alternate</span>
                        <span className="text-xs font-medium">Add File</span>
                     </div>
                  </div>
               </div>
            </section>
         </div>

         <div className="space-y-6">
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20">
                  <h2 className="text-lg font-bold text-foreground">Order Timeline</h2>
               </div>
               <div className="p-6">
                  <div className="relative border-l-2 border-secondary ml-3 space-y-8">
                     <div className="relative pl-6">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-primary"></span>
                        <h3 className="text-sm font-bold text-primary">Order Created</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                     </div>
                     <div className="relative pl-6 opacity-40">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-secondary"></span>
                        <h3 className="text-sm font-bold text-muted-foreground">Quality Check & Shipping</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Pending completion</p>
                     </div>
                  </div>
               </div>
            </section>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center shadow-sm">
               <span className="material-icons text-primary text-3xl mb-3">support_agent</span>
               <h3 className="font-bold text-foreground mb-1">Need help?</h3>
               <p className="text-sm text-muted-foreground mb-4">Have questions about your design or timeline? Our support team is here to assist.</p>
               <Button variant="outline" className="w-full bg-white text-primary border-primary">Contact Support</Button>
            </div>
         </div>
      </div>
    </>
  );
}
