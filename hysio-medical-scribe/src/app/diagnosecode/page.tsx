'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiagnosisCodeFinder } from '@/components/diagnosecode/diagnosis-code-finder';
import { PatternList } from '@/components/diagnosecode/pattern-list';
import {
  ArrowLeft,
  Brain,
  Zap,
  CheckCircle,
  Lightbulb,
  FileText,
  Target,
  TrendingUp
} from 'lucide-react';

export default function DiagnosisCodePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-hysio-mint">
      {/* Navigation Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-hysio-mint/20 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-hysio-deep-green hover:text-hysio-mint-dark"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>

              <div className="h-6 w-px bg-gray-300" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-hysio-mint/20 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-hysio-deep-green" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-hysio-deep-green">Hysio Diagnosecode</h1>
                  <p className="text-sm text-hysio-deep-green-900/70">AI-aangedreven DCSPH codering</p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-hysio-mint/30 text-hysio-deep-green">
                <Zap className="w-3 h-3 mr-1" />
                Actief
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-to-br from-white to-hysio-mint/5 border-hysio-mint/20">
              <CardContent className="p-8">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-bold text-hysio-deep-green mb-4">
                    Van klacht naar DCSPH code in seconden
                  </h2>
                  <p className="text-lg text-hysio-deep-green-900/80 mb-6">
                    Beschrijf de patiëntklacht in natuurlijke taal en ontvang accurate,
                    gevalideerde DCSPH diagnose codes met klinische rationale.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/70">
                      <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                      <span>DCSPH Conform</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/70">
                      <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                      <span>AI-gevalideerd</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900/70">
                      <CheckCircle className="h-4 w-4 text-hysio-emerald" />
                      <span>Klinische rationale</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Code Finder */}
            <DiagnosisCodeFinder
              onCodeSelected={(code) => {
                console.log('Code selected:', code);
                // Handle code selection - could integrate with other systems
              }}
              className="shadow-lg"
            />

            {/* Pattern List - Interactive Clinical Reasoning Tool */}
            <PatternList
              onCodeGenerated={(code, description) => {
                console.log('Pattern-generated code:', code, description);
                // Could integrate with DiagnosisCodeFinder or other systems
              }}
              className="shadow-lg"
            />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* How It Works - Vertical Guide */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-hysio-deep-green flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Hoe werkt het?
                </CardTitle>
                <CardDescription>
                  AI-gedreven DCSPH codering in 3 stappen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-hysio-mint/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-hysio-mint-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-1">1. Beschrijf</h3>
                    <p className="text-sm text-gray-600">
                      Type de klacht in natuurlijke taal, zoals je normaal zou documenteren
                    </p>
                  </div>
                </div>

                <div className="w-px h-4 bg-gradient-to-b from-hysio-mint/30 to-transparent ml-5"></div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-hysio-emerald/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-hysio-emerald" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-1">2. Analyseer</h3>
                    <p className="text-sm text-gray-600">
                      AI analyseert en combineert locatie- en pathologiecodes volgens DCSPH systematiek
                    </p>
                  </div>
                </div>

                <div className="w-px h-4 bg-gradient-to-b from-hysio-emerald/30 to-transparent ml-5"></div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-1">3. Selecteer</h3>
                    <p className="text-sm text-gray-600">
                      Kies uit top 3 suggesties met rationale en kopieer direct naar je EPD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Tips voor Nauwkeurigheid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 text-sm text-blue-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Specificeer de exacte locatie (bijv. &quot;linkerknie&quot; i.p.v. &quot;knie&quot;)</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Vermeld het ontstaan (trauma, overbelasting, geleidelijk)</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Beschrijf symptomen (pijn, zwelling, beperking)</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gebruik medische terminologie waar mogelijk</span>
                  </div>

                  <div className="bg-blue-100 p-3 rounded-lg mt-4">
                    <div className="text-xs text-blue-700 font-medium mb-1">Pro Tip:</div>
                    <div className="text-xs text-blue-600">
                      Combineer AI-zoeken met de Patronenlijst voor complexe gevallen
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-hysio-mint/30 text-hysio-deep-green hover:bg-hysio-mint/10"
                onClick={() => router.push('/scribe')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Naar Medical Scribe
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-hysio-mint/30 text-hysio-deep-green hover:bg-hysio-mint/10"
                onClick={() => router.push('/dashboard')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-hysio-mint/20 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-hysio-deep-green-900/60">
            <p>Hysio Diagnosecode is onderdeel van de Hysio AI Toolkit</p>
            <p className="mt-1">
              Officiële DCSPH systematiek • AI-gevalideerde suggesties • Klinische precisie
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}