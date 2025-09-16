'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import {
  FileText,
  Stethoscope,
  Clock,
  Shield,
  Mail,
  Bot,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Mic,
  Brain,
  Eye,
  Star,
  Play,
  Calculator,
  Award,
  Lock,
  Zap
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-hysio-mint">
      {/* Navigation Bar */}
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-hysio-off-white border-white/20 shadow-xl mb-8">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="space-y-6">
                    {/* Enhanced Visual Slogan Statement */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-hysio-mint/20 to-hysio-emerald/20 blur-xl rounded-2xl"></div>
                      <div className="relative bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl border-2 border-hysio-mint/40 shadow-2xl">
                        <h1 className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-hysio-deep-green to-hysio-mint-dark leading-tight text-center">
                          <span className="block">Jij focust op zorg,</span>
                          <span className="block mt-2 text-hysio-emerald">Hysio doet de rest</span>
                        </h1>
                      </div>
                    </div>
                    <p className="text-xl text-hysio-deep-green-900/80 leading-relaxed max-w-xl">
                      Het Hysio-platform dat Nederlandse fysiotherapeuten gemiddeld <strong>8 uur per week teruggeeft</strong>. Van spraak naar gestructureerd verslag in seconden.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col">
                      <Button
                        size="lg"
                        onClick={() => router.push('/scribe')}
                        className="bg-hysio-deep-green hover:bg-hysio-deep-green-900 text-white font-semibold text-lg px-8 py-6 h-auto mb-2"
                      >
                        Probeer Hysio Gratis
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-xs text-hysio-deep-green-900/60 font-medium text-center">Geen creditcard nodig</p>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/demo-video')}
                      className="border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white font-semibold text-lg px-8 py-6 h-auto"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Bekijk Demo
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-6 text-sm text-hysio-deep-green-900/70">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                        <span>Geen verplichtingen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                        <span>KNGF-conform</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                        <span>AVG-compliant</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 border border-hysio-mint/20">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-hysio-deep-green" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-hysio-deep-green">Live Demo</h3>
                          <p className="text-sm text-hysio-deep-green-900/70">Zie Hysio in actie</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-hysio-mint/10 rounded-lg">
                          <Mic className="h-5 w-5 text-hysio-mint-dark animate-pulse" />
                          <span className="text-sm">&quot;Patiënt meldt pijn in de onderrug sinds gisteren...&quot;</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                          <span className="text-sm">Hysio analyseert volgens SOEP-methodiek...</span>
                        </div>

                        <div className="p-4 bg-hysio-emerald/10 rounded-lg border border-hysio-emerald/20">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                            <span className="font-medium text-hysio-deep-green">Verslag gereed</span>
                          </div>
                          <p className="text-sm text-hysio-deep-green-900/80">
                            Een compleet gestructureerd behandelverslag, gegenereerd met klinische precisie.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-hysio-off-white border-white/20 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-hysio-deep-green mb-4">
                  30% van je tijd gaat naar administratie¹
                </h2>
                <p className="text-lg text-hysio-deep-green-900/80">
                  Hysio geeft je deze tijd terug voor wat écht belangrijk is.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 mb-16">
                <Card className="text-center border-red-200 bg-red-50/50">
                  <CardHeader>
                    <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-red-700">Huidige Situatie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 mb-2">30%</div>
                    <p className="text-red-700/80">van je tijd aan administratie</p>
                    <p className="text-sm text-red-600/70 mt-2">Overwerk, stress, minder patiëntentijd</p>
                  </CardContent>
                </Card>

                <Card className="text-center border-hysio-mint bg-hysio-mint/10 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-hysio-mint-dark text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Met Hysio
                    </div>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="w-16 h-16 bg-hysio-mint rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-hysio-deep-green">Transformatie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-hysio-mint-dark mb-2">10%</div>
                    <p className="text-hysio-deep-green">van je tijd aan administratie</p>
                    <p className="text-sm text-hysio-emerald font-medium mt-2">70% tijdsbesparing!</p>
                  </CardContent>
                </Card>

                <Card className="text-center border-hysio-emerald/20 bg-hysio-emerald/10">
                  <CardHeader>
                    <div className="w-16 h-16 bg-hysio-emerald/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-hysio-emerald" />
                    </div>
                    <CardTitle className="text-hysio-deep-green">Het Resultaat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-hysio-emerald mb-2">75%</div>
                    <p className="text-hysio-deep-green">minder administratietijd</p>
                    <p className="text-sm text-hysio-deep-green font-medium mt-2">Betere zorg, minder stress</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-hysio-off-white border-white/20 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-hysio-deep-green mb-4">
                  Zo werkt het
                </h2>
                <p className="text-lg text-hysio-deep-green-900/80">
                  Drie stappen naar professioneel verslag
                </p>
              </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-hysio-mint rounded-full mx-auto mb-6 flex items-center justify-center relative">
                <Mic className="h-10 w-10 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-hysio-deep-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hysio-deep-green mb-4">Spreek</h3>
              <p className="text-hysio-deep-green-900/80 mb-4">
                Vertel wat je normaal opschrijft. Hysio begrijpt medische terminologie.
              </p>
              <div className="bg-white p-4 rounded-lg border border-hysio-mint/20">
                <p className="text-sm italic text-hysio-deep-green-900/70">
                  &quot;Patiënt 45-jarige vrouw, klachten onderrugpijn sinds 3 dagen, uitstralend naar linkerbeen...&quot;
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center relative">
                <Brain className="h-10 w-10 text-white animate-pulse" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-hysio-deep-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hysio-deep-green mb-4">Hysio Denkt</h3>
              <p className="text-hysio-deep-green-900/80 mb-4">
                Analyseert, structureert volgens richtlijnen en genereert een professioneel verslag.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700">Analyseren...</span>
                </div>
                <div className="text-xs text-blue-600/70">Conform richtlijnen • Red flags check • Gestructureerd</div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-hysio-emerald rounded-full mx-auto mb-6 flex items-center justify-center relative">
                <Eye className="h-10 w-10 text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-hysio-deep-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-hysio-deep-green mb-4">Jij Controleert</h3>
              <p className="text-hysio-deep-green-900/80 mb-4">
                Bekijk, pas aan en keur goed. Jij behoudt de eindverantwoordelijkheid.
              </p>
              <div className="bg-hysio-emerald/10 p-4 rounded-lg border border-hysio-emerald/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                  <span className="text-sm font-medium text-hysio-emerald">Verslag gereed voor goedkeuring</span>
                </div>
                <div className="text-xs text-hysio-emerald/70">95% accuraat • Direct exporteerbaar</div>
              </div>
            </div>
          </div>

            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hysio Toolkit Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-hysio-off-white border-white/20 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-hysio-deep-green mb-4">
                  Complete Hysio-Platform
                </h2>
                <p className="text-lg text-hysio-deep-green-900/80">
                  Vier AI-modules voor je complete workflow
                </p>
              </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="border-hysio-deep-green/20 hover:border-hysio-deep-green/40 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/scribe')}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-hysio-deep-green/20 rounded-xl flex items-center justify-center group-hover:bg-hysio-deep-green group-hover:text-white transition-colors">
                    <Stethoscope className="h-6 w-6 text-hysio-deep-green group-hover:text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-hysio-deep-green text-xl">Hysio Intake & Consult</CardTitle>
                    <div className="text-hysio-deep-green/60 text-sm">Medische Scribe</div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Van intake tot vervolgconsult. Automatische verslaglegging en intelligente behandelplannen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>5-staps gestructureerde intake workflow</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Automatische red flag detectie</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>SOEP-methodiek voor vervolgconsulten</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-hysio-mint/20">
                  <div className="text-sm font-medium text-hysio-mint-dark">
                    Tijdsbesparing: 70% op verslaglegging →
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/assistant')}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Bot className="h-6 w-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-hysio-deep-green text-xl">Hysio Assistant</CardTitle>
                    <div className="text-hysio-deep-green/60 text-sm">Chat & Ondersteuning</div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Je AI-collega voor klinische vragen en evidence-based adviezen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Evidence-based klinische ondersteuning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Directe KNGF-richtlijn raadpleging</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>24/7 beschikbare Hysio-consultant</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="text-sm font-medium text-blue-600">
                    Antwoord in seconden, niet uren →
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-hysio-mint/40 hover:border-hysio-mint hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/smartmail-demo')}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-hysio-mint/20 rounded-xl flex items-center justify-center group-hover:bg-hysio-mint transition-colors">
                    <Mail className="h-6 w-6 text-hysio-mint-dark group-hover:text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-hysio-deep-green text-xl">Hysio SmartMail</CardTitle>
                    <div className="text-hysio-deep-green/60 text-sm">Intelligente Communicatie</div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Automatische e-mails naar huisartsen en patiënten op basis van behandelgegevens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Ultra Think document-context analyse</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Automatische verwijsbrieven</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Patiënt-vriendelijke uitleg generatie</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-hysio-mint/20">
                  <div className="text-sm font-medium text-hysio-mint-dark">
                    ✨ Nieuw: Nu met Ultra Think →
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/diagnosecode')}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <Brain className="h-6 w-6 text-purple-600 group-hover:text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-hysio-deep-green text-xl">Hysio Diagnosecode</CardTitle>
                    <div className="text-hysio-deep-green/60 text-sm">Hysio Diagnosecode Chat</div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  Geavanceerde DCSPH diagnosis coding vanuit natuurlijke taal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Natuurlijke taal naar DCSPH codes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>95%+ nauwkeurige code suggesties</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                    <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                    <span>Van 5 minuten naar 30 seconden</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <div className="text-sm font-medium text-purple-600">
                    🧠 Nieuw: AI-powered coding →
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard - Wide Card */}
          <Card className="border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => router.push('/dashboard')}>
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-600 transition-colors flex-shrink-0">
                    <FileText className="h-8 w-8 text-slate-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-hysio-deep-green text-2xl">Hysio Dashboard</CardTitle>
                      <div className="text-hysio-deep-green/60 text-sm bg-slate-100 px-3 py-1 rounded-full">
                        Analytics & Overzicht
                      </div>
                    </div>
                    <CardDescription className="text-lg mb-4">
                      Centraal overzicht van je complete Hysio-praktijk met real-time analytics, tijdsbesparing monitoring en patiëntvoortgang.
                    </CardDescription>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                        <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                        <span>Real-time praktijk analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                        <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                        <span>Tijdsbesparing monitoring</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/80">
                        <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                        <span>Patiënt voortgangsoverzicht</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 rounded-lg border border-slate-100 text-center flex-shrink-0">
                  <div className="text-sm font-medium text-slate-600 mb-1">
                    Datagedreven praktijkvoering
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-hysio-off-white border-white/20 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <Award className="h-6 w-6 text-hysio-emerald" />
                  <h2 className="text-3xl font-bold text-hysio-deep-green">
                    500+ Nederlandse Fysiotherapeuten
                  </h2>
                </div>
                <p className="text-lg text-hysio-deep-green-900/80">
                  Gebruiken Hysio dagelijks voor meer tijd voor patiënten
                </p>
              </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-12 mb-16 flex-wrap">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-sm border border-hysio-mint/20">
              <Shield className="h-6 w-6 text-hysio-emerald" />
              <div>
                <div className="font-semibold text-hysio-deep-green">KNGF Conform</div>
                <div className="text-sm text-hysio-deep-green-900/70">Nederlandse richtlijnen</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-sm border border-hysio-mint/20">
              <Lock className="h-6 w-6 text-hysio-emerald" />
              <div>
                <div className="font-semibold text-hysio-deep-green">AVG Compliant</div>
                <div className="text-sm text-hysio-deep-green-900/70">Medische beveiliging</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-sm border border-hysio-mint/20">
              <Users className="h-6 w-6 text-hysio-emerald" />
              <div>
                <div className="font-semibold text-hysio-deep-green">500+ Gebruikers</div>
                <div className="text-sm text-hysio-deep-green-900/70">Dagelijks actief</div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-hysio-mint/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-hysio-deep-green-900/80 mb-4 italic">
                  &quot;Hysio heeft mijn praktijk getransformeerd. Ik bespaar elke dag 2-3 uur aan administratie
                  en kan me écht focussen op mijn patiënten.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-hysio-mint/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-hysio-deep-green">MH</span>
                  </div>
                  <div>
                    <div className="font-semibold text-hysio-deep-green">Marieke H.</div>
                    <div className="text-sm text-hysio-deep-green-900/70">Fysiotherapeut, Amsterdam</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-hysio-mint/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-hysio-deep-green-900/80 mb-4 italic">
                  &quot;De Hysio-assistent helpt me bij complexe gevallen. Het voelt als een digitale collega
                  die altijd de laatste richtlijnen paraat heeft.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-hysio-mint/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-hysio-deep-green">DJ</span>
                  </div>
                  <div>
                    <div className="font-semibold text-hysio-deep-green">Daan J.</div>
                    <div className="text-sm text-hysio-deep-green-900/70">Fysiotherapeut, Utrecht</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-hysio-mint/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-hysio-deep-green-900/80 mb-4 italic">
                  &quot;SmartMail is geweldig voor communicatie met huisartsen. Professionele verwijsbrieven
                  in 30 seconden in plaats van 15 minuten typen.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-hysio-mint/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-hysio-deep-green">LK</span>
                  </div>
                  <div>
                    <div className="font-semibold text-hysio-deep-green">Lisa K.</div>
                    <div className="text-sm text-hysio-deep-green-900/70">Fysiotherapeut, Rotterdam</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-deep-green via-hysio-deep-green-900 to-hysio-deep-green">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Klaar om je praktijk te transformeren?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Word onderdeel van de 500+ Nederlandse fysiotherapeuten die dagelijks meer tijd creëren voor wat écht belangrijk is.
              <strong> Start vandaag je gratis proefperiode.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => router.push('/scribe')}
                className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-bold text-xl px-12 py-8 h-auto shadow-xl"
              >
                Probeer Hysio Gratis
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>

              <div className="text-white/70 text-sm">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-hysio-mint" />
                  <span>Geen verplichtingen</span>
                </div>
                <div className="flex items-center gap-2 justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-hysio-mint" />
                  <span>Geen creditcard nodig</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-hysio-mint" />
                  <span>Direct toegang tot alle modules</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-hysio-mint mb-2">2 min</div>
                <div className="text-white/80">Setup tijd</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-hysio-mint mb-2">24/7</div>
                <div className="text-white/80">Nederlandse support</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-hysio-mint mb-2">€0</div>
                <div className="text-white/80">Eerste 14 dagen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hysio-off-white py-16 border-t border-hysio-mint/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                  <span className="text-hysio-deep-green font-bold text-lg">H</span>
                </div>
                <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
              </div>
              <p className="text-hysio-deep-green-900/80 mb-6 max-w-md">
                Het AI-ecosysteem voor Nederlandse fysiotherapeuten. Meer tijd voor zorg, minder gedoe met administratie.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push('/scribe')}
                  className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold"
                >
                  Probeer Nu
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-hysio-deep-green mb-4">Platform</h4>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/scribe')}
                  className="block text-hysio-deep-green-900/70 hover:text-hysio-mint-dark transition-colors"
                >
                  Hysio Scribe
                </button>
                <button
                  onClick={() => router.push('/assistant')}
                  className="block text-hysio-deep-green-900/70 hover:text-hysio-mint-dark transition-colors"
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => router.push('/smartmail-demo')}
                  className="block text-hysio-deep-green-900/70 hover:text-hysio-mint-dark transition-colors"
                >
                  SmartMail
                </button>
                <button
                  onClick={() => router.push('/diagnosecode')}
                  className="block text-hysio-deep-green-900/70 hover:text-hysio-mint-dark transition-colors"
                >
                  Diagnosecode
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="block text-hysio-deep-green-900/70 hover:text-hysio-mint-dark transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-hysio-deep-green mb-4">Bedrijf</h4>
              <div className="space-y-3">
                <div className="text-hysio-deep-green-900/70">Over Hysio</div>
                <div className="text-hysio-deep-green-900/70">Privacy</div>
                <div className="text-hysio-deep-green-900/70">Voorwaarden</div>
                <div className="text-hysio-deep-green-900/70">Contact</div>
              </div>
            </div>
          </div>

          <div className="border-t border-hysio-mint/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-hysio-deep-green-900/60">
                © 2024 Hysio.nl - Professional Platform for Physiotherapy Documentation
              </p>
              <div className="flex items-center gap-4 text-sm text-hysio-deep-green-900/60">
                <span>KNGF-conform</span>
                <span>•</span>
                <span>AVG-compliant</span>
                <span>•</span>
                <span>Nederlandse support</span>
              </div>
            </div>
            <div className="text-center mt-4 space-y-2">
              <p className="text-xs text-hysio-deep-green-900/50">
                Alle Hysio-gegenereerde content moet geverifieerd worden door gelicentieerde fysiotherapeuten
              </p>
              <p className="text-xs text-hysio-deep-green-900/40">
                ¹ Bron: KNGF / Nivel, &quot;Tijdsbesteding in de fysiotherapiepraktijk&quot;
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}