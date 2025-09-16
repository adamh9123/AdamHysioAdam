import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Award, Shield, Lightbulb } from 'lucide-react';

export default function OverOns() {
  return (
    <div className="min-h-screen bg-hysio-off-white">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-mint via-hysio-off-white to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-hysio-deep-green mb-6">
              Over Hysio
            </h1>
            <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
              Wij revolutioneren de fysiotherapie door middel van intelligente technologie.
              Ons doel is fysiotherapeuten te ondersteunen met AI-gedreven tools die tijd besparen
              en de kwaliteit van zorg verbeteren.
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
      <section className="py-16">
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
                    Hysio maakt fysiotherapie efficiënter en effectiever door AI-technologie.
                    We helpen therapeuten meer tijd te besteden aan wat echt telt:
                    de behandeling en begeleiding van patiënten.
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
                    Een toekomst waarin elke fysiotherapeut beschikt over intelligente tools
                    die administratieve lasten verminderen en de kwaliteit van patiëntenzorg
                    naar een hoger niveau tillen.
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
                  Kwaliteit en nauwkeurigheid staan centraal in alles wat we ontwikkelen.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Betrouwbaarheid</h3>
                <p className="text-hysio-deep-green/70">
                  Privacy en veiligheid van patiëntgegevens zijn ononderhandelbaar voor ons.
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
      <section className="py-16">
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
                    Fysiotherapeuten, developers en AI-specialisten werken samen aan innovatieve oplossingen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-hysio-mint/20 via-hysio-off-white to-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-hysio-deep-green mb-6">
            Klaar om Hysio te proberen?
          </h2>
          <p className="text-xl text-hysio-deep-green/80 mb-8 max-w-2xl mx-auto">
            Ontdek hoe onze AI-tools uw fysiotherapiepraktijk kunnen transformeren.
            Start vandaag nog met een gratis proefperiode.
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