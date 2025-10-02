import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  MessageSquare,
  Mail,
  Search,
  BarChart3,
  Clock,
  Shield,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Brain,
  Mic,
  Bot,
  Sparkles
} from 'lucide-react';

export default function HysioModules() {
  const modules = [
    {
      id: 'scribe',
      name: 'Hysio Scribe',
      tagline: 'Intelligente Documentatie',
      description: 'Transformeer uw behandelingsdocumentatie met intelligente Hysio-assistentie die uw workflow revolutioneert.',
      icon: FileText,
      color: 'hysio-mint',
      href: '/scribe',
      keyProblems: [
        'Tijdrovende handmatige documentatie',
        'Inconsistente rapportageformaten',
        'Gemiste details in behandelnotities',
        'Administratieve overbelasting'
      ],
      keyBenefits: [
        'Bespaar 70% tijd op documentatie',
        'Verhoog de consistentie van rapportages',
        'Verbeter de kwaliteit van behandelnotities',
        'Focus meer op patiëntenzorg'
      ],
      features: [
        {
          title: 'Spraakherkenning',
          description: 'Spreek uw notities in en zie ze automatisch getranscribeerd',
          icon: Mic
        },
        {
          title: 'Intelligente Templates',
          description: 'Hysio templates voor verschillende behandeltypes',
          icon: Brain
        },
        {
          title: 'PHSB Structuur',
          description: 'Automatische structurering volgens PHSB-methodiek',
          icon: FileText
        },
        {
          title: 'Rode Vlag Detectie',
          description: 'Automatische herkenning van belangrijke symptomen',
          icon: Shield
        }
      ]
    },
    {
      id: 'assistant',
      name: 'Hysio Assistant',
      tagline: 'Intelligente Fysiotherapie-Assistent',
      description: 'Uw persoonlijke AI-assistent voor klinische besluitvorming en behandeladvies op basis van de nieuwste evidence.',
      icon: Bot,
      color: 'hysio-mint',
      href: '/assistant',
      keyProblems: [
        'Complexe differentiaaldiagnoses',
        'Tijdgebrek voor literatuuronderzoek',
        'Onzekerheid bij atypische cases',
        'Behoefte aan second opinion'
      ],
      keyBenefits: [
        'Evidence-based behandeladvies',
        'Snelle toegang tot literatuur',
        'Verbeterde diagnostische precisie',
        'Verhoogd vertrouwen in behandeling'
      ],
      features: [
        {
          title: 'Klinische Vraagstelling',
          description: 'Stel complexe vragen over patiëntcases',
          icon: MessageSquare
        },
        {
          title: 'Evidence-Based Advies',
          description: 'Adviezen gebaseerd op nieuwste onderzoek',
          icon: Brain
        },
        {
          title: 'Differentiaaldiagnose',
          description: 'Hulp bij complexe diagnostische overwegingen',
          icon: Search
        },
        {
          title: 'Behandelprotocollen',
          description: 'Toegang tot gevalideerde behandelprotocollen',
          icon: CheckCircle
        }
      ]
    },
    {
      id: 'smartmail',
      name: 'Hysio SmartMail',
      tagline: 'Geautomatiseerde Communicatie',
      description: 'Stroomlijn uw patiëntcommunicatie met intelligente e-mailautomatisering en gepersonaliseerde berichten.',
      icon: Mail,
      color: 'hysio-mint',
      href: '/smartmail',
      keyProblems: [
        'Tijdrovende e-mailcommunicatie',
        'Inconsistente berichtgeving',
        'Gemiste follow-up communicatie',
        'Handmatige afspraakherinneringen'
      ],
      keyBenefits: [
        'Bespaar uren per week op communicatie',
        'Verbeter patiëntbetrokkenheid',
        'Verhoog behandelcompliantie',
        'Professionele, consistente uitstraling'
      ],
      features: [
        {
          title: 'Slimme Templates',
          description: 'Automatisch gegenereerde e-mailtemplates voor elke situatie',
          icon: Sparkles
        },
        {
          title: 'Automatische Follow-up',
          description: 'Geautomatiseerde follow-up berichten na behandeling',
          icon: Clock
        },
        {
          title: 'Gepersonaliseerde Content',
          description: 'Berichten aangepast aan specifieke patiëntbehoeften',
          icon: Users
        },
        {
          title: 'Intake Optimalisatie',
          description: 'Gestroomlijnde intake-formulieren en onboarding',
          icon: ArrowRight
        }
      ]
    },
    {
      id: 'diagnosecode',
      name: 'Hysio Diagnosecode',
      tagline: 'Slimme Diagnose Herkenning',
      description: 'Automatische herkenning en suggestie van ICF en ICD-10 codes op basis van uw behandelnotities.',
      icon: Search,
      color: 'hysio-mint',
      href: '/diagnosecode',
      keyProblems: [
        'Complexiteit van coderingssystemen',
        'Tijdrovend zoeken naar juiste codes',
        'Risico op onjuiste codering',
        'Declaratie-uitdagingen'
      ],
      keyBenefits: [
        'Verhoog declaratie-nauwkeurigheid',
        'Bespaar tijd op administratie',
        'Verminder codeerfouten',
        'Verbeter compliance'
      ],
      features: [
        {
          title: 'Automatische Suggesties',
          description: 'Hysio suggereert relevante codes tijdens het documenteren',
          icon: Brain
        },
        {
          title: 'ICF & ICD-10 Integratie',
          description: 'Ondersteuning voor beide internationale standaarden',
          icon: CheckCircle
        },
        {
          title: 'Contextbewuste Herkenning',
          description: 'Codes gebaseerd op volledige behandelcontext',
          icon: Search
        },
        {
          title: 'Validatie & Controle',
          description: 'Automatische controle op code-consistentie',
          icon: Shield
        }
      ]
    },
    {
      id: 'dashboard',
      name: 'Hysio Dashboard',
      tagline: 'Overzicht & Analytics',
      description: 'Krijg inzicht in uw praktijkprestaties met uitgebreide analytics en rapportages voor data-gedreven beslissingen.',
      icon: BarChart3,
      color: 'hysio-mint',
      href: '/dashboard',
      keyProblems: [
        'Gebrek aan praktijkinzichten',
        'Manuele rapportage processen',
        'Onduidelijke performance indicatoren',
        'Moeilijke trendanalyse'
      ],
      keyBenefits: [
        'Data-gedreven besluitvorming',
        'Verhoog praktijkefficiëntie',
        'Identificeer groeikansen',
        'Verbeter patiëntuitkomsten'
      ],
      features: [
        {
          title: 'Real-time Analytics',
          description: 'Live inzichten in uw praktijkprestaties',
          icon: BarChart3
        },
        {
          title: 'Patiënt Outcomes',
          description: 'Track behandelresultaten en patiëntvoortgang',
          icon: Users
        },
        {
          title: 'Financiële Rapportage',
          description: 'Inzicht in omzet, declaraties en kostenanalyse',
          icon: BarChart3
        },
        {
          title: 'Trend Analyse',
          description: 'Identificeer patronen en trends in uw praktijk',
          icon: Zap
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-hysio-mint">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-mint to-hysio-mint/80">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-hysio-deep-green mb-6">
              Hysio Modules
            </h1>
            <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
              Ontdek de kracht van ons geïntegreerde platform. Elke module is zorgvuldig
              ontworpen om specifieke uitdagingen in uw fysiotherapiepraktijk op te lossen.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-hysio-deep-green/10 rounded-full text-hysio-deep-green text-sm font-medium">
                5 Krachtige Modules
              </span>
              <span className="px-4 py-2 bg-hysio-deep-green/10 rounded-full text-hysio-deep-green text-sm font-medium">
                Volledig Geïntegreerd
              </span>
              <span className="px-4 py-2 bg-hysio-deep-green/10 rounded-full text-hysio-deep-green text-sm font-medium">
                Hysio-Gedreven
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-4">
              Complete Modulaire Oplossing
            </h2>
            <p className="text-xl text-hysio-deep-green/70 text-center mb-12 max-w-3xl mx-auto">
              Van documentatie tot diagnose, van communicatie tot analytics -
              Hysio biedt alles wat u nodig heeft in één samenhangend platform.
            </p>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-16">
              {modules.slice(0, 3).map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card key={module.id} className="border-hysio-mint/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-hysio-mint/20 rounded-lg">
                          <IconComponent className="h-6 w-6 text-hysio-deep-green" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-hysio-deep-green">{module.name}</CardTitle>
                          <p className="text-sm text-hysio-deep-green/60">{module.tagline}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-hysio-deep-green/70 mb-4 leading-relaxed">
                        {module.description}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-hysio-mint text-hysio-deep-green hover:bg-hysio-mint hover:text-hysio-deep-green"
                      >
                        Meer informatie
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {modules.slice(3).map((module) => {
                const IconComponent = module.icon;
                return (
                  <Card key={module.id} className="border-hysio-mint/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-hysio-mint/20 rounded-lg">
                          <IconComponent className="h-6 w-6 text-hysio-deep-green" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-hysio-deep-green">{module.name}</CardTitle>
                          <p className="text-sm text-hysio-deep-green/60">{module.tagline}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-hysio-deep-green/70 mb-4 leading-relaxed">
                        {module.description}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-hysio-mint text-hysio-deep-green hover:bg-hysio-mint hover:text-hysio-deep-green"
                      >
                        Meer informatie
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Module Sections */}
      {modules.map((module, index) => {
        const IconComponent = module.icon;
        const isEven = index % 2 === 0;

        return (
          <section key={module.id} className={`py-16 ${isEven ? 'bg-white' : ''}`}>
            <div className="container mx-auto px-6">
              <div className="max-w-7xl mx-auto">
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={!isEven ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-4 bg-hysio-mint/20 rounded-xl">
                        <IconComponent className="h-8 w-8 text-hysio-deep-green" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-hysio-deep-green">{module.name}</h2>
                        <p className="text-lg text-hysio-deep-green/70">{module.tagline}</p>
                      </div>
                    </div>

                    <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
                      {module.description}
                    </p>

                    {/* Problems & Benefits */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="text-lg font-semibold text-hysio-deep-green mb-4">Uitdagingen die we oplossen:</h3>
                        <ul className="space-y-2">
                          {module.keyProblems.map((problem, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-hysio-deep-green/70">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{problem}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-hysio-deep-green mb-4">Voordelen voor u:</h3>
                        <ul className="space-y-2">
                          {module.keyBenefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-hysio-deep-green/70">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-8"
                    >
                      Probeer {module.name}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  {/* Features */}
                  <div className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    <Card className="border-hysio-mint/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-xl text-hysio-deep-green">Belangrijkste Functies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {module.features.map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-hysio-mint/5 transition-colors">
                                <div className="p-2 bg-hysio-mint/20 rounded-lg">
                                  <FeatureIcon className="h-4 w-4 text-hysio-deep-green" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-hysio-deep-green">{feature.title}</h4>
                                  <p className="text-sm text-hysio-deep-green/70">{feature.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Integration Benefits */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-6">
              Kracht van Integratie
            </h2>
            <p className="text-xl text-hysio-deep-green/70 text-center mb-12 max-w-3xl mx-auto">
              Onze modules werken naadloos samen, waardoor u meer bereikt dan de som der delen.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Verhoogde Efficiëntie</h3>
                <p className="text-hysio-deep-green/70">
                  Data stroomt automatisch tussen modules, elimineert dubbel werk en verhoogt nauwkeurigheid.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Consistente Kwaliteit</h3>
                <p className="text-hysio-deep-green/70">
                  Gestandaardiseerde processen over alle modules zorgen voor consistent hoge kwaliteit.
                </p>
              </div>

              <div className="text-center">
                <div className="p-4 bg-hysio-mint/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-hysio-deep-green" />
                </div>
                <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">Betere Patiëntenzorg</h3>
                <p className="text-hysio-deep-green/70">
                  Meer tijd voor patiënten, betere documentatie en evidence-based behandelingen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-hysio-off-white border-t border-hysio-mint/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-hysio-deep-green mb-6">
            Klaar om uw praktijk te transformeren?
          </h2>
          <p className="text-xl text-hysio-deep-green/80 mb-8 max-w-2xl mx-auto">
            Ontdek hoe de Hysio modules uw fysiotherapiepraktijk kunnen revolutioneren.
            Start vandaag nog met een gratis proefperiode.
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