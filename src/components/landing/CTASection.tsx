import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section className="py-24 bg-linear-to-br from-primary to-primary-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Prête à Créer Quelque Chose de Magnifique ?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          Rejoignez des milliers de clients et couturières qui redéfinissent la
          mode sur mesure. Votre pièce parfaite est à portée de main.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Commencer Gratuitement
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="ghost"
              size="lg"
              className="text-white border border-white/30 hover:bg-white/10"
            >
              En Savoir Plus
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
