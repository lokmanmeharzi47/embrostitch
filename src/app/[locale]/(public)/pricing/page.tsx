import Link from 'next/link';
import Button from '@/components/ui/Button';

const plans = [
  {
    name: 'Client',
    price: 'Gratuit',
    description: 'Pour les clients qui souhaitent commander des créations sur mesure.',
    features: [
      'Accès à toutes les couturières',
      'Messagerie directe',
      'Suivi des commandes en temps réel',
      'Galerie de référence',
      'Avis et notations',
    ],
    cta: 'Créer un compte client',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Créatrice',
    price: '10%',
    period: 'commission par commande',
    description: 'Pour les couturières et artisanes qui souhaitent développer leur activité.',
    features: [
      'Profil professionnel complet',
      'Portfolio de créations',
      'Gestion des commandes',
      'Messagerie intégrée',
      'Statistiques d\'activité',
      'Support prioritaire',
    ],
    cta: 'Devenir couturière',
    href: '/register',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <span className="material-icons text-[16px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
          Tarification simple et transparente
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Aucun abonnement caché. Les clients accèdent gratuitement, les couturières ne paient qu&apos;une commission sur les commandes réalisées.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 ${
              plan.highlighted
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                : 'border-border bg-card'
            }`}
          >
            <h2 className="text-xl font-black text-foreground mb-2">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-foreground">{plan.price}</span>
              {plan.period && (
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <span className="material-icons text-success text-[14px]">check</span>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={plan.href}>
              <Button
                variant={plan.highlighted ? 'primary' : 'outline'}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">
        Des questions sur la tarification ?{' '}
        <Link href="/contact" className="text-primary hover:underline font-medium">
          Contactez-nous
        </Link>
      </p>
    </main>
  );
}
