import { MarketingNavigation } from '@/components/ui/marketing-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones, Calendar } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-hysio-mint">
      <MarketingNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-hysio-mint to-hysio-mint/80">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-hysio-deep-green mb-6">
              Contact Opnemen
            </h1>
            <p className="text-xl text-hysio-deep-green/80 mb-8 leading-relaxed">
              Heeft u vragen over Hysio? Wij staan klaar om u te helpen.
              Neem contact op en ontdek hoe wij uw fysiotherapiepraktijk kunnen ondersteunen.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-hysio-off-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-hysio-mint/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-hysio-deep-green flex items-center gap-3">
                    <MessageSquare className="h-6 w-6" />
                    Stuur ons een bericht
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                          Voornaam *
                        </label>
                        <Input
                          type="text"
                          placeholder="Uw voornaam"
                          className="border-hysio-mint/30 focus:border-hysio-mint"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                          Achternaam *
                        </label>
                        <Input
                          type="text"
                          placeholder="Uw achternaam"
                          className="border-hysio-mint/30 focus:border-hysio-mint"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                        E-mailadres *
                      </label>
                      <Input
                        type="email"
                        placeholder="uw.email@praktijk.nl"
                        className="border-hysio-mint/30 focus:border-hysio-mint"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                        Telefoonnummer
                      </label>
                      <Input
                        type="tel"
                        placeholder="+31 6 1234 5678"
                        className="border-hysio-mint/30 focus:border-hysio-mint"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                        Praktijknaam
                      </label>
                      <Input
                        type="text"
                        placeholder="Naam van uw fysiotherapiepraktijk"
                        className="border-hysio-mint/30 focus:border-hysio-mint"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                        Onderwerp *
                      </label>
                      <select className="w-full p-3 border border-hysio-mint/30 rounded-md focus:border-hysio-mint focus:outline-none">
                        <option value="">Selecteer een onderwerp</option>
                        <option value="demo">Demo aanvragen</option>
                        <option value="pricing">Vragen over prijzen</option>
                        <option value="technical">Technische ondersteuning</option>
                        <option value="integration">Integratie mogelijkheden</option>
                        <option value="other">Anders</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-hysio-deep-green mb-2">
                        Bericht *
                      </label>
                      <Textarea
                        placeholder="Vertel ons over uw vraag of hoe wij u kunnen helpen..."
                        rows={5}
                        className="border-hysio-mint/30 focus:border-hysio-mint"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green font-semibold"
                    >
                      Bericht Verzenden
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Contact Details */}
                <Card className="border-hysio-mint/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-hysio-deep-green">
                      Contactgegevens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-hysio-mint/20 rounded-lg">
                        <Mail className="h-5 w-5 text-hysio-deep-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-hysio-deep-green">E-mail</h3>
                        <p className="text-hysio-deep-green/70">info@hysio.nl</p>
                        <p className="text-hysio-deep-green/70">support@hysio.nl</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-hysio-mint/20 rounded-lg">
                        <Phone className="h-5 w-5 text-hysio-deep-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-hysio-deep-green">Telefoon</h3>
                        <p className="text-hysio-deep-green/70">+31 20 123 4567</p>
                        <p className="text-hysio-deep-green/60 text-sm">Ma-vr: 09:00 - 17:00</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-hysio-mint/20 rounded-lg">
                        <MapPin className="h-5 w-5 text-hysio-deep-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-hysio-deep-green">Adres</h3>
                        <p className="text-hysio-deep-green/70">
                          Innovatiestraat 123<br />
                          1000 AB Amsterdam<br />
                          Nederland
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Options */}
                <Card className="border-hysio-mint/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-hysio-deep-green">
                      Andere Manieren om Contact Op te Nemen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-hysio-mint/10 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-hysio-deep-green" />
                        <h3 className="font-semibold text-hysio-deep-green">Demo Inplannen</h3>
                      </div>
                      <p className="text-hysio-deep-green/70 text-sm mb-3">
                        Plan een persoonlijke demo in om Hysio in actie te zien.
                      </p>
                      <Button
                        size="sm"
                        className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green"
                      >
                        Plan Demo
                      </Button>
                    </div>

                    <div className="p-4 bg-hysio-mint/10 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Headphones className="h-5 w-5 text-hysio-deep-green" />
                        <h3 className="font-semibold text-hysio-deep-green">Live Chat</h3>
                      </div>
                      <p className="text-hysio-deep-green/70 text-sm mb-3">
                        Heeft u een snelle vraag? Chat direct met onze experts.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white"
                      >
                        Start Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Office Hours */}
                <Card className="border-hysio-mint/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-hysio-deep-green flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      Openingstijden
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-hysio-deep-green/70">Maandag - Vrijdag</span>
                        <span className="text-hysio-deep-green font-medium">09:00 - 17:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-hysio-deep-green/70">Zaterdag</span>
                        <span className="text-hysio-deep-green font-medium">Gesloten</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-hysio-deep-green/70">Zondag</span>
                        <span className="text-hysio-deep-green font-medium">Gesloten</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-hysio-mint/10 rounded-lg">
                      <p className="text-hysio-deep-green/70 text-xs">
                        Voor spoedeisende technische ondersteuning zijn we 24/7 bereikbaar via ons ticketsysteem.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-hysio-deep-green text-center mb-12">
              Veelgestelde Vragen
            </h2>
            <div className="space-y-4">
              <Card className="border-hysio-mint/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-hysio-deep-green mb-2">
                    Hoe snel kan ik Hysio implementeren in mijn praktijk?
                  </h3>
                  <p className="text-hysio-deep-green/70">
                    Onboarding duurt gemiddeld 2 werkdagen. Binnen 1 week bent u volledig operationeel
                    met meetbare tijdbesparingen.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-hysio-deep-green mb-2">
                    Wat is de verwachte ROI van Hysio voor mijn praktijk?
                  </h3>
                  <p className="text-hysio-deep-green/70">
                    Gemiddeld 12 uur tijdsbesparing per week per therapeut, resulterend in
                    25-40% verhoogde patiëntcapaciteit binnen 3 maanden.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-hysio-mint/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-hysio-deep-green mb-2">
                    Hoe zit het met training van mijn team?
                  </h3>
                  <p className="text-hysio-deep-green/70">
                    Persoonlijke training ter plaatse of online, inclusief change management
                    ondersteuning voor optimale acceptatie door uw team.
                  </p>
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