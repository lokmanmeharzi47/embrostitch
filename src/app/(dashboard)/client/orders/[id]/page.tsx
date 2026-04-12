import React from 'react';

import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for the order details
  const order = {
    id: params.id || 'ST-4429',
    title: 'Custom Silk Evening Gown',
    status: 'In Workshop',
    professional: 'Elena Vasquez',
    deliveryDate: 'Nov 24, 2023',
    price: '$2,450.00',
    type: 'Bespoke Evening Gown, Floor Length',
    fabric: "Premium Mulberry Silk (Italian Sourced)",
    description: "A custom-tailored floor-length evening gown for a gala event. The design features a delicate cowl neckline, an open back with minimalist silk ties, and a slight mermaid silhouette. The fabric selected is a heavy-weight silk charmeuse in 'Midnight Orchid'. The construction includes a built-in corset for structure and hand-finished hems.",
    timeline: [
      { status: 'Entered Workshop', date: 'Oct 28, 2023 • 09:12 AM', completed: true },
      { status: 'Design Draft Approved', date: 'Oct 24, 2023 • 02:45 PM', completed: true },
      { status: 'Measurements Confirmed', date: 'Oct 19, 2023 • 11:20 AM', completed: true },
      { status: 'Order Placed', date: 'Oct 15, 2023 • 04:30 PM', completed: true },
    ]
  };

  return (
    <>
      
      {/* Breadcrumbs */}
      <div className="mb-4">
         <Link href="/client/orders" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <span className="material-icons text-[16px]">arrow_back</span>
            Back to Orders
         </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{order.title}</h1>
          <div className="flex items-center gap-3">
             <span className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                {order.status}
             </span>
             <span className="text-sm text-muted-foreground font-medium">Order #{order.id}</span>
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
         
         {/* Main Details */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Project Summary */}
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20">
                  <h2 className="text-lg font-bold text-foreground">Project Summary</h2>
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Lead Professional</p>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                           <span className="text-primary font-bold text-[10px]">{order.professional[0]}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{order.professional}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estimated Delivery</p>
                     <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span className="material-icons text-warning text-[16px]">schedule</span>
                        {order.deliveryDate}
                     </p>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Project Price</p>
                     <p className="text-sm font-bold text-foreground">{order.price}</p>
                  </div>
               </div>
            </section>

            {/* Design Details */}
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20">
                  <h2 className="text-lg font-bold text-foreground">Design Details</h2>
               </div>
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Garment Type</p>
                        <p className="text-sm font-medium text-foreground">{order.type}</p>
                     </div>
                     <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fabric Sourcing</p>
                        <p className="text-sm font-medium text-foreground">{order.fabric}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Project Description</p>
                     <p className="text-sm text-foreground leading-relaxed bg-secondary/30 p-4 rounded-lg border border-border/50">
                        {order.description}
                     </p>
                  </div>
               </div>
            </section>

            {/* Inspiration & Files */}
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
                     <div className="aspect-square bg-secondary rounded-lg border border-border relative group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="material-icons text-white">zoom_in</span>
                        </div>
                        <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-medium">Reference 1</span>
                     </div>
                     <div className="aspect-square bg-secondary rounded-lg border border-border relative group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="material-icons text-white">zoom_in</span>
                        </div>
                        <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-medium">Reference 2</span>
                     </div>
                     <div className="aspect-square bg-secondary rounded-lg border border-border relative group cursor-pointer overflow-hidden flex items-center justify-center">
                        <span className="material-icons text-muted-foreground text-3xl">picture_as_pdf</span>
                        <span className="absolute bottom-2 left-2 text-[10px] bg-white border border-border text-foreground px-2 py-0.5 rounded font-medium shadow-sm">Measurements.pdf</span>
                     </div>
                     <div className="aspect-square bg-secondary/30 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors hover:border-primary/50 text-muted-foreground hover:text-primary">
                        <span className="material-icons mb-1 text-[24px]">add_photo_alternate</span>
                        <span className="text-xs font-medium">Add File</span>
                     </div>
                  </div>
               </div>
            </section>

         </div>

         {/* Sidebar / Timeline */}
         <div className="space-y-6">
            
            {/* Order Timeline */}
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-border bg-secondary/20">
                  <h2 className="text-lg font-bold text-foreground">Order Timeline</h2>
               </div>
               <div className="p-6">
                  <div className="relative border-l-2 border-secondary ml-3 space-y-8">
                     {order.timeline.map((step, index) => (
                        <div key={index} className="relative pl-6">
                           <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${index === 0 ? 'bg-primary' : 'bg-success'}`}>
                              {index !== 0 && <span className="material-icons text-[10px] text-white">check</span>}
                           </span>
                           <h3 className={`text-sm font-bold ${index === 0 ? 'text-primary' : 'text-foreground'}`}>{step.status}</h3>
                           <p className="text-xs text-muted-foreground mt-1 font-medium">{step.date}</p>
                        </div>
                     ))}
                     
                     {/* Future Step Example */}
                     <div className="relative pl-6 opacity-40">
                        <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-secondary"></span>
                        <h3 className="text-sm font-bold text-muted-foreground">Quality Check & Shipping</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Pending completion</p>
                     </div>
                  </div>
               </div>
            </section>

            {/* Support Widget */}
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
