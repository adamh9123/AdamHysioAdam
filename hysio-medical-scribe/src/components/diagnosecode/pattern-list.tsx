'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  ChevronRight,
  Copy,
  CheckCircle,
  Search,
  MapPin,
  Activity
} from 'lucide-react';

// Extended pattern data based on the JSON file
const bodyRegions = [
  { code: '10', name: 'Hoofd/Hals', icon: '👤', keywords: ['hoofd', 'hals', 'nek', 'cervicaal', 'kaak', 'aangezicht'] },
  { code: '20', name: 'Thorax/Borstkas', icon: '🫁', keywords: ['thorax', 'borst', 'ribben', 'sternum'] },
  { code: '30', name: 'Wervelkolom', icon: '🦴', keywords: ['wervelkolom', 'rug', 'lumbaal', 'thoracaal', 'cervicaal'] },
  { code: '40', name: 'Bovenste Extremiteit', icon: '💪', keywords: ['schouder', 'arm', 'elleboog', 'pols', 'hand'] },
  { code: '50', name: 'Bekken/Heup', icon: '🦴', keywords: ['bekken', 'heup', 'lies', 'SI-gewricht'] },
  { code: '60', name: 'Onderste Extremiteit', icon: '🦵', keywords: ['been', 'knie', 'enkel', 'voet', 'dijbeen'] },
];

const commonPathologies = [
  { code: '20', name: 'Tendinitis', description: 'Peesontsteking', keywords: ['tendinitis', 'peesontsteking', 'pees'], color: 'bg-red-50 border-red-200' },
  { code: '21', name: 'Bursitis', description: 'Slijmbeursontsteking', keywords: ['bursitis', 'slijmbeurs'], color: 'bg-orange-50 border-orange-200' },
  { code: '22', name: 'Chondropathie', description: 'Kraakbeenaandoening', keywords: ['chondropathie', 'kraakbeen', 'meniscus'], color: 'bg-blue-50 border-blue-200' },
  { code: '23', name: 'Arthrose', description: 'Gewrichtsslijtage', keywords: ['arthrose', 'slijtage', 'artrose'], color: 'bg-purple-50 border-purple-200' },
  { code: '27', name: 'HNP', description: 'Hernia nuclei pulposi', keywords: ['hnp', 'hernia', 'discus'], color: 'bg-green-50 border-green-200' },
  { code: '31', name: 'Distorsie', description: 'Gewrichtcontusie/distorsie', keywords: ['distorsie', 'verstuiking', 'contusie'], color: 'bg-yellow-50 border-yellow-200' },
  { code: '36', name: 'Fractuur', description: 'Botbreuk', keywords: ['fractuur', 'breuk', 'bot'], color: 'bg-gray-50 border-gray-200' },
];

interface PatternListProps {
  onCodeGenerated?: (code: string, description: string) => void;
  className?: string;
}

export function PatternList({ onCodeGenerated, className = '' }: PatternListProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPathology, setSelectedPathology] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generate final DCSPH code
  const finalCode = useMemo(() => {
    if (selectedRegion && selectedPathology) {
      return `${selectedRegion}${selectedPathology}`;
    }
    return null;
  }, [selectedRegion, selectedPathology]);

  const finalDescription = useMemo(() => {
    if (selectedRegion && selectedPathology) {
      const region = bodyRegions.find(r => r.code === selectedRegion);
      const pathology = commonPathologies.find(p => p.code === selectedPathology);
      return `${region?.name} - ${pathology?.name}`;
    }
    return null;
  }, [selectedRegion, selectedPathology]);

  const copyToClipboard = async (code: string, description: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      onCodeGenerated?.(code, description);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetSelection = () => {
    setSelectedRegion(null);
    setSelectedPathology(null);
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
          <Target className="h-5 w-5" />
          Hysio Patronenlijst
          <Badge variant="outline" className="border-emerald-200 text-emerald-700 ml-2">
            Klinische Wizard
          </Badge>
        </CardTitle>
        <CardDescription>
          Interactieve gids voor snelle DCSPH code identificatie via klinisch redeneren
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${selectedRegion ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedRegion ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100'}`}>
                {selectedRegion ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span>Lichaamsregio</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <div className={`flex items-center gap-2 ${selectedPathology ? 'text-emerald-600' : selectedRegion ? 'text-hysio-deep-green' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedPathology ? 'bg-emerald-100 text-emerald-600' : selectedRegion ? 'bg-hysio-mint/20 text-hysio-deep-green' : 'bg-gray-100'}`}>
                {selectedPathology ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span>Pathologie</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <div className={`flex items-center gap-2 ${finalCode ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${finalCode ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100'}`}>
                {finalCode ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <span>DCSPH Code</span>
            </div>
          </div>

          {selectedRegion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Step 1: Body Region Selection */}
        {!selectedRegion && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-hysio-deep-green">
              <MapPin className="h-5 w-5" />
              <span>Stap 1: Selecteer Lichaamsregio</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bodyRegions.map((region) => (
                <Button
                  key={region.code}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center gap-2 hover:bg-hysio-mint/10 hover:border-hysio-mint transition-all ${
                    hoveredItem === region.code ? 'ring-2 ring-hysio-mint/20' : ''
                  }`}
                  onMouseEnter={() => setHoveredItem(region.code)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedRegion(region.code)}
                >
                  <span className="text-2xl">{region.icon}</span>
                  <div className="text-center">
                    <div className="font-medium text-hysio-deep-green">{region.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {region.keywords.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pathology Selection */}
        {selectedRegion && !selectedPathology && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-hysio-deep-green">
              <Activity className="h-5 w-5" />
              <span>Stap 2: Selecteer Pathologie/Aandoening</span>
            </div>

            <div className="bg-hysio-mint/10 p-3 rounded-lg border border-hysio-mint/20">
              <div className="text-sm">
                <span className="font-medium text-hysio-deep-green">Gekozen regio:</span>
                <Badge className="ml-2 bg-hysio-mint text-hysio-deep-green">
                  {bodyRegions.find(r => r.code === selectedRegion)?.name}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {commonPathologies.map((pathology) => (
                <Button
                  key={pathology.code}
                  variant="outline"
                  className={`w-full p-4 h-auto flex items-start gap-4 text-left hover:shadow-md transition-all ${pathology.color}`}
                  onClick={() => setSelectedPathology(pathology.code)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-white/80 px-2 py-1 rounded">
                        {selectedRegion}{pathology.code}
                      </code>
                      <span className="font-semibold">{pathology.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{pathology.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Keywords: {pathology.keywords.join(', ')}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Final Code Display */}
        {finalCode && finalDescription && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span>Stap 3: DCSPH Code Gegenereerd</span>
            </div>

            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div>
                    <code className="text-3xl font-bold text-emerald-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-200">
                      {finalCode}
                    </code>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                      {finalDescription}
                    </h3>
                    <p className="text-emerald-600 text-sm">
                      Code samenstelling: Locatie {selectedRegion} + Pathologie {selectedPathology}
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => copyToClipboard(finalCode, finalDescription)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={copiedCode === finalCode}
                    >
                      {copiedCode === finalCode ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Gekopieerd!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Kopieer Code
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={resetSelection}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Nieuwe Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Klinische Verificatie:</p>
                  <p>
                    Controleer altijd of de gegenereerde code overeenkomt met je klinische bevindingen.
                    Deze wizard helpt bij het snelle vinden van codes, maar jouw professionele beoordeling blijft leidend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Search Hint */}
        {!selectedRegion && (
          <div className="bg-gradient-to-r from-hysio-mint/10 to-hysio-emerald/10 p-4 rounded-lg border border-hysio-mint/20">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-hysio-mint-dark" />
              <div className="text-sm">
                <span className="font-medium text-hysio-deep-green">Pro tip:</span>
                <span className="text-hysio-deep-green-900/80 ml-2">
                  Voor complexere gevallen, gebruik de AI-powered zoekfunctie hierboven voor natuurlijke taalverwerking.
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}