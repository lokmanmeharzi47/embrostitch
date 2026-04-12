import React from "react";

interface TestimonialCardProps {
  quote: string;
  authorName: string;
  role: string;
}

export default function TestimonialCard({
  quote,
  authorName,
  role,
}: TestimonialCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-md">
      {/* Quote Icon */}
      <div className="mb-4">
        <span className="material-icons text-primary/30 text-3xl">
          format_quote
        </span>
      </div>

      {/* Quote Text */}
      <p className="text-sm text-foreground leading-relaxed mb-6 italic">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {authorName.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{authorName}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}
