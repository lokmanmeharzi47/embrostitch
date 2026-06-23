import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <span className="material-icons text-[16px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
        Politique de confidentialité
      </h1>
      <p className="text-muted-foreground mb-8">Dernière mise à jour : mai 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-bold mb-3">1. Collecte des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            MALIXA collecte des informations personnelles que vous nous fournissez directement lors de la création de votre compte (nom, email, rôle) et lors de l&apos;utilisation de nos services (commandes, messages, avis).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">2. Utilisation des données</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vos données sont utilisées pour fournir et améliorer nos services, communiquer avec vous concernant vos commandes, et assurer la sécurité de la plateforme. Nous ne vendons jamais vos données personnelles à des tiers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">3. Sécurité</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vos données sont stockées de manière sécurisée via Supabase avec chiffrement au repos et en transit. L&apos;authentification est gérée par des protocoles OAuth2 et JWT standards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">4. Vos droits</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conformément aux réglementations en vigueur, vous avez le droit d&apos;accéder à vos données, de les rectifier ou de demander leur suppression. Contactez-nous à{' '}
            <a href="mailto:malixa@gmail.com" className="text-primary hover:underline font-medium">
              malixa@gmail.com
            </a>{' '}
            pour exercer ces droits.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Nous utilisons des cookies essentiels pour maintenir votre session connectée et améliorer votre expérience. Aucun cookie publicitaire tiers n&apos;est utilisé.
          </p>
        </section>
      </div>
    </main>
  );
}
