'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, AlertTriangle, Mail, Clock } from 'lucide-react';

export default function Privacybeleid() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-hysio-mint">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-hysio-mint/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
            </Link>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-hysio-deep-green hover:text-hysio-mint-dark"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="bg-hysio-off-white border-white/20 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-hysio-mint/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-hysio-mint-dark" />
              </div>
              <CardTitle className="text-4xl font-bold text-hysio-deep-green mb-4">
                Privacybeleid
              </CardTitle>
              <p className="text-lg text-hysio-deep-green-900/80">
                Laatst bijgewerkt: 29 september 2025
              </p>
            </CardHeader>

            <CardContent className="p-8 prose prose-lg max-w-none">
              <div className="space-y-8 text-hysio-deep-green-900/90">

                {/* Alert Box */}
                <div className="bg-hysio-mint/10 border border-hysio-mint/20 rounded-lg p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-hysio-mint-dark mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-hysio-deep-green mb-2">Uw Privacy is Onze Prioriteit</h3>
                      <p className="text-sm text-hysio-deep-green-900/80 leading-relaxed">
                        Dit privacybeleid legt uit hoe Hysio uw persoonlijke gegevens en patiëntinformatie verwerkt. We nemen uw privacy zeer serieus en voldoen aan alle relevante wetgeving, inclusief de AVG en medische privacyrichtlijnen.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 1 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                    <Eye className="h-6 w-6" />
                    1. Algemene Informatie
                  </h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">1.1 Verantwoordelijke</p>
                      <p>Hysio B.V., gevestigd te Nederland, is verantwoordelijk voor de verwerking van persoonsgegevens via het Hysio Medical Scribe platform.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">1.2 Contact</p>
                      <div className="bg-hysio-mint/5 border border-hysio-mint/20 rounded-lg p-4">
                        <p className="mb-2"><strong>Functionaris Gegevensbescherming (FG):</strong></p>
                        <div className="space-y-1 text-sm">
                          <p><strong>E-mail:</strong> privacy@hysio.nl</p>
                          <p><strong>Postadres:</strong> Hysio B.V., [Adres], Nederland</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">1.3 Toepassingsgebied</p>
                      <p>Dit privacybeleid is van toepassing op alle gegevensverwerking door Hysio in het kader van het aanbieden van onze AI-ondersteunde medische documentatiediensten.</p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                    <Database className="h-6 w-6" />
                    2. Welke Gegevens Verwerken Wij
                  </h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">2.1 Gebruikersgegevens</p>
                      <p>Van zorgverleners die een account aanmaken, verwerken wij:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Voor- en achternaam</li>
                        <li>E-mailadres</li>
                        <li>Telefoonnummer</li>
                        <li>Praktijkinformatie (naam, adres)</li>
                        <li>BIG-registratienummer (indien van toepassing)</li>
                        <li>Facturatiegegevens</li>
                        <li>Logingegevens en wachtwoorden (versleuteld)</li>
                        <li>Gebruiksstatistieken en platformactiviteit</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">2.2 Patiëntgegevens</p>
                      <p>Voor het leveren van onze diensten verwerken wij:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Initialen van patiënten</li>
                        <li>Geboortejaar</li>
                        <li>Geslacht</li>
                        <li>Medische anamnese en klachten</li>
                        <li>Audio-opnames van consultaties (met toestemming)</li>
                        <li>Transcripties van medische gesprekken</li>
                        <li>AI-gegenereerde medische verslagen</li>
                        <li>Behandelplannen en voortgangsnotities</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">2.3 Technische Gegevens</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>IP-adressen</li>
                        <li>Browser- en apparaatinformatie</li>
                        <li>Logbestanden van systeemactiviteit</li>
                        <li>Cookies en vergelijkbare technologieën</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">3. Doeleinden van Gegevensverwerking</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">3.1 Primaire Doeleinden</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Dienstverlening:</strong> Leveren van AI-ondersteunde medische documentatie</li>
                        <li><strong>Transcriptie:</strong> Omzetten van audio naar tekst voor medische verslagen</li>
                        <li><strong>AI-analyse:</strong> Genereren van gestructureerde medische rapporten</li>
                        <li><strong>Accountbeheer:</strong> Beheren van gebruikersaccounts en toegangsrechten</li>
                        <li><strong>Facturatie:</strong> Verwerken van betalingen en administratie</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">3.2 Secundaire Doeleinden</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Platformverbetering:</strong> Optimaliseren van AI-algoritmes (geanonimiseerd)</li>
                        <li><strong>Ondersteuning:</strong> Bieden van klantenservice en technische hulp</li>
                        <li><strong>Beveiliging:</strong> Beschermen tegen fraude en misbruik</li>
                        <li><strong>Compliance:</strong> Voldoen aan wettelijke verplichtingen</li>
                        <li><strong>Communicatie:</strong> Versturen van serviceberichten en updates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">4. Rechtsgrondslag</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">4.1 Overeenkomst</p>
                      <p>Voor dienstverlening baseren wij ons op de overeenkomst die u met ons heeft gesloten door het gebruik van ons platform.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">4.2 Gerechtvaardigd Belang</p>
                      <p>Voor platformverbetering, beveiliging en fraudepreventie hebben wij een gerechtvaardigd belang.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">4.3 Toestemming</p>
                      <p>Voor marketing en niet-essentiële cookies vragen wij uw expliciete toestemming.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">4.4 Wettelijke Verplichting</p>
                      <p>Voor facturatie, belasting en andere wettelijke verplichtingen.</p>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                    <Lock className="h-6 w-6" />
                    5. Gegevensbeveiliging
                  </h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">5.1 Technische Maatregelen</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Versleuteling:</strong> Alle gegevens worden versleuteld opgeslagen (AES-256)</li>
                        <li><strong>Transport:</strong> Veilige verbindingen via TLS 1.3</li>
                        <li><strong>Toegangscontrole:</strong> Strikte authenticatie en autorisatie</li>
                        <li><strong>Monitoring:</strong> Continue bewaking van ongeautoriseerde toegang</li>
                        <li><strong>Back-ups:</strong> Regelmatige, versleutelde back-ups</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">5.2 Organisatorische Maatregelen</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Privacytraining voor alle medewerkers</li>
                        <li>Ondertekende geheimhoudingsverklaringen</li>
                        <li>Minimale toegang op basis van functievereisten</li>
                        <li>Reguliere beveiligingsaudits</li>
                        <li>Incidentresponseprocedures</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">5.3 Datacenter Beveiliging</p>
                      <p>Alle gegevens worden opgeslagen in beveiligde datacenters binnen de Europese Unie, conform ISO 27001 standaarden.</p>
                    </div>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">6. Gegevens Delen</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">6.1 Algemeen Principe</p>
                      <p>Hysio deelt geen patiëntgegevens met derden, behalve in de hieronder genoemde gevallen.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">6.2 Verwerkers</p>
                      <p>Wij werken met betrouwbare serviceproviders voor:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Cloud hosting (AWS/Azure EU-regio's)</li>
                        <li>Betalingsverwerking (PCI-DSS gecertificeerd)</li>
                        <li>E-mailservices</li>
                        <li>Analysetools (geanonimiseerd)</li>
                      </ul>
                      <p>Alle verwerkers hebben een verwerkersovereenkomst ondertekend conform AVG-eisen.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">6.3 Wettelijke Verplichtingen</p>
                      <p>Gegevens kunnen worden gedeeld indien dit wettelijk verplicht is, zoals bij gerechtelijke bevelen of toezichthouders.</p>
                    </div>
                  </div>
                </div>

                {/* Section 7 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                    <Clock className="h-6 w-6" />
                    7. Bewaartermijnen
                  </h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">7.1 Gebruikersgegevens</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Actieve accounts:</strong> Voor de duur van het abonnement</li>
                        <li><strong>Gesloten accounts:</strong> 30 dagen na opzegging (voor export)</li>
                        <li><strong>Facturatiegegevens:</strong> 7 jaar (wettelijke verplichting)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">7.2 Patiëntgegevens</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Medische gegevens:</strong> Conform wettelijke medische bewaartermijnen</li>
                        <li><strong>Audio-opnames:</strong> Automatische verwijdering na 90 dagen</li>
                        <li><strong>Transcripties:</strong> Bewaard zolang medisch dossier actief is</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">7.3 Loggegevens</p>
                      <p>Technische logbestanden worden 12 maanden bewaard voor beveiligingsdoeleinden.</p>
                    </div>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">8. Uw Rechten</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">8.1 AVG Rechten</p>
                      <p>U heeft de volgende rechten betreffende uw persoonsgegevens:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Inzage:</strong> Opvragen welke gegevens wij van u verwerken</li>
                        <li><strong>Rectificatie:</strong> Correctie van onjuiste gegevens</li>
                        <li><strong>Verwijdering:</strong> Verzoek tot verwijdering ('recht op vergetelheid')</li>
                        <li><strong>Beperking:</strong> Beperking van gegevensverwerking</li>
                        <li><strong>Overdraagbaarheid:</strong> Uw gegevens in een gestructureerd formaat ontvangen</li>
                        <li><strong>Bezwaar:</strong> Bezwaar maken tegen bepaalde verwerkingen</li>
                        <li><strong>Intrekking toestemming:</strong> Toestemming intrekken voor specifieke verwerkingen</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">8.2 Uitoefening Rechten</p>
                      <p>Rechten kunnen worden uitgeoefend door een e-mail te sturen naar <strong>privacy@hysio.nl</strong>. Wij reageren binnen 30 dagen.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">8.3 Klachtenrecht</p>
                      <p>U heeft het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (AP) indien u niet tevreden bent met onze gegevensverwerking.</p>
                    </div>
                  </div>
                </div>

                {/* Section 9 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">9. Internationale Doorgifte</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">9.1 EU-Verwerking</p>
                      <p>Alle patiëntgegevens worden uitsluitend verwerkt binnen de Europese Unie.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">9.2 Derde Landen</p>
                      <p>Voor bepaalde ondersteunende diensten (zoals e-mailservices) kunnen gegevens naar derde landen worden overgedragen, maar alleen onder passende waarborgen conform AVG-eisen.</p>
                    </div>
                  </div>
                </div>

                {/* Section 10 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">10. Cookies en Tracking</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">10.1 Essentiële Cookies</p>
                      <p>Wij gebruiken essentiële cookies voor:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Inloggen en sessiemanagement</li>
                        <li>Beveiligingsfunctionaliteiten</li>
                        <li>Basisplatformfunctionaliteit</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">10.2 Analytische Cookies</p>
                      <p>Met uw toestemming gebruiken wij cookies voor:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Gebruiksstatistieken (geanonimiseerd)</li>
                        <li>Platformprestatiemonitoring</li>
                        <li>Gebruikerservaring optimalisatie</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">10.3 Cookie-instellingen</p>
                      <p>U kunt uw cookie-voorkeuren beheren via de cookie-instellingen op onze website.</p>
                    </div>
                  </div>
                </div>

                {/* Section 11 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">11. Wijzigingen</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">11.1 Updates</p>
                      <p>Wij kunnen dit privacybeleid wijzigen om te voldoen aan nieuwe wetgeving of bij wijzigingen in onze dienstverlening.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">11.2 Communicatie</p>
                      <p>Belangrijke wijzigingen worden 30 dagen van tevoren gecommuniceerd via e-mail en op het platform.</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-hysio-mint/5 border border-hysio-mint/20 rounded-lg p-6 mt-12">
                  <h3 className="font-semibold text-hysio-deep-green mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact & Vragen
                  </h3>
                  <p className="text-hysio-deep-green-900/80 mb-4">
                    Voor vragen over dit privacybeleid of uw gegevensverwerking:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-semibold text-hysio-deep-green mb-2">Algemene Vragen</p>
                      <div className="space-y-1 text-sm">
                        <p><strong>E-mail:</strong> info@hysio.nl</p>
                        <p><strong>Website:</strong> www.hysio.nl</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-hysio-deep-green mb-2">Privacy Officer</p>
                      <div className="space-y-1 text-sm">
                        <p><strong>E-mail:</strong> privacy@hysio.nl</p>
                        <p><strong>Functie:</strong> Functionaris Gegevensbescherming</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-hysio-mint/10 rounded-lg">
                    <p className="text-sm text-hysio-deep-green-900/80">
                      <strong>Responstijd:</strong> Wij reageren binnen 30 dagen op privacyverzoeken conform AVG-eisen. Voor urgente zaken kunt u contact opnemen via privacy@hysio.nl met vermelding 'URGENT' in de onderwerpregel.
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}