import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
  imageSrc = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop",
  imageAlt = "Fashion design process",
  quote = "The difference between ordinary and extraordinary is that little extra.",
  author = "Jimmy Johnson",
}: {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  quote?: string;
  author?: string;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              EmbroCraft<span className="text-primary">DZ</span>
            </span>
          </Link>

          {children}

          {/* Footer Links */}
          <div className="mt-16 flex items-center justify-between text-xs text-muted-foreground">
            <p>© 2026 EmbroCraftDZ</p>
            <div className="flex gap-4">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:block relative w-0 flex-1 bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={imageSrc}
          alt={imageAlt}
        />
        <div className="absolute inset-0 bg-primary/20 bg-linear-to-t from-primary/80 to-transparent mix-blend-multiply" />

        {/* Testimonial/Quote Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="max-w-xl">
            <span className="material-icons text-white/50 text-4xl mb-4">format_quote</span>
            <p className="text-2xl font-medium leading-relaxed mb-6">
              &quot;{quote}&quot;
            </p>
            <p className="font-semibold">{author}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
