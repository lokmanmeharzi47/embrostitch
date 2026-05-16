"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <span className="text-6xl mb-4">⚠️</span>
      <h1 className="text-2xl font-bold text-foreground mb-2">Quelque chose s&apos;est mal passé</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Une erreur inattendue s&apos;est produite. Veuillez réessayer ou contacter le support.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition"
      >
        Réessayer
      </button>
    </div>
  );
}
