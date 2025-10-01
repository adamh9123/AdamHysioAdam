'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react';

export default function AlgemeneVoorwaarden() {
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
                <FileText className="h-10 w-10 text-hysio-mint-dark" />
              </div>
              <CardTitle className="text-4xl font-bold text-hysio-deep-green mb-4">
                Algemene Voorwaarden
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
                      <h3 className="font-semibold text-hysio-deep-green mb-2">Belangrijke Mededeling</h3>
                      <p className="text-sm text-hysio-deep-green-900/80 leading-relaxed">
                        Deze Algemene Voorwaarden zijn van toepassing op alle diensten van Hysio, een medisch AI-platform voor fysiotherapeuten. Door gebruik te maken van onze diensten, gaat u akkoord met deze voorwaarden.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 1 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                    <Shield className="h-6 w-6" />
                    1. Definities
                  </h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">1.1</p>
                      <p>In deze Algemene Voorwaarden wordt verstaan onder:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Hysio:</strong> Hysio B.V., gevestigd te Nederland, ontwikkelaar en aanbieder van het Hysio Medical Scribe platform.</li>
                        <li><strong>Platform:</strong> Het Hysio Medical Scribe softwareplatform, inclusief alle bijbehorende functionaliteiten en AI-diensten.</li>
                        <li><strong>Gebruiker:</strong> Elke natuurlijke persoon of rechtspersoon die gebruik maakt van het Platform.</li>
                        <li><strong>Zorgverlener:</strong> Een geregistreerde fysiotherapeut of andere erkende zorgprofessional die gebruik maakt van het Platform.</li>
                        <li><strong>Patiëntgegevens:</strong> Alle medische en persoonlijke gegevens van patiënten die worden verwerkt via het Platform.</li>
                        <li><strong>Account:</strong> Het persoonlijke gebruikersaccount waarmee toegang wordt verkregen tot het Platform.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    2. Toepasselijkheid
                  </h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">2.1</p>
                      <p>Deze Algemene Voorwaarden zijn van toepassing op alle overeenkomsten tussen Hysio en Gebruikers betreffende het gebruik van het Platform.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">2.2</p>
                      <p>Door een Account aan te maken of gebruik te maken van het Platform, gaat de Gebruiker akkoord met deze Algemene Voorwaarden.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">2.3</p>
                      <p>Hysio behoudt zich het recht voor deze voorwaarden te wijzigen. Gebruikers worden minimaal 30 dagen van tevoren geïnformeerd over wijzigingen via e-mail of het Platform.</p>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">3. Dienstverlening</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">3.1</p>
                      <p>Hysio biedt een AI-ondersteund platform voor medische documentatie, specifiek ontworpen voor fysiotherapeuten en gerelateerde zorgverleners.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">3.2</p>
                      <p>Het Platform omvat onder andere:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Geautomatiseerde transcriptie van medische consultaties</li>
                        <li>AI-gegenereerde medische verslaglegging volgens SOEP-methodiek</li>
                        <li>Intelligente patiëntcommunicatie tools</li>
                        <li>Diagnosecode suggesties conform DCSPH-standaarden</li>
                        <li>Patiënt educatiemateriaal generatie</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">3.3</p>
                      <p>Hysio streeft naar een uptime van 99,9% maar garandeert geen ononderbroken beschikbaarheid van het Platform.</p>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">4. Gebruikersverplichtingen</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">4.1</p>
                      <p>De Gebruiker verplicht zich tot:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Correcte en volledige informatie te verstrekken bij registratie</li>
                        <li>Zijn inloggegevens vertrouwelijk te houden</li>
                        <li>Het Platform alleen te gebruiken voor wettelijke doeleinden</li>
                        <li>Geen inbreuk te maken op intellectuele eigendomsrechten</li>
                        <li>Zich te houden aan relevante medische en juridische richtlijnen</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">4.2</p>
                      <p>Zorgverleners zijn volledig verantwoordelijk voor:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>De medische juistheid van alle gegenereerde content</li>
                        <li>Het verkrijgen van patiënttoestemming voor gegevensverwerking</li>
                        <li>Naleving van de Wet op de geneeskundige behandelovereenkomst (WGBO)</li>
                        <li>Verificatie en goedkeuring van alle AI-gegenereerde medische content</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">4.3</p>
                      <p>Het is uitdrukkelijk verboden om:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Het Platform te gebruiken voor illegale activiteiten</li>
                        <li>Malware, virussen of schadelijke code te uploaden</li>
                        <li>Toegang te verkrijgen tot niet-geautoriseerde delen van het systeem</li>
                        <li>Patiëntgegevens te delen zonder toestemming</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">5. Privacy en Gegevensverwerking</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">5.1</p>
                      <p>Hysio verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG) en Nederlandse wetgeving.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">5.2</p>
                      <p>Voor uitgebreide informatie over gegevensverwerking verwijzen wij naar ons <Link href="/privacybeleid" className="text-hysio-mint-dark hover:underline font-medium">Privacybeleid</Link>.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">5.3</p>
                      <p>Alle patiëntgegevens worden versleuteld opgeslagen en verwerkt op servers binnen de Europese Unie.</p>
                    </div>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">6. Financiële Bepalingen</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">6.1</p>
                      <p>Voor het gebruik van het Platform zijn abonnementstarieven van toepassing zoals vermeld op de website.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">6.2</p>
                      <p>Betalingen worden automatisch geïncasseerd volgens de gekozen betalingsfrequentie (maandelijks of jaarlijks).</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">6.3</p>
                      <p>Bij non-betaling behoudt Hysio zich het recht voor de toegang tot het Platform op te schorten.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">6.4</p>
                      <p>Abonnementen kunnen te allen tijde worden opgezegd met inachtneming van de opgegeven opzegtermijn.</p>
                    </div>
                  </div>
                </div>

                {/* Section 7 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">7. Aansprakelijkheid</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">7.1</p>
                      <p>Hysio is niet aansprakelijk voor:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Medische beslissingen gebaseerd op Platform-gegenereerde content</li>
                        <li>Schade door incorrect gebruik van het Platform</li>
                        <li>Verlies van gegevens door externe factoren</li>
                        <li>Indirecte of consequentiële schade</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">7.2</p>
                      <p>De totale aansprakelijkheid van Hysio is beperkt tot het bedrag van de abonnementstarieven betaald in de 12 maanden voorafgaand aan de schade.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">7.3</p>
                      <p>Gebruikers zijn volledig verantwoordelijk voor alle medische beslissingen en dienen alle AI-gegenereerde content te verifiëren alvorens gebruik in de patiëntenzorg.</p>
                    </div>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">8. Intellectueel Eigendom</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">8.1</p>
                      <p>Alle intellectuele eigendomsrechten op het Platform berusten bij Hysio.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">8.2</p>
                      <p>Gebruikers verkrijgen een niet-exclusief, niet-overdraagbaar gebruikersrecht voor de duur van het abonnement.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">8.3</p>
                      <p>Door Gebruikers ingevoerde gegevens blijven eigendom van de Gebruiker, behoudens rechten die Hysio nodig heeft voor dienstverlening.</p>
                    </div>
                  </div>
                </div>

                {/* Section 9 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">9. Beëindiging</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">9.1</p>
                      <p>Beide partijen kunnen de overeenkomst beëindigen conform de overeengekomen opzegtermijn.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">9.2</p>
                      <p>Hysio kan het Account direct opschorten bij schending van deze voorwaarden.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">9.3</p>
                      <p>Na beëindiging blijven gebruikersgegevens 30 dagen beschikbaar voor export, waarna deze worden verwijderd.</p>
                    </div>
                  </div>
                </div>

                {/* Section 10 */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-hysio-deep-green">10. Geschillenregeling</h2>
                  <div className="pl-9 space-y-4">
                    <div className="space-y-2">
                      <p className="font-semibold">10.1</p>
                      <p>Op deze overeenkomst is Nederlands recht van toepassing.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">10.2</p>
                      <p>Alle geschillen worden voorgelegd aan de bevoegde rechter in Nederland.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">10.3</p>
                      <p>Partijen zullen eerst trachten geschillen in onderling overleg op te lossen.</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-hysio-mint/5 border border-hysio-mint/20 rounded-lg p-6 mt-12">
                  <h3 className="font-semibold text-hysio-deep-green mb-4">Contact</h3>
                  <p className="text-hysio-deep-green-900/80 mb-2">
                    Voor vragen over deze Algemene Voorwaarden kunt u contact opnemen via:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><strong>E-mail:</strong> juridisch@hysio.nl</p>
                    <p><strong>Website:</strong> www.hysio.nl</p>
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