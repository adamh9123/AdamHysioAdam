import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, CheckCircle, Timer, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Documentatie-Workflow Optimaliseren: Van 30 naar 5 Minuten per Patiënt | Hysio Blog',
  description: 'Praktische tips en strategieën om uw documentatieproces drastisch te verkorten zonder kwaliteitsverlies, met real-world voorbeelden uit Nederlandse praktijken.',
  keywords: 'fysiotherapie documentatie, workflow optimalisatie, praktijkefficiëntie, SOAP notities, patiëntendossier',
};

export default function BlogPost() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-hysio-off-white">
      <MarketingNavigation />

      {/* Breadcrumb */}
      <section className="py-6 bg-white border-b border-hysio-mint/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-hysio-deep-green hover:text-hysio-mint-dark transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Terug naar Blog</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Article Header */}
      <section className="py-12 bg-gradient-to-br from-hysio-mint/10 via-hysio-off-white to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="px-3 py-1 bg-hysio-mint/20 text-hysio-deep-green text-sm font-medium rounded-full">
                Praktijkmanagement
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-hysio-deep-green mb-6 leading-tight">
              Documentatie-Workflow Optimaliseren: Van 30 naar 5 Minuten per Patiënt
            </h1>

            <div className="flex items-center gap-6 text-hysio-deep-green/60 mb-8">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Mark Jansen, Fysiotherapeut</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate('2024-01-08')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>7 min leestijd</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Delen
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="h-4 w-4" />
                Bewaren
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg max-w-none">
              <div className="text-hysio-deep-green/80 space-y-6 text-lg leading-relaxed">
                <p className="text-xl text-hysio-deep-green font-medium mb-8">
                  Als fysiotherapeut met 12 jaar ervaring heb ik een dramatische transformatie meegemaakt in mijn praktijk.
                  Door slimme workflow optimalisatie ben ik erin geslaagd om mijn documentatietijd te reduceren van
                  gemiddeld 30 minuten naar slechts 5 minuten per patiënt - zonder kwaliteitsverlies.
                </p>

                <Card className="my-8 border-hysio-mint/20 bg-hysio-mint/5">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <Timer className="h-8 w-8 text-hysio-deep-green" />
                        </div>
                        <div className="text-2xl font-bold text-hysio-deep-green">5 min</div>
                        <div className="text-hysio-deep-green/70 text-sm">Per patiënt documentatie</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="h-8 w-8 text-hysio-deep-green" />
                        </div>
                        <div className="text-2xl font-bold text-hysio-deep-green">83%</div>
                        <div className="text-hysio-deep-green/70 text-sm">Tijdsbesparing behaald</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="h-8 w-8 text-hysio-deep-green" />
                        </div>
                        <div className="text-2xl font-bold text-hysio-deep-green">100%</div>
                        <div className="text-hysio-deep-green/70 text-sm">Kwaliteitsbehoud</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  De Realiteit van Documentatie in de Fysiotherapie
                </h2>

                <p>
                  Laat ik eerlijk zijn: documentatie was lange tijd mijn minst favoriete onderdeel van het vak.
                  Na elke behandelsessie zat ik 20-30 minuten achter mijn computer om SOAP-notities uit te werken,
                  behandelplannen bij te werken en correspondentie af te handelen.
                </p>

                <p>
                  Bij 8 patiënten per dag betekende dit 4 uur aan pure administratie. Tijd die ik liever besteedde
                  aan patiëntenzorg, bijscholing, of - eerlijk gezegd - aan mijn gezin. Toen ik besefte dat ik meer
                  tijd besteedde aan documentatie dan aan daadwerkelijke behandeling, wist ik dat er iets moest veranderen.
                </p>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Fase 1: Analyse van de Huidige Workflow
                </h2>

                <p>
                  De eerste stap was een eerlijke analyse van waar mijn tijd naartoe ging. Ik hield een week lang
                  minutieus bij wat ik deed tijdens documentatie:
                </p>

                <Card className="my-8 border-hysio-mint/20 bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-hysio-deep-green mb-4">
                      📊 Tijdsbesteding Analyse (voor optimalisatie)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Behandelnotities uitwerken</span>
                        <span className="font-semibold">12 minuten</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>SOAP-structuur toepassen</span>
                        <span className="font-semibold">8 minuten</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Behandelplan bijwerken</span>
                        <span className="font-semibold">6 minuten</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Correspondentie/communicatie</span>
                        <span className="font-semibold">4 minuten</span>
                      </div>
                      <hr className="border-hysio-mint/20" />
                      <div className="flex justify-between items-center font-bold text-hysio-deep-green">
                        <span>Totaal per patiënt</span>
                        <span>30 minuten</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Fase 2: Strategische Optimalisatie
                </h2>

                <p>
                  Met deze data ontwikkelde ik een systematische aanpak voor workflow optimalisatie.
                  Hier zijn de drie pijlers die de grootste impact hadden:
                </p>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  1. Realtime Documentatie met Spraakherkenning
                </h3>

                <p>
                  De grootste doorbraak kwam met de implementatie van AI-ondersteunde spraakherkenning.
                  In plaats van notities maken tijdens de behandeling en deze achteraf uit te werken,
                  begon ik direct te spreken tegen mijn documentatiesysteem.
                </p>

                <Card className="my-6 border-hysio-mint/20 bg-hysio-mint/5">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-hysio-deep-green mb-2">💡 Praktijktip</h4>
                    <p className="text-hysio-deep-green/80 text-sm">
                      "Patiënt toont verbetering in flexie schouder, van 90 naar 120 graden.
                      Pijn gedaald van 7 naar 4 op VAS-schaal. Volgende sessie focus op rotatiekracht."
                      Dit wordt automatisch omgezet naar een gestructureerde SOAP-notitie.
                    </p>
                  </CardContent>
                </Card>

                <p><strong>Resultaat:</strong> Besparing van 12 minuten per patiënt door eliminiatie van handmatige uitwerking.</p>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  2. Geautomatiseerde SOAP-Structurering
                </h3>

                <p>
                  Het handmatig structureren van informatie in het SOAP-format kostte me veel tijd.
                  Door gebruik te maken van AI-tools die automatisch herkennen wat subjectieve klachten,
                  objectieve bevindingen, assessments en plannen zijn, viel deze stap vrijwel weg.
                </p>

                <p>
                  <strong>Voorbeeld transformatie:</strong>
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-red-700 mb-2">❌ Vroeger (8 minuten)</h4>
                      <div className="text-sm text-red-600">
                        <p>Handmatig categoriseren van:</p>
                        <ul className="list-disc pl-4 mt-2">
                          <li>Patiëntuitspraken → S</li>
                          <li>Metingen → O</li>
                          <li>Interpretatie → A</li>
                          <li>Behandelplan → P</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-green-700 mb-2">✅ Nu (automatisch)</h4>
                      <div className="text-sm text-green-600">
                        <p>AI herkent automatisch:</p>
                        <ul className="list-disc pl-4 mt-2">
                          <li>"Pijn minder" → Subjectief</li>
                          <li>"120° flexie" → Objectief</li>
                          <li>"Goede vooruitgang" → Assessment</li>
                          <li>"Volgende week..." → Plan</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  3. Slimme Templates en Voorspelling
                </h3>

                <p>
                  Voor terugkerende behandelingen ontwikkelde ik slimme templates die automatisch
                  suggesties doen op basis van eerdere sessies en behandelprotocollen.
                </p>

                <ul className="list-disc pl-6 space-y-2 text-hysio-deep-green/80">
                  <li><strong>Progressie tracking:</strong> Automatische vergelijking met vorige metingen</li>
                  <li><strong>Protocollen:</strong> Voorgestelde oefeningen gebaseerd op diagnose</li>
                  <li><strong>Communicatie:</strong> Gegenereerde updates voor huisartsen/verzekeraars</li>
                </ul>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Het Eindresultaat: 5-Minuten Workflow
                </h2>

                <p>
                  Na implementatie van deze optimalisaties ziet mijn nieuwe workflow er zo uit:
                </p>

                <Card className="my-8 border-hysio-mint/20 bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-hysio-deep-green mb-4">
                      ⚡ Geoptimaliseerde Workflow (5 minuten totaal)
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-hysio-mint rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Tijdens behandeling (2 min)</h4>
                          <p className="text-hysio-deep-green/70 text-sm">Realtime spraaknotities tijdens behandeling</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-hysio-mint rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Automatische verwerking (0 min)</h4>
                          <p className="text-hysio-deep-green/70 text-sm">AI structureert informatie in SOAP-format</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-hysio-mint rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Review en afronding (3 min)</h4>
                          <p className="text-hysio-deep-green/70 text-sm">Controle, kleine aanpassingen en definitief maken</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Praktische Implementatietips
                </h2>

                <p>
                  Gebaseerd op mijn ervaring, hier zijn de belangrijkste tips voor een succesvolle implementatie:
                </p>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  Week 1-2: Gewenning en Calibratie
                </h3>

                <ul className="list-disc pl-6 space-y-2 text-hysio-deep-green/80">
                  <li>Start met 2-3 patiënten per dag om te wennen aan spraakdocumentatie</li>
                  <li>Train het systeem met uw specifieke terminologie en afkortingen</li>
                  <li>Houd initieel de oude methode als backup</li>
                </ul>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  Week 3-4: Uitbreiding en Verfijning
                </h3>

                <ul className="list-disc pl-6 space-y-2 text-hysio-deep-green/80">
                  <li>Breid uit naar alle patiënten</li>
                  <li>Optimaliseer templates op basis van uw meest voorkomende behandelingen</li>
                  <li>Integreer met uw bestaande praktijkmanagementsysteem</li>
                </ul>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  De Impact op Mijn Praktijk
                </h2>

                <p>
                  De resultaten spreken voor zich. Met 25 uur per week minder administratie heb ik kunnen:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-hysio-deep-green/80">
                  <li>3 extra patiënten per dag behandelen (20% toename omzet)</li>
                  <li>Investeren in bijscholing en nieuwe behandelmethoden</li>
                  <li>Betere work-life balance bereiken</li>
                  <li>Meer tijd besteden aan complexe gevallen</li>
                </ul>

                <Card className="my-8 border-hysio-mint/20 bg-gradient-to-r from-hysio-mint/10 to-hysio-mint/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">
                      💰 Return on Investment
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-hysio-deep-green mb-2">Tijdsbesparing</h4>
                        <p className="text-hysio-deep-green/70 text-sm">
                          25 uur/week × €75/uur = <strong>€1.875/week extra inkomsten</strong>
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-hysio-deep-green mb-2">Investering terugverdiend</h4>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Tool kosten binnen <strong>2 weken</strong> terugverdiend
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Conclusie: Van Nachtmerrie naar Routine
                </h2>

                <p>
                  Documentatie is getransformeerd van mijn minst favoriete naar een naadloos onderdeel
                  van mijn behandelproces. Waar ik vroeger dacht: "Ik moet nog 4 uur administratie doen",
                  denk ik nu: "Dat is al gedaan."
                </p>

                <p>
                  De sleutel tot succes ligt in systematische optimalisatie en het omarmen van nieuwe technologie.
                  Als u ook worstelt met documentatietijd, begin dan klein, maar begin vandaag.
                  Uw toekomstige zelf (en uw patiënten) zullen u dankbaar zijn.
                </p>

                <Card className="my-8 border-hysio-mint/20 bg-gradient-to-r from-hysio-mint/10 to-hysio-mint/5">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">
                      Klaar om Uw Workflow te Transformeren?
                    </h3>
                    <p className="text-hysio-deep-green/70 mb-4">
                      Ontdek hoe Hysio uw documentatietijd kan reduceren naar 5 minuten per patiënt,
                      net zoals het bij mij heeft gewerkt.
                    </p>
                    <Button className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-6 py-3">
                      Start Gratis Proefperiode
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-hysio-deep-green mb-8">Gerelateerde Artikelen</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-hysio-mint/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-hysio-deep-green mb-2">
                    <Link href="/blog/ai-revolutie-fysiotherapie-2024" className="hover:text-hysio-mint-dark">
                      De AI-Revolutie in Fysiotherapie: Wat 2024 Brengt voor Uw Praktijk
                    </Link>
                  </h3>
                  <p className="text-hysio-deep-green/70 text-sm mb-3">
                    Ontdek hoe AI de fysiotherapie transformeert en welke voordelen dit biedt.
                  </p>
                  <div className="text-xs text-hysio-deep-green/60">5 min leestijd</div>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-hysio-deep-green mb-2">
                    <Link href="/blog/avg-compliance-fysiotherapie-ai-tools" className="hover:text-hysio-mint-dark">
                      AVG-Compliance bij AI-Tools in de Fysiotherapie: Complete Gids
                    </Link>
                  </h3>
                  <p className="text-hysio-deep-green/70 text-sm mb-3">
                    Alles over privacy en gegevensbescherming bij AI-implementatie.
                  </p>
                  <div className="text-xs text-hysio-deep-green/60">8 min leestijd</div>
                </CardContent>
              </Card>
            </div>
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