import React from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <>
      <main className="flex-1 flex items-center justify-center p-6 pt-12 pb-24 w-full">
         <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            
            {/* Header Success Banner */}
            <div className="bg-primary/5 p-8 text-center border-b border-border relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-success/5">
                     <span className="material-icons text-success text-4xl">check_circle</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Your order is being processed!</h1>
                  <p className="text-muted-foreground font-medium bg-background px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-border">
                     Order #SM-829341 <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span> October 24, 2023
                  </p>
               </div>
            </div>

            {/* Order Details */}
            <div className="p-8">
               <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-2">Custom Tailored Italian Wool Suit</h2>
                  <p className="text-muted-foreground leading-relaxed">
                     A bespoke three-piece suit crafted from Super 150s Italian wool in Midnight Navy. Tailored specifically to your submitted measurements.
                  </p>
               </div>

               {/* Next Steps Timeline */}
               <div className="bg-secondary/20 rounded-xl p-6 border border-border/50 mb-8">
                  <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
                     <span className="material-icons text-primary text-[20px]">directions_walk</span>
                     Next Steps
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-border before:via-border/50 before:to-transparent">
                     <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                           <span className="text-xs font-bold">1</span>
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] pb-6 pt-1 md:pb-0 md:pt-0 pl-4 md:pl-0 md:group-odd:pr-8 md:group-even:pl-8">
                           <h4 className="font-bold text-foreground text-sm mb-1">Review</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed">Elena will review your measurements and design choices within 24 hours.</p>
                        </div>
                     </div>
                     <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary bg-background text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                           <span className="text-xs font-bold">2</span>
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] pb-6 pt-1 md:pb-0 md:pt-0 pl-4 md:pl-0 md:group-odd:pr-8 md:group-even:pl-8">
                           <h4 className="font-bold text-foreground text-sm mb-1">Fabric Sourcing</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed">Premium materials will be prepared for the cutting table.</p>
                        </div>
                     </div>
                     <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-border bg-background text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                           <span className="text-xs font-bold">3</span>
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] pl-4 md:pl-0 md:group-odd:pr-8 md:group-even:pl-8">
                           <h4 className="font-bold text-muted-foreground text-sm mb-1">Messaging</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed">Feel free to reach out to Elena at any time during the process.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Professional Info */}
               <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        ER
                     </div>
                     <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Your Tailor</p>
                        <p className="font-bold text-foreground">Elena Rossi</p>
                        <p className="text-[10px] text-success font-medium flex items-center gap-1 mt-0.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Typical response: 1 hour
                        </p>
                     </div>
                  </div>
                  <Button variant="outline" className="bg-white">Message</Button>
               </div>

               {/* Footer Links */}
               <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                  <Link href="/dashboard/client" className="w-full sm:w-auto">
                     <Button variant="default" className="w-full">Track Order Status</Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center sm:text-right">
                     Need help with your order? <br className="sm:hidden" />
                     <Link href="#" className="font-bold text-primary hover:underline">Contact StitchMarket Support</Link>
                  </p>
               </div>

            </div>
         </div>
      </main>
    </>
  );
}
