import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Zap, Crown, Users, Shield, Headphones } from 'lucide-react';

export default function Prijzen() {
  const plans = [
    {
      name: "Starter",
      price: "€49",
      period: "/maand",
      description: "Perfect voor individuele fysiotherapeuten",
      icon: Star,
      popular: false,
      features: [
        "Tot 100 AI-documentaties per maand",
        "Basis diagnosecode herkenning",
        "SmartMail integratie",
        "Standaard ondersteuning",
        "1 gebruiker",
        "Basis rapportage"
      ]
    },
    {
      name: "Professional",
      price: "€99",
      period: "/maand",
      description: "Ideaal voor groeiende praktijken",
      icon: Zap,
      popular: true,
      features: [
        "Tot 500 AI-documentaties per maand",
        "Geavanceerde diagnosecode herkenning",
        "Volledige SmartMail suite",
        "Priority ondersteuning",
        "Tot 5 gebruikers",
        "Uitgebreide analytics",
        "API toegang",
        "Aangepaste templates"
      ]
    },
    {
      name: "Enterprise",
      price: "Op maat",
      period: "",
      description: "Voor grote praktijken en ketens",
      icon: Crown,
      popular: false,
      features: [
        "Onbeperkte AI-documentaties",
        "Aangepaste AI-modellen",
        "Volledige integratie suite",
        "24/7 dedicated support",
        "Onbeperkte gebruikers",
        "Advanced security features",
        "SSO integratie",
        "Maandelijkse consultatie"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-hysio-off-white">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-mint via-hysio-off-white to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-hysio-deep-green mb-6">
              Prijzen & Abonnementen
            </h1>
            <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
              Kies het abonnement dat het beste past bij uw praktijk.
              Start met een gratis proefperiode van 14 dagen.
            </p>
            <div className="inline-flex items-center gap-2 bg-hysio-mint/20 rounded-full px-4 py-2">
              <Shield className="h-5 w-5 text-hysio-deep-green" />
              <span className="text-hysio-deep-green font-medium">14 dagen gratis proberen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <Card
                    key={plan.name}
                    className={`relative border-2 shadow-lg transition-all hover:shadow-xl ${
                      plan.popular
                        ? 'border-hysio-mint bg-white scale-105'
                        : 'border-hysio-mint/20 bg-white hover:border-hysio-mint/40'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-hysio-mint text-hysio-deep-green px-4 py-1 rounded-full text-sm font-semibold">
                          Populairste keuze
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-6">
                      <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-full ${
                          plan.popular ? 'bg-hysio-mint/20' : 'bg-hysio-mint/10'
                        }`}>
                          <IconComponent className="h-8 w-8 text-hysio-deep-green" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-hysio-deep-green mb-2">
                        {plan.name}
                      </CardTitle>
                      <div className="mb-3">
                        <span className="text-4xl font-bold text-hysio-deep-green">{plan.price}</span>
                        <span className="text-hysio-deep-green/60">{plan.period}</span>
                      </div>
                      <p className="text-hysio-deep-green/70">{plan.description}</p>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-hysio-mint-dark mt-0.5 flex-shrink-0" />
                            <span className="text-hysio-deep-green/80">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green'
                            : 'bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white'
                        }`}
                        size="lg"
                      >
                        {plan.name === 'Enterprise' ? 'Contact Opnemen' : 'Start Gratis Proefperiode'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Overzicht */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-12">
              Wat u krijgt met elk abonnement
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Veiligheid & Privacy</h3>
                <p className="text-hysio-deep-green/70">
                  AVG-compliant, end-to-end encryptie en veilige Nederlandse servers.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Headphones className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Nederlandse Ondersteuning</h3>
                <p className="text-hysio-deep-green/70">
                  Lokale support van experts die fysiotherapie begrijpen.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Training & Implementatie</h3>
                <p className="text-hysio-deep-green/70">
                  Persoonlijke onboarding en training voor uw hele team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-12">
              Veelgestelde Vragen
            </h2>
            <div className="space-y-6">
              <Card className="border-hysio-mint/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-hysio-deep-green mb-2">
                    Kan ik altijd upgraden of downgraden?
                  </h3>
                  <p className="text-hysio-deep-green/70">
                    Ja, u kunt altijd van abonnement wisselen. Wijzigingen gaan in bij de volgende factuurperiode.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-hysio-deep-green mb-2">
                    Wat gebeurt er na de gratis proefperiode?
                  </h3>
                  <p className="text-hysio-deep-green/70">
                    Na 14 dagen kunt u kiezen voor een betaald abonnement. Geen automatische facturering.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-hysio-deep-green mb-2">
                    Is er een setup fee of implementatiekosten?
                  </h3>
                  <p className="text-hysio-deep-green/70">
                    Nee, alle abonnementen zijn inclusief onboarding en implementatie. Geen verborgen kosten.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-hysio-mint/20 via-hysio-off-white to-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-hysio-deep-green mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-hysio-deep-green/80 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met uw gratis proefperiode en ervaar hoe Hysio
            uw fysiotherapiepraktijk kan transformeren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-8 py-3"
            >
              Start Gratis Proefperiode
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white px-8 py-3"
            >
              Plan een Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hysio-deep-green text-white py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-8 bg-hysio-mint rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold">H</span>
              </div>
              <span className="text-2xl font-bold">Hysio</span>
            </div>
            <p className="text-white/80 mb-6">
              Intelligente fysiotherapie-oplossingen voor de moderne praktijk.
            </p>
            <div className="text-white/60 text-sm">
              © 2024 Hysio. Alle rechten voorbehouden.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}