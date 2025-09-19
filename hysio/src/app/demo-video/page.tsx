'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Stethoscope } from 'lucide-react';

export default function DemoVideo() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-hysio-mint">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-hysio-mint/20 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                <span className="text-hysio-deep-green font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold text-hysio-deep-green">Hysio</span>
            </div>

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

      {/* Demo Video Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-hysio-off-white border-white/20 shadow-xl max-w-4xl mx-auto">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-hysio-mint/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Stethoscope className="h-10 w-10 text-hysio-mint-dark" />
              </div>
              <CardTitle className="text-4xl font-bold text-hysio-deep-green mb-4">
                Hysio in Actie
              </CardTitle>
              <p className="text-xl text-hysio-deep-green-900/80 max-w-2xl mx-auto">
                Zie hoe Hysio uw fysiotherapie-workflow transformeert. Van spraak naar professioneel verslag in seconden.
              </p>
            </CardHeader>

            <CardContent className="p-12">
              {/* Video Placeholder */}
              <div className="bg-gradient-to-br from-hysio-mint/10 to-hysio-emerald/10 rounded-2xl p-16 border-2 border-dashed border-hysio-mint/40 text-center mb-8">
                <div className="w-24 h-24 bg-hysio-mint/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Play className="h-12 w-12 text-hysio-mint-dark" />
                </div>
                <h3 className="text-2xl font-bold text-hysio-deep-green mb-4">
                  Video komt binnenkort beschikbaar
                </h3>
                <p className="text-hysio-deep-green-900/70 mb-6 max-w-lg mx-auto">
                  Hier wordt binnenkort een uitgebreide demonstratie geplaatst van alle Hysio-functies in actie.
                </p>
                <div className="text-sm text-hysio-deep-green-900/50 bg-white/50 rounded-lg p-4 max-w-md mx-auto">
                  <strong>Video-embed gebied</strong><br />
                  Afmetingen: 16:9 formaat<br />
                  Inhoud: Complete Hysio workflow demonstratie
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-hysio-mint/20 text-center">
                  <div className="text-2xl font-bold text-hysio-mint-dark mb-2">5 min</div>
                  <div className="text-sm text-hysio-deep-green">Complete demo</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-hysio-mint/20 text-center">
                  <div className="text-2xl font-bold text-hysio-emerald mb-2">3 stappen</div>
                  <div className="text-sm text-hysio-deep-green">Spreek, denk, controleer</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-hysio-mint/20 text-center">
                  <div className="text-2xl font-bold text-hysio-deep-green mb-2">Live</div>
                  <div className="text-sm text-hysio-deep-green">Echte workflow</div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/scribe')}
                  className="bg-hysio-deep-green hover:bg-hysio-deep-green-900 text-white font-semibold text-lg px-8 py-6 h-auto mr-4"
                >
                  Probeer Hysio Nu
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/')}
                  className="border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white font-semibold text-lg px-8 py-6 h-auto"
                >
                  Meer Informatie
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}