import React from "react";

interface ProfessionalCardProps {
  name: string;
  specialty: string;
  description: string;
  rating: number;
  reviewCount: number;
  imagePlaceholder?: string;
}

export default function ProfessionalCard({
  name,
  specialty,
  description,
  rating,
  reviewCount,
  imagePlaceholder,
}: ProfessionalCardProps) {
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image Area */}
      <div className="relative h-56 bg-linear-to-br from-secondary to-[#e0deff] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-icons text-primary text-4xl">person</span>
          </div>
        </div>
        {imagePlaceholder && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-semibold text-primary">
            {specialty}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <div className="flex items-center gap-1">
            <span className="material-icons text-warning text-base">star</span>
            <span className="text-sm font-semibold text-foreground">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        </div>
        <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
          {specialty}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
