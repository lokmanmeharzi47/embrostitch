import Link from 'next/link';
import Button from '@/components/ui/Button';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <span className="material-icons text-[16px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      <div className="text-center mb-16">
        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white shadow-lg mx-auto mb-6">
          <Image src="/logoa.png" alt="MALIXA" width={80} height={80} className="object-contain p-2" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
          À propos d&apos;MALIXA
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          La première marketplace de couture artisanale algérienne — connectant créateurs et clients depuis Alger jusqu&apos;à Tamanrasset, et au-delà des frontières.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: '🧵',
            title: 'Notre Mission',
            description: 'Valoriser le savoir-faire artisanal algérien en donnant aux couturières et brodeuses les outils pour développer leur activité à l\'échelle nationale et internationale.',
          },
          {
            icon: '🤝',
            title: 'Notre Vision',
            description: 'Devenir la référence incontournable pour quiconque souhaite porter un vêtement unique, façonné à la main avec amour par des artisanes talentueuses d\'Algérie.',
          },
          {
            icon: '🇩🇿',
            title: 'Notre Engagement',
            description: 'Made in Algeria — chaque création porte l\'empreinte du patrimoine textile algérien, de la broderie kabyle aux costumes traditionnels des 58 wilayas.',
          },
        ].map(({ icon, title, description }) => (
          <div key={title} className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-black text-foreground mb-4">Rejoignez la communauté</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Que vous soyez client à la recherche de la création parfaite, ou couturière souhaitant élargir votre clientèle — MALIXA est fait pour vous.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button variant="primary" size="lg">Créer un compte</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">Nous contacter</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
