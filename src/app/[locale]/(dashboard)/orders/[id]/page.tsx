import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Badge } from "@/components/ui/Badge";
import { Clock, ShoppingBag, MessageSquare, ChevronLeft, Download, FileText } from "lucide-react";

export default async function SharedOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch current user profile for the layout role
  const { data: authProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!authProfile) redirect("/login");

  // Fetch Order with Professional and Client details
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      professional:profiles!orders_creator_id_fkey (id, first_name, last_name, avatar_url),
      client:profiles!orders_client_id_fkey (id, first_name, last_name, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  // Check if current user is allowed to see this order
  const isCreator = user.id === order.creator_id;
  const isClient = user.id === order.client_id;
  
  if (!isCreator && !isClient && authProfile.role !== "admin") {
     redirect("/login");
  }

  // Fetch references
  const { data: references } = await supabase
    .from("references")
    .select("*")
    .eq("order_id", id);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const partner = isClient ? order.professional : order.client;

  return (
    <DashboardLayout userRole={authProfile.role as any}>
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
          {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
         <Link 
            href={isClient ? "/client/orders" : "/creator/orders"} 
            className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
         >
            <ChevronLeft size={16} />
            Back to Orders
         </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{order.title}</h1>
            <Badge className={`capitalize border ${statusColors[order.status] || "bg-muted"}`}>
               {order.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
             <span>Order ID: <span className="text-foreground">#{order.id.slice(0, 8)}</span></span>
             <span>•</span>
             <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
           <Button variant="outline" className="bg-white gap-2 rounded-xl">
             <Download size={18} />
             Download Invoice
           </Button>
           <Link href={`/messages?orderId=${order.id}`}>
            <Button variant="primary" className="gap-2 rounded-xl">
                <MessageSquare size={18} />
                Message {isClient ? "Artisan" : "Client"}
            </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Project Overview */}
            <section className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden bg-white">
               <div className="p-6 border-b border-border bg-slate-50/50">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <ShoppingBag size={18} className="text-primary" />
                    Project Overview
                  </h2>
               </div>
               <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Partner</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden relative border-2 border-white">
                            {partner.avatar_url ? (
                                <img src={partner.avatar_url} alt={partner.first_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-primary font-bold">{partner.first_name[0]}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground leading-none">{partner.first_name} {partner.last_name}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">{isClient ? "Artisan" : "Client"}</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Est. Delivery</p>
                     <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "Flexible"}
                     </p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Budget / Price</p>
                     <p className="text-xl font-black text-primary">{order.price?.toLocaleString()} DZD</p>
                  </div>
               </div>
               
               <div className="px-8 pb-8">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Project Requirement</p>
                     <p className="text-sm leading-relaxed text-slate-700">
                        {order.description || "No detailed description provided."}
                     </p>
                  </div>
               </div>
            </section>

            {/* Inspiration Gallery */}
            <section className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden bg-white">
               <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <FileText size={18} className="text-primary" />
                    Design References
                  </h2>
               </div>
               <div className="p-8">
                  {references && references.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {references.map((ref, idx) => (
                           <div key={ref.id} className="group aspect-square relative rounded-2xl overflow-hidden border border-border bg-slate-50 cursor-pointer">
                                <img src={ref.file_url} alt="Reference" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-icons text-white">zoom_in</span>
                                </div>
                           </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-muted-foreground text-sm font-medium italic text-balance px-4">No reference images or documents attached to this order.</p>
                    </div>
                  )}
               </div>
            </section>
         </div>

         {/* Sidebar Area */}
         <div className="space-y-6 text-balance">
            {/* Timeline */}
            <section className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden bg-white px-2">
               <div className="p-6 border-b border-border bg-slate-50/50">
                  <h2 className="text-lg font-bold text-foreground">Activity Timeline</h2>
               </div>
               <div className="p-8">
                  <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                        <div className="relative pl-8">
                           <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-sm" />
                           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                           <h3 className="text-sm font-black text-foreground mt-1">Order Initiated</h3>
                           <p className="text-xs text-muted-foreground mt-1 leading-relaxed">The project vision was submitted for review.</p>
                        </div>
                        {order.status === 'completed' && (
                             <div className="relative pl-8">
                                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white bg-emerald-500 shadow-sm" />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
                                <h3 className="text-sm font-black text-foreground mt-1">Final Handover</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Artisan marked the order as finished.</p>
                             </div>
                        )}
                        <div className="relative pl-8 opacity-40">
                           <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white bg-slate-200" />
                           <h3 className="text-sm font-black text-slate-400 mt-1 italic">Future Update Pending</h3>
                        </div>
                  </div>
               </div>
            </section>

            {/* Need Help CTA */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <span className="material-icons">help_outline</span>
                 </div>
                 <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
                 <p className="text-indigo-100 text-xs mb-8 leading-relaxed font-medium">If you have concerns about the craftsmanship or delivery timeline, our concierge team is on standby.</p>
                 <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl">Contact Concierge</Button>
            </div>
         </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
