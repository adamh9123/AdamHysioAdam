'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowRight, Stethoscope, Clock, Shield, Mail, Bot } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-hysio-cream/30 via-white to-hysio-mint/10">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-hysio-deep-green" />
          </div>
          <h1 className="text-5xl font-bold text-hysio-deep-green mb-4">
            Hysio Medical Scribe
          </h1>
          <p className="text-xl text-hysio-deep-green-900/80 max-w-2xl mx-auto leading-relaxed">
            AI-ondersteunde documentatie voor fysiotherapeuten. 
            Professioneel, efficiënt en conform Nederlandse richtlijnen.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-hysio-mint/20 hover:border-hysio-mint/50 transition-colors">
            <CardHeader className="text-center">
              <Stethoscope size={32} className="text-hysio-deep-green mx-auto mb-3" />
              <CardTitle className="text-hysio-deep-green">Gestructureerde Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                5-staps intake workflow met PHSB anamnese, AI-ondersteund onderzoeksplan en klinische conclusies.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-hysio-mint/20 hover:border-hysio-mint/50 transition-colors">
            <CardHeader className="text-center">
              <Clock size={32} className="text-hysio-deep-green mx-auto mb-3" />
              <CardTitle className="text-hysio-deep-green">SOEP Vervolgconsulten</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Snelle SOEP documentatie voor vervolgconsulten met voortgangsevaluatie en behandelplan aanpassingen.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-hysio-mint/20 hover:border-hysio-mint/50 transition-colors">
            <CardHeader className="text-center">
              <Shield size={32} className="text-hysio-deep-green mx-auto mb-3" />
              <CardTitle className="text-hysio-deep-green">Conform Richtlijnen</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Volledig volgens KNGF en DTF richtlijnen met automatische rode vlagen detectie.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section - All Hysio AI Agents */}
        <Card className="border-2 border-hysio-mint/30 bg-hysio-mint/5">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-semibold text-hysio-deep-green mb-4">
              Hysio AI Ecosystem
            </h2>
            <p className="text-hysio-deep-green-900/70 mb-8 max-w-2xl mx-auto">
              Toegang tot alle AI-ondersteunde modules voor complete fysiotherapie workflow
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Button
                size="lg"
                onClick={() => router.push('/scribe')}
                className="text-base px-6 py-4 h-auto flex flex-col gap-2 bg-hysio-deep-green hover:bg-hysio-deep-green/90"
              >
                <Stethoscope size={24} />
                <span>Medical Scribe</span>
                <span className="text-xs opacity-80">Intake & Consult</span>
              </Button>

              <Button
                size="lg"
                onClick={() => router.push('/smartmail-demo')}
                className="text-base px-6 py-4 h-auto flex flex-col gap-2 bg-hysio-mint hover:bg-hysio-mint/90 text-white"
              >
                <Mail size={24} />
                <span>Hysio SmartMail</span>
                <span className="text-xs opacity-80">AI Email Generatie</span>
              </Button>

              <Button
                size="lg"
                onClick={() => router.push('/assistant')}
                className="text-base px-6 py-4 h-auto flex flex-col gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Bot size={24} />
                <span>Hysio Assistant</span>
                <span className="text-xs opacity-80">AI Chat & Hulp</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="text-base px-6 py-4 h-auto flex flex-col gap-2 border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white"
              >
                <FileText size={24} />
                <span>Dashboard</span>
                <span className="text-xs opacity-60">Overzicht & Analytics</span>
              </Button>
            </div>

            <p className="text-sm text-hysio-deep-green-900/60 mt-6">
              ✨ Nieuw: SmartMail nu met Ultra Think document-context voor superieure AI emails
            </p>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-hysio-deep-green-900/60 mb-2">
            Hysio Medical Scribe - Professional AI Assistant for Physiotherapy Documentation
          </p>
          <p className="text-xs text-hysio-deep-green-900/50">
            Compliant with Dutch physiotherapy guidelines (KNGF, DTF) • All AI-generated content must be verified by licensed physiotherapists
          </p>
        </div>
      </div>
    </div>
  );
}
