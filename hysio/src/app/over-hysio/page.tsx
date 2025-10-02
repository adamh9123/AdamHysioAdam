'use client';

import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Target, Heart, Award, Shield, Lightbulb, TrendingUp,
  CheckCircle, Zap, Brain, Clock, Star, ArrowRight, Building2,
  Trophy, Sparkles, LineChart, Lock, FileCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OverHysio() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-hysio-mint">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-hysio-deep-green via-hysio-deep-green-900 to-hysio-deep-green overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-hysio-mint/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-hysio-mint/30">
              <Sparkles className="h-5 w-5 text-hysio-mint" />
              <span className="text-hysio-mint font-semibold">De toekomst van fysiotherapie-administratie</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Wij zijn Hysio
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Het Nederlandse intelligente platform dat <span className="text-hysio-mint font-semibold">500+ fysiotherapeuten</span> helpt
              om zich te focussen op wat écht belangrijk is: <span className="text-hysio-mint font-semibold">patiëntenzorg</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push('/registreer')}
                className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-bold text-lg px-10 py-7 h-auto shadow-2xl"
              >
                Probeer Hysio Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/contact')}
                className="border-2 border-white text-white hover:bg-white hover:text-hysio-deep-green font-semibold text-lg px-10 py-7 h-auto"
              >
                Neem Contact Op
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-hysio-mint/20">
                <Users className="h-12 w-12 text-hysio-emerald mx-auto mb-4" />
                <div className="text-4xl font-bold text-hysio-deep-green mb-2">500+</div>
                <div className="text-hysio-deep-green-900/80">Actieve Gebruikers</div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-hysio-mint/20">
                <Clock className="h-12 w-12 text-hysio-emerald mx-auto mb-4" />
                <div className="text-4xl font-bold text-hysio-deep-green mb-2">70%</div>
                <div className="text-hysio-deep-green-900/80">Tijdsbesparing</div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-hysio-mint/20">
                <FileCheck className="h-12 w-12 text-hysio-emerald mx-auto mb-4" />
                <div className="text-4xl font-bold text-hysio-deep-green mb-2">50K+</div>
                <div className="text-hysio-deep-green-900/80">Verslagen per maand</div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-hysio-mint/20">
                <Star className="h-12 w-12 text-hysio-emerald mx-auto mb-4" />
                <div className="text-4xl font-bold text-hysio-deep-green mb-2">4.8/5</div>
                <div className="text-hysio-deep-green-900/80">Gemiddelde Beoordeling</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onze Missie en Visie */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-hysio-deep-green mb-4">
                Onze Missie & Visie
              </h2>
              <p className="text-xl text-hysio-deep-green-900/80 max-w-3xl mx-auto">
                Wij geloven dat Hysio technologie en fysiotherapie een krachtige combinatie vormen
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-hysio-mint/20 shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-hysio-mint to-hysio-mint-dark rounded-xl">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl text-hysio-deep-green">Onze Missie</CardTitle>
                      <div className="text-hysio-emerald font-medium">Waarom Hysio bestaat</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-hysio-deep-green-900/90 leading-relaxed mb-6">
                    Hysio's missie is simpel maar krachtig: <strong>fysiotherapeuten meer tijd geven voor patiëntenzorg</strong>.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-hysio-emerald flex-shrink-0 mt-1" />
                      <span className="text-hysio-deep-green-900/80">
                        <strong>70% minder administratietijd</strong> door Hysio-ondersteunde verslaglegging
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-hysio-emerald flex-shrink-0 mt-1" />
                      <span className="text-hysio-deep-green-900/80">
                        <strong>Evidence-based behandeling</strong> met realtime ondersteuning volgens de geldende professionele richtlijnen
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-hysio-emerald flex-shrink-0 mt-1" />
                      <span className="text-hysio-deep-green-900/80">
                        <strong>Betere patiëntresultaten</strong> door gestructureerde documentatie
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <Lightbulb className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl text-hysio-deep-green">Onze Visie</CardTitle>
                      <div className="text-blue-600 font-medium">Waar we naartoe werken</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-hysio-deep-green-900/90 leading-relaxed mb-6">
                    We bouwen aan de <strong>toekomst van fysiotherapie</strong>: een ecosysteem waarin technologie en
                    klinische expertise naadloos samenwerken.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-hysio-deep-green-900/80">
                        <strong>Hysio-first fysiotherapie</strong> waarbij administratie volledig geautomatiseerd is
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-hysio-deep-green-900/80">
                        <strong>Predictieve analytics</strong> voor betere behandelresultaten en prognoses
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-hysio-deep-green-900/80">
                        <strong>Internationale standaard</strong> voor intelligente technologie in fysiotherapie vanuit Nederland
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Onze Kernwaarden */}
      <section className="py-20 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-hysio-deep-green mb-4">
                Onze Kernwaarden
              </h2>
              <p className="text-xl text-hysio-deep-green-900/80">
                Deze principes sturen elke beslissing die we maken
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-hysio-mint/20 hover:border-hysio-mint hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="p-4 bg-hysio-mint/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-hysio-deep-green" />
                  </div>
                  <CardTitle className="text-2xl text-hysio-deep-green text-center">Patiënt Eerst</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-hysio-deep-green-900/80 leading-relaxed">
                    Elke functie die we bouwen draait om één vraag: <strong>"Helpt dit de fysiotherapeut om
                    betere zorg te leveren?"</strong> We ontwikkelen geen tech for tech's sake.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 hover:border-hysio-mint hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="p-4 bg-hysio-mint/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-10 w-10 text-hysio-deep-green" />
                  </div>
                  <CardTitle className="text-2xl text-hysio-deep-green text-center">Betrouwbaarheid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-hysio-deep-green-900/80 leading-relaxed">
                    <strong>ISO 27001 gecertificeerde beveiliging</strong>, AVG-compliance en Nederlandse data-opslag.
                    Patiëntgegevens zijn heilig en worden met de hoogste zorg behandeld.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 hover:border-hysio-mint hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="p-4 bg-hysio-mint/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-hysio-deep-green" />
                  </div>
                  <CardTitle className="text-2xl text-hysio-deep-green text-center">Evidence-Based</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-hysio-deep-green-900/80 leading-relaxed">
                    Alle Hysio technologie is getraind op <strong>de geldende professionele richtlijnen</strong> en gevalideerd door
                    praktiserende fysiotherapeuten. Geen aannames, alleen bewezen methodieken.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 hover:border-hysio-mint hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="p-4 bg-hysio-mint/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-hysio-deep-green" />
                  </div>
                  <CardTitle className="text-2xl text-hysio-deep-green text-center">Continue Innovatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-hysio-deep-green-900/80 leading-relaxed">
                    We staan nooit stil. <strong>Wekelijkse updates</strong>, nieuwe features en voortdurende
                    verbetering van Hysio nauwkeurigheid houden ons voorop in de markt.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 hover:border-hysio-mint hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="p-4 bg-hysio-mint/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-hysio-deep-green" />
                  </div>
                  <CardTitle className="text-2xl text-hysio-deep-green text-center">Community-Driven</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-hysio-deep-green-900/80 leading-relaxed">
                    Onze gebruikers sturen onze roadmap. <strong>Feedback loops</strong>, beta-tester programma's
                    en direct contact met het ontwikkelteam.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20 hover:border-hysio-mint hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="p-4 bg-hysio-mint/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-10 w-10 text-hysio-deep-green" />
                  </div>
                  <CardTitle className="text-2xl text-hysio-deep-green text-center">Excellentie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-hysio-deep-green-900/80 leading-relaxed">
                    We streven naar <strong>95%+ nauwkeurigheid</strong> in alle Hysio-outputs, een
                    <strong>99.9% uptime</strong> en support die binnen 2 uur reageert.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ons Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-hysio-deep-green mb-4">
                Het Team Achter Hysio
              </h2>
              <p className="text-xl text-hysio-deep-green-900/80">
                Een multidisciplinair team met één gezamenlijk doel
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center border-hysio-mint/20 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-hysio-mint to-hysio-mint-dark rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Stethoscope className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-hysio-deep-green mb-2">Klinisch Team</h3>
                  <p className="text-hysio-deep-green-900/70 mb-4">Ervaren fysiotherapeuten</p>
                  <p className="text-sm text-hysio-deep-green-900/80">
                    Zorgen voor klinische validatie, naleving van professionele normen en realistische workflows
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-hysio-mint/20 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-hysio-deep-green mb-2">Hysio Research</h3>
                  <p className="text-hysio-deep-green-900/70 mb-4">Machine Learning experts</p>
                  <p className="text-sm text-hysio-deep-green-900/80">
                    Ontwikkelen en trainen Hysio technologie specifiek voor fysiotherapie-toepassingen
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-hysio-mint/20 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-hysio-deep-green mb-2">Engineering</h3>
                  <p className="text-hysio-deep-green-900/70 mb-4">Full-stack developers</p>
                  <p className="text-sm text-hysio-deep-green-900/80">
                    Bouwen aan schaalbare, veilige en gebruiksvriendelijke platform-infrastructuur
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-hysio-mint/10 to-hysio-mint/5 border-hysio-mint/20">
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-hysio-emerald mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-hysio-deep-green mb-4">
                  Samen werken we aan de toekomst
                </h3>
                <p className="text-lg text-hysio-deep-green-900/80 max-w-3xl mx-auto leading-relaxed">
                  Ons team combineert <strong>15+ jaar klinische ervaring</strong>, <strong>cutting-edge technologie-expertise</strong> en
                  <strong> enterprise software ontwikkeling</strong> om het beste fysiotherapie-platform van Nederland te bouwen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-hysio-deep-green via-hysio-deep-green-900 to-hysio-deep-green">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Word onderdeel van de Hysio-community
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Sluit je aan bij <strong>500+ Nederlandse fysiotherapeuten</strong> die hun praktijk al
              getransformeerd hebben met Hysio. Ervaar zelf het verschil.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => router.push('/registreer')}
                className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-bold text-xl px-12 py-8 h-auto shadow-2xl"
              >
                Probeer Hysio Gratis
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>

              <div className="text-white/80 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-hysio-mint" />
                  <span>Geen creditcard nodig</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-hysio-mint" />
                  <span>14 dagen gratis proberen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-hysio-mint" />
                  <span>Direct toegang tot alle modules</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <Clock className="h-8 w-8 text-hysio-mint mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">2 minuten</div>
                <div className="text-white/80 text-sm">Setup & klaar voor gebruik</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <Users className="h-8 w-8 text-hysio-mint mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">24/7 Support</div>
                <div className="text-white/80 text-sm">Nederlandse helpdesk</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <Lock className="h-8 w-8 text-hysio-mint mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">100% Veilig</div>
                <div className="text-white/80 text-sm">ISO 27001 gecertificeerd</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hysio-off-white py-16 border-t border-hysio-mint/10">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
            </div>
            <p className="text-hysio-deep-green-900/80 mb-6 max-w-2xl mx-auto">
              Intelligente fysiotherapie-administratie. Gebouwd voor Nederlandse fysiotherapeuten,
              door experts die begrijpen wat jij nodig hebt.
            </p>
            <div className="text-hysio-deep-green-900/60 text-sm">
              © 2025 Hysio.nl - Professional Platform for Physiotherapy Documentation
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Stethoscope } from 'lucide-react';