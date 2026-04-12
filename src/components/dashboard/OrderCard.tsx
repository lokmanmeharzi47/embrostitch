import React from 'react';
import StatusBadge from './StatusBadge';
import Link from 'next/link';

interface OrderCardProps {
  id: string;
  title: string;
  partnerName: string;
  price: string;
  deliveryDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Shipped" | "Queued" | "Final Shipping";
  latestUpdate?: string;
  imageSrc?: string;
}

export default function OrderCard({
  id,
  title,
  partnerName,
  price,
  deliveryDate,
  status,
  latestUpdate,
  imageSrc
}: OrderCardProps) {
  return (
    <Link href={`/orders/${id}`} className="block group">
      <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* Optional Thumbnail */}
          {imageSrc ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-secondary">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg bg-linear-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-center">
               <span className="material-icons text-primary/40 text-3xl">checkroom</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="text-base font-bold text-foreground block truncate group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">by {partnerName}</p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-base font-bold text-foreground">{price}</p>
                <div className="mt-1">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
              <p className="text-muted-foreground flex items-center gap-1.5">
                <span className="material-icons text-base">event</span>
                Est. Delivery: <span className="font-semibold text-foreground">{deliveryDate}</span>
              </p>
              
              {latestUpdate && (
                <p className="text-xs italic text-muted-foreground bg-secondary px-3 py-1.5 rounded-md truncate max-w-sm">
                  &quot;{latestUpdate}&quot;
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
