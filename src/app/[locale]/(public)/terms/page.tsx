import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <span className="material-icons text-[16px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
        Conditions d&apos;utilisation
      </h1>
      <p className="text-muted-foreground mb-8">Dernière mise à jour : mai 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Acceptation des conditions</h2>
          <p className="text-muted-foreground leading-relaxed">
            En accédant à et en utilisant la plateforme MALIXA, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Description du service</h2>
          <p className="text-muted-foreground leading-relaxed">
            MALIXA est une marketplace algérienne mettant en relation des clients avec des couturières et artisans spécialisés dans la création de vêtements sur mesure et la broderie artisanale.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Comptes utilisateurs</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vous êtes responsable du maintien de la confidentialité de votre compte et de votre mot de passe. Vous acceptez de notifier immédiatement MALIXA de toute utilisation non autorisée de votre compte.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Commandes et paiements</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les commandes passées sur MALIXA constituent un accord contraignant entre le client et la couturière. MALIXA agit en tant qu&apos;intermédiaire et n&apos;est pas responsable de la qualité finale des créations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Pour toute question concernant ces conditions, veuillez nous contacter à{' '}
            <a href="mailto:malixa@gmail.com" className="text-primary hover:underline font-medium">
              malixa@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
