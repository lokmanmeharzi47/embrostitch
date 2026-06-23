import Link from "next/link"
import Button from "@/components/ui/Button"

export default function HowItWorksPage() {
  return (
    <>
      <main className="pt-12 pb-16 w-full">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            Comment ça marche
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Découvrez comment MALIXA connecte l'artisanat traditionnel avec les besoins de confection sur mesure.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Trouvez votre couturière</h3>
              <p className="text-muted-foreground">Parcourez nos portfolios d'artisans vérifiés et trouvez le profil de couturière qui correspond à vos besoins de confection.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Discutez et commandez</h3>
              <p className="text-muted-foreground">Communiquez directement via notre messagerie intégrée pour discuter des détails, des mesures, et finaliser la commande.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Recevez votre commande</h3>
              <p className="text-muted-foreground">Suivez la progression de votre pièce et recevez votre création unique directement chez vous en toute sécurité.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/register">
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
