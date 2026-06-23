import React from "react";
import { Star, MapPin, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ProfessionalCardProps {
  name: string;
  specialty: string;
  description: string;
  rating: number;
  reviewCount: number;
  location?: string;
  isVerified?: boolean;
  imageUrl?: string;
}

export default function ProfessionalCard({
  name,
  specialty,
  description,
  rating,
  reviewCount,
  location = "Alger, Algérie",
  isVerified = true,
  imageUrl = "https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80",
}: ProfessionalCardProps) {
  return (
    <div className="group bg-surface rounded-[20px] border border-border overflow-hidden transition-all duration-400 hover:border-primary/20 hover:shadow-sm">
      {/* Image Area */}
      <div className="relative h-72 w-full overflow-hidden bg-secondary">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        {isVerified && (
          <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm border border-border">
            <CheckCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-serif text-xl text-foreground mb-1 group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-xs font-medium text-primary uppercase tracking-widest">
              {specialty}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              {reviewCount} Reviews
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-secondary-foreground/70 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span className="tracking-wide">{location}</span>
        </div>

        <p className="text-sm text-secondary-foreground leading-relaxed line-clamp-2 mb-6 font-light">
          {description}
        </p>

        <div className="w-full text-center border-t border-border pt-4 text-sm font-medium text-primary uppercase tracking-widest group-hover:text-primary-light transition-colors">
          View Profile
        </div>
      </div>
    </div>
  );
}
