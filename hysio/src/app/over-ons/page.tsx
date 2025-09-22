import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Award, Shield, Lightbulb } from 'lucide-react';

export default function OverOns() {
  return (
    <div className="min-h-screen bg-hysio-mint">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-mint to-hysio-mint/80">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-hysio-deep-green mb-6">
              Over Hysio
            </h1>
            <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
              Wij transformeren de fysiotherapie met AI-technologie die proven resultaten levert.
              Onze missie: fysiotherapeuten meer tijd geven voor patiëntenzorg door administratieve
              lasten te elimineren en behandelkwaliteit meetbaar te verbeteren.
            </p>
            <Button
              size="lg"
              className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-8 py-3"
            >
              Ontdek onze missie
            </Button>
          </div>
        </div>
      </section>

      {/* Onze Missie en Visie */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <Card className="border-hysio-mint/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-hysio-mint/20 rounded-lg">
                      <Target className="h-6 w-6 text-hysio-deep-green" />
                    </div>
                    <CardTitle className="text-2xl text-hysio-deep-green">Onze Missie</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-hysio-deep-green/80 leading-relaxed">
                    Hysio vermindert administratietijd met 70% en verbetert behandelkwaliteit
                    door evidence-based AI-ondersteuning. We stellen fysiotherapeuten in staat
                    zich te focussen op wat zij het beste doen: excellente patiëntenzorg leveren.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-hysio-mint/20 rounded-lg">
                      <Lightbulb className="h-6 w-6 text-hysio-deep-green" />
                    </div>
                    <CardTitle className="text-2xl text-hysio-deep-green">Onze Visie</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-hysio-deep-green/80 leading-relaxed">
                    Een fysiotherapie-ecosysteem waarin AI naadloos integreert met klinische
                    expertise, waar administratie automatisch gebeurt en waar elke behandelbeslissing
                    ondersteund wordt door de nieuwste evidence en data-inzichten.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Onze Waarden */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-12">
              Onze Kernwaarden
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Zorgvuldigheid</h3>
                <p className="text-hysio-deep-green/70">
                  Evidence-based ontwikkeling en klinische validatie vormen de basis
                  van elke functionaliteit die we creëren.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Betrouwbaarheid</h3>
                <p className="text-hysio-deep-green/70">
                  ISO 27001 gecertificeerde beveiliging en AVG-compliance
                  garanderen absolute vertrouwelijkheid van patiëntdata.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Excellentie</h3>
                <p className="text-hysio-deep-green/70">
                  We streven naar de hoogste standaarden in zowel technologie als service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ons Team */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-12">
              Het Team Achter Hysio
            </h2>
            <div className="text-center">
              <div className="inline-flex items-center gap-3 p-6 bg-hysio-mint/10 rounded-lg">
                <Users className="h-12 w-12 text-hysio-deep-green" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-hysio-deep-green">Multidisciplinair Team</h3>
                  <p className="text-hysio-deep-green/70">
                    Klinische fysiotherapeuten, AI-researchers en software engineers
                    werken dagelijks samen aan evidence-based innovaties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-hysio-deep-green mb-6">
            Klaar om Hysio te proberen?
          </h2>
          <p className="text-xl text-hysio-deep-green/80 mb-8 max-w-2xl mx-auto">
            Sluit u aan bij 2.500+ fysiotherapeuten die al profiteren van Hysio.
            Ervaar zelf hoe 70% minder administratie en betere behandelresultaten uw praktijk transformeren.
          </p>
          <Button
            size="lg"
            className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-8 py-3"
          >
            Start Gratis Proefperiode
          </Button>
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