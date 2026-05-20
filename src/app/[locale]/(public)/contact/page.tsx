import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <span className="material-icons text-[16px]">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
      </div>

      <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
        Contactez-nous
      </h1>
      <p className="text-lg text-muted-foreground mb-10">
        Notre équipe est disponible pour répondre à toutes vos questions.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          {
            icon: 'mail',
            label: 'Email',
            value: 'embrocraftdz@gmail.com',
            href: 'mailto:embrocraftdz@gmail.com',
          },
          {
            icon: 'phone',
            label: 'Téléphone',
            value: '+213 (0) 561 16 71 42',
            href: 'tel:+213561167142',
          },
          {
            icon: 'location_on',
            label: 'Adresse',
            value: 'Alger, Algérie',
            href: undefined,
          },
        ].map(({ icon, label, value, href }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5 text-center">
            <span className="material-icons text-primary text-2xl mb-2 block">{icon}</span>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            {href ? (
              <a href={href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {value}
              </a>
            ) : (
              <p className="text-sm font-medium text-foreground">{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Envoyer un message</h2>
        <form className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Prénom" type="text" placeholder="Amina" required />
            <Input label="Nom" type="text" placeholder="Belkacem" required />
          </div>
          <Input label="Email" type="email" placeholder="nom@exemple.com" required />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message</label>
            <textarea
              placeholder="Décrivez votre demande..."
              rows={5}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              required
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            <span className="material-icons text-sm mr-2">send</span>
            Envoyer le message
          </Button>
        </form>
      </div>
    </main>
  );
}
