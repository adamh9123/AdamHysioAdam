import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, Eye, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AVG-Compliance bij AI-Tools in de Fysiotherapie: Complete Gids | Hysio Blog',
  description: 'Alles wat u moet weten over privacy, gegevensbescherming en AVG-compliance wanneer u AI-tools implementeert in uw fysiotherapiepraktijk.',
  keywords: 'AVG compliance fysiotherapie, GDPR AI tools, privacy patiëntgegevens, gegevensbescherming zorgverlening',
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
                Compliance
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-hysio-deep-green mb-6 leading-tight">
              AVG-Compliance bij AI-Tools in de Fysiotherapie: Complete Gids
            </h1>

            <div className="flex items-center gap-6 text-hysio-deep-green/60 mb-8">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Laura Koster, Privacy Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate('2024-01-02')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>8 min leestijd</span>
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
                  De implementatie van AI-tools in fysiotherapiepraktijken biedt enorme voordelen,
                  maar roept ook belangrijke vragen op over privacy en gegevensbescherming.
                  Als privacy-expert in de zorgverlening help ik u navigeren door de AVG-vereisten
                  voor een veilige en compliant implementatie.
                </p>

                <Card className="my-8 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                          Waarschuwing: Compliance is geen optie
                        </h3>
                        <p className="text-red-700">
                          AVG-overtredingen kunnen resulteren in boetes tot €20 miljoen of 4% van de jaaromzet.
                          Voor fysiotherapeuten betekent dit niet alleen financiële risico's, maar ook
                          reputatieschade en mogelijk verlies van praktijkvergunning.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Waarom AI-Tools Extra Aandacht Vereisen
                </h2>

                <p>
                  AI-systemen in de fysiotherapie verwerken niet alleen patiëntgegevens, maar analyseren
                  en interpreteren deze ook. Dit creëert unieke privacy-uitdagingen die traditionele
                  software niet heeft:
                </p>

                <ul className="list-disc pl-6 space-y-2 text-hysio-deep-green/80">
                  <li><strong>Geautomatiseerde besluitvorming:</strong> AI neemt beslissingen over patiëntgegevens</li>
                  <li><strong>Machine learning:</strong> Systemen 'leren' van patiëntdata</li>
                  <li><strong>Spraakverwerking:</strong> Audio-opnames bevatten biometrische gegevens</li>
                  <li><strong>Cloud-verwerking:</strong> Gegevens verlaten mogelijk uw lokale omgeving</li>
                </ul>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  De 7 Pijlers van AVG-Compliant AI-Implementatie
                </h2>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  1. Rechtsgrond voor Verwerking
                </h3>

                <p>
                  Elke verwerking van patiëntgegevens moet gebaseerd zijn op een geldige rechtsgrond
                  onder artikel 6 AVG, plus een aanvullende grond onder artikel 9 voor bijzondere
                  categorieën persoonsgegevens (medische gegevens).
                </p>

                <Card className="my-6 border-hysio-mint/20 bg-white">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-hysio-deep-green mb-3">
                      ✅ Aanbevolen Rechtsgronden voor Fysiotherapie-AI
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Art. 6(1)(f): Gerechtvaardigd belang</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Voor AI-ondersteunde documentatie en workflow optimalisatie
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Art. 9(2)(h): Preventieve geneeskunde</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Voor gezondheidsanalyse en behandeloptimalisatie
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Art. 9(2)(a): Expliciete toestemming</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Voor experimentele AI-functies of onderzoeksdoeleinden
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  2. Transparantie en Informatieplicht
                </h3>

                <p>
                  Patiënten hebben het recht te weten dat AI wordt gebruikt in hun behandeling.
                  Dit vereist aanpassingen aan uw privacyverklaring en informed consent procedures.
                </p>

                <Card className="my-6 border-hysio-mint/20 bg-hysio-mint/5">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-hysio-deep-green mb-2">📋 Checklist: Wat moet u vertellen?</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Dat AI-tools worden gebruikt voor documentatie/analyse</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Welke gegevens door AI worden verwerkt</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Of gegevens de EU verlaten (indien van toepassing)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Bewaartermijnen voor AI-verwerkte gegevens</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Recht op menselijke tussenkomst bij AI-beslissingen</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  3. Data Minimalisatie en Purpose Limitation
                </h3>

                <p>
                  AI-systemen hebben de neiging om veel gegevens te verzamelen. Het AVG-principe
                  van data minimalisatie vereist dat u alleen gegevens verwerkt die noodzakelijk
                  zijn voor het specifieke doel.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-green-700 mb-2">✅ Wel Noodzakelijk</h4>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Behandelnotities voor SOAP-generatie</li>
                        <li>• Diagnoses voor code-herkenning</li>
                        <li>• Behandelgeschiedenis voor context</li>
                        <li>• Vitale functies voor analyse</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-red-700 mb-2">❌ Niet Noodzakelijk</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        <li>• Financiële gegevens voor documentatie-AI</li>
                        <li>• Familie geschiedenis voor schouder revalidatie</li>
                        <li>• Volledige medische historie voor enkelblessure</li>
                        <li>• Biometrische data voor rapportage</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  4. Beveiliging en Technische Maatregelen
                </h3>

                <p>
                  AI-tools vereisen robuuste technische en organisatorische maatregelen (TOMs)
                  om de veiligheid van patiëntgegevens te waarborgen.
                </p>

                <Card className="my-6 border-hysio-mint/20 bg-white">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-hysio-deep-green mb-3">
                      🔒 Essentiële Beveiligingsmaatregelen
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Encryptie</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          End-to-end encryptie voor data in transit en at rest (minimaal AES-256)
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Toegangscontrole</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Multi-factor authenticatie en role-based access control (RBAC)
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Audit Trails</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Logging van alle AI-verwerkingen met tijdstempels en gebruikers-ID's
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-hysio-deep-green">Data Lokalisatie</h5>
                        <p className="text-hysio-deep-green/70 text-sm">
                          Verwerking binnen EU/EER of met adequate beschermingsmaatregelen
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  5. Verwerkersovereenkomsten (DPA's)
                </h3>

                <p>
                  Wanneer u AI-tools van externe leveranciers gebruikt, is een Data Processing Agreement
                  (verwerkersovereenkomst) wettelijk verplicht onder artikel 28 AVG.
                </p>

                <Card className="my-6 border-hysio-mint/20 bg-hysio-mint/5">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-hysio-deep-green mb-2">📄 Essentiële DPA-Clausules voor AI</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Specifieke beschrijving van AI-verwerkingen</li>
                      <li>• Verbod op gebruik van data voor training (tenzij expliciet toegestaan)</li>
                      <li>• Garanties voor data lokalisatie binnen EU/EER</li>
                      <li>• Right to audit AI-systemen en algoritmes</li>
                      <li>• Data breach notification procedures (&lt;72 uur)</li>
                      <li>• Certificeringen (ISO 27001, SOC 2 Type II)</li>
                    </ul>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  6. Patiëntenrechten in AI-Context
                </h3>

                <p>
                  AVG-rechten krijgen nieuwe dimensies wanneer AI betrokken is bij gegevensverwerking.
                  U moet procedures hebben om deze rechten effectief te kunnen faciliteren.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div>
                    <h4 className="font-medium text-hysio-deep-green mb-3">
                      <Eye className="h-5 w-5 inline mr-2" />
                      Recht op Inzage
                    </h4>
                    <p className="text-hysio-deep-green/70 text-sm mb-2">
                      Patiënten hebben recht op kopieën van alle door AI verwerkte gegevens,
                      inclusief AI-gegenereerde analyses en conclusies.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-hysio-deep-green mb-3">
                      <FileText className="h-5 w-5 inline mr-2" />
                      Recht op Rectificatie
                    </h4>
                    <p className="text-hysio-deep-green/70 text-sm mb-2">
                      Correcties in basisgegevens moeten doorwerken in AI-analyses.
                      U moet kunnen aantonen hoe dit technisch wordt gegarandeerd.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-hysio-deep-green mt-6 mb-3">
                  7. Geautomatiseerde Besluitvorming (Art. 22)
                </h3>

                <p>
                  Artikel 22 AVG beperkt volledig geautomatiseerde besluitvorming. Voor fysiotherapie-AI
                  betekent dit dat er altijd menselijke tussenkomst moet zijn bij belangrijke behandelbeslissingen.
                </p>

                <Card className="my-6 border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">
                      ⚠️ Wanneer is Artikel 22 van Toepassing?
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h5 className="font-medium text-yellow-800">Wel van toepassing:</h5>
                        <p className="text-yellow-700">AI die automatisch behandelplannen vastlegt zonder menselijke controle</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-800">Niet van toepassing:</h5>
                        <p className="text-yellow-700">AI die suggesties doet die door fysiotherapeut worden gecontroleerd en goedgekeurd</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Praktische Implementatiestappen
                </h2>

                <p>
                  Een stap-voor-stap aanpak voor AVG-compliant AI-implementatie:
                </p>

                <Card className="my-8 border-hysio-mint/20 bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-hysio-deep-green mb-4">
                      🚀 30-Dagen Implementation Roadmap
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-8 bg-hysio-mint rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">Week 1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Privacy Impact Assessment (PIA)</h4>
                          <p className="text-hysio-deep-green/70 text-sm">Evalueer risico's van uw AI-implementatie</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-12 h-8 bg-hysio-mint rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">Week 2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Leverancier Due Diligence</h4>
                          <p className="text-hysio-deep-green/70 text-sm">Verificeer compliance van AI-tool leverancier</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-12 h-8 bg-hysio-mint rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">Week 3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Documentatie Update</h4>
                          <p className="text-hysio-deep-green/70 text-sm">Privacyverklaring, consent forms, verwerkingsregister</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-12 h-8 bg-hysio-mint rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-hysio-deep-green font-bold text-sm">Week 4</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-hysio-deep-green">Team Training & Go-Live</h4>
                          <p className="text-hysio-deep-green/70 text-sm">Training in privacy procedures en monitoring setup</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Red Flags: Wanneer u Zorgen Moet Hebben
                </h2>

                <Card className="my-6 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-red-800 mb-3">
                      🚨 Waarschuwingssignalen bij AI-Leveranciers
                    </h4>
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• Kan geen duidelijke DPA leveren binnen 48 uur</li>
                      <li>• Weigert informatie over data lokalisatie te verstrekken</li>
                      <li>• Geen certificeringen (ISO 27001, SOC 2)</li>
                      <li>• Vage antwoorden over hoe AI-modellen worden getraind</li>
                      <li>• Claims dat AVG "niet van toepassing" is op hun service</li>
                      <li>• Geen transparantie over sub-verwerkers</li>
                    </ul>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold text-hysio-deep-green mt-8 mb-4">
                  Conclusie: Compliance als Concurrentievoordeel
                </h2>

                <p>
                  AVG-compliance bij AI-implementatie is geen obstakel, maar een concurrentievoordeel.
                  Patiënten waarderen transparantie en zorgvuldigheid in omgang met hun gegevens.
                  Door nu te investeren in correcte compliance, bouwt u vertrouwen en voorkomt u
                  kostbare problemen in de toekomst.
                </p>

                <p>
                  De sleutel tot succes is een proactieve aanpak: begin met compliance vóór implementatie,
                  niet achteraf. Met de juiste voorbereiding kunt u alle voordelen van AI-tools benutten
                  binnen een veilig en compliant kader.
                </p>

                <Card className="my-8 border-hysio-mint/20 bg-gradient-to-r from-hysio-mint/10 to-hysio-mint/5">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-hysio-deep-green mb-3">
                      Hulp Nodig bij AVG-Compliance?
                    </h3>
                    <p className="text-hysio-deep-green/70 mb-4">
                      Hysio is volledig AVG-compliant ontwikkeld met Nederlandse privacy-experts.
                      Ontdek hoe u veilig kunt profiteren van AI-tools in uw praktijk.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold px-6 py-3">
                        Download Privacy Whitepaper
                      </Button>
                      <Button
                        variant="outline"
                        className="border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white px-6 py-3"
                      >
                        Plan Compliance Gesprek
                      </Button>
                    </div>
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
                    <Link href="/blog/optimaliseren-documentatie-workflow" className="hover:text-hysio-mint-dark">
                      Documentatie-Workflow Optimaliseren: Van 30 naar 5 Minuten per Patiënt
                    </Link>
                  </h3>
                  <p className="text-hysio-deep-green/70 text-sm mb-3">
                    Praktische tips voor drastische workflow verbetering.
                  </p>
                  <div className="text-xs text-hysio-deep-green/60">7 min leestijd</div>
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