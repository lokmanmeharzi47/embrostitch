import React from "react";

const steps = [
  {
    number: "01",
    icon: "search",
    title: "Découvrez les Talents",
    description:
      "Parcourez les portfolios détaillés et les avis de couturières expertes dans votre région.",
    color: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
  },
  {
    number: "02",
    icon: "tune",
    title: "Personnalisez & Commandez",
    description:
      "Collaborez directement sur les designs, choisissez les tissus et finalisez vos mesures.",
    color: "from-[#fef3c7] to-[#fef9e7]",
    iconColor: "text-warning",
  },
  {
    number: "03",
    icon: "local_shipping",
    title: "Recevez Votre Pièce",
    description:
      "Votre vêtement sur mesure est méticuleusement confectionné et livré directement chez vous.",
    color: "from-[#d1fae5] to-[#ecfdf5]",
    iconColor: "text-success",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <span className="material-icons text-primary text-sm">
              auto_awesome
            </span>
            <span className="text-xs font-semibold text-primary">
              Processus Simple
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comment Ça Marche
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            De la découverte à la livraison, nous rendons la couture sur mesure
            accessible et simple.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-[2px] bg-linear-to-r from-border to-transparent z-0" />
              )}

              <div className="relative bg-card rounded-2xl border border-border p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Number Badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center mb-5`}
                >
                  <span
                    className={`material-icons ${step.iconColor} text-2xl`}
                  >
                    {step.icon}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
