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
  Activity,
  ArrowLeft,
  Lightbulb,
  ChevronDown,
  Brain,
  Stethoscope
} from 'lucide-react';

// Comprehensive DCSPH Data Structure based on official sources
interface BodySystem {
  code: string;
  name: string;
  icon: string;
  description: string;
  regions: BodyRegion[];
  color: string;
}

interface BodyRegion {
  code: string;
  name: string;
  fullName: string;
  keywords: string[];
  relevantPathologies: string[];
}

interface PathologyCategory {
  code: string;
  name: string;
  description: string;
  subcategories: Pathology[];
  color: string;
  clinicalContext: string;
}

interface Pathology {
  code: string;
  name: string;
  description: string;
  keywords: string[];
  clinicalNotes: string;
  commonRegions: string[];
}

// Main Body Systems (Level 1)
const bodySystems: BodySystem[] = [
  {
    code: '1X',
    name: 'Hoofd/Hals',
    icon: '🧠',
    description: 'Craniocervicale regio inclusief aangezicht',
    color: 'from-blue-50 to-indigo-50 border-blue-200',
    regions: [
      { code: '10', name: 'Achterzijde hoofd', fullName: 'Achterzijde hoofd', keywords: ['achterhoofd', 'occiput'], relevantPathologies: ['26', '31', '36', '80'] },
      { code: '11', name: 'Aangezicht', fullName: 'Aangezicht', keywords: ['gezicht', 'facial', 'kaak'], relevantPathologies: ['25', '31', '36', '80'] },
      { code: '12', name: 'Regio buccalis', fullName: 'Regio buccalis inclusief de kaak', keywords: ['kaak', 'mond', 'TMJ'], relevantPathologies: ['25', '22', '23', '80'] },
      { code: '13', name: 'Regio cervicalis', fullName: 'Regio cervicalis (oppervlakkige weke delen)', keywords: ['nek', 'cervicaal', 'hals'], relevantPathologies: ['26', '20', '31', '80'] },
      { code: '19', name: 'Gecombineerd', fullName: 'Gecombineerd Hoofd/Hals', keywords: ['hoofd', 'hals', 'gecombineerd'], relevantPathologies: ['26', '80', '31'] }
    ]
  },
  {
    code: '2X',
    name: 'Thorax/Buik',
    icon: '🩺',
    description: 'Thoracale en abdominale regio',
    color: 'from-green-50 to-emerald-50 border-green-200',
    regions: [
      { code: '20', name: 'Thorax anterior', fullName: 'Regio thoracalis anterior (oppervlakkige weke delen)', keywords: ['borst', 'thorax', 'anterior'], relevantPathologies: ['26', '20', '31', '40', '54'] },
      { code: '21', name: 'Thorax dorsalis', fullName: 'Regio thoracalis dorsalis (oppervlakkige weke delen)', keywords: ['rug', 'thoracaal', 'dorsaal'], relevantPathologies: ['26', '20', '31'] },
      { code: '22', name: 'Ribben/Sternum', fullName: 'Ribben/Sternum', keywords: ['ribben', 'sternum', 'borstbeen'], relevantPathologies: ['36', '31', '02'] },
      { code: '23', name: 'Abdomen', fullName: 'Regio abdominalis (oppervlakkige weke delen)', keywords: ['buik', 'abdomen'], relevantPathologies: ['26', '84', '86', '87'] },
      { code: '24', name: 'Lumbalis weke delen', fullName: 'Regio lumbalis (oppervlakkige weke delen)', keywords: ['lenden', 'lumbaal', 'weke delen'], relevantPathologies: ['26', '20', '31'] }
    ]
  },
  {
    code: '3X',
    name: 'Wervelkolom',
    icon: '🦴',
    description: 'Gehele wervelkolom en facetgewrichten',
    color: 'from-purple-50 to-violet-50 border-purple-200',
    regions: [
      { code: '30', name: 'Cervicale WK', fullName: 'Cervicale wervelkolom', keywords: ['cervicaal', 'nekwervels', 'C1-C7'], relevantPathologies: ['27', '38', '26', '23', '75'] },
      { code: '31', name: 'Cervico-thoracale WK', fullName: 'Cervico-thoracale wervelkolom', keywords: ['cervicothoracaal', 'overgang'], relevantPathologies: ['27', '26', '23'] },
      { code: '32', name: 'Thoracale WK', fullName: 'Thoracale wervelkolom', keywords: ['thoracaal', 'borstwervels', 'T1-T12'], relevantPathologies: ['27', '26', '23'] },
      { code: '33', name: 'Thoraco-lumbale WK', fullName: 'Thoraco-lumbale wervelkolom', keywords: ['thoracolumbaal', 'overgang'], relevantPathologies: ['27', '26', '23'] },
      { code: '34', name: 'Lumbale WK', fullName: 'Lumbale wervelkolom', keywords: ['lumbaal', 'lendenwervels', 'L1-L5'], relevantPathologies: ['27', '75', '26', '23'] },
      { code: '35', name: 'Lumbo-sacrale WK', fullName: 'Lumbo-sacrale wervelkolom', keywords: ['lumbosacraal', 'L5-S1'], relevantPathologies: ['27', '75', '26'] },
      { code: '36', name: 'Sacrum/SI', fullName: 'Sacrum en S.I. gewrichten', keywords: ['sacrum', 'SI', 'heiligbeen'], relevantPathologies: ['22', '23', '26', '31'] }
    ]
  },
  {
    code: '4X',
    name: 'Bovenste Extremiteit',
    icon: '💪',
    description: 'Schouder, arm, elleboog, pols en hand',
    color: 'from-orange-50 to-amber-50 border-orange-200',
    regions: [
      { code: '41', name: 'Schouder', fullName: 'Schoudergewricht en schoudergordel', keywords: ['schouder', 'glenohumeraal', 'rotator cuff'], relevantPathologies: ['20', '21', '22', '23', '26', '31'] },
      { code: '42', name: 'Bovenarm', fullName: 'Bovenarm (humerus)', keywords: ['bovenarm', 'humerus', 'biceps', 'triceps'], relevantPathologies: ['26', '33', '36', '31'] },
      { code: '43', name: 'Elleboog', fullName: 'Ellebooggewricht', keywords: ['elleboog', 'epicondylitis', 'tennis', 'golf'], relevantPathologies: ['20', '21', '22', '23', '31'] },
      { code: '44', name: 'Onderarm', fullName: 'Onderarm (radius/ulna)', keywords: ['onderarm', 'radius', 'ulna'], relevantPathologies: ['26', '33', '36', '31'] },
      { code: '45', name: 'Pols', fullName: 'Polsgewricht', keywords: ['pols', 'carpaal', 'tunnel', 'TFCC'], relevantPathologies: ['20', '21', '22', '31', '70'] },
      { code: '46', name: 'Hand', fullName: 'Hand en vingers', keywords: ['hand', 'vingers', 'duim'], relevantPathologies: ['19', '20', '22', '23', '31'] }
    ]
  },
  {
    code: '5X',
    name: 'Bekken/Heup',
    icon: '🦴',
    description: 'Bekken, heupgewricht en omliggende structuren',
    color: 'from-red-50 to-pink-50 border-red-200',
    regions: [
      { code: '50', name: 'Bekken', fullName: 'Bekken (pelvis)', keywords: ['bekken', 'pelvis', 'symphyse'], relevantPathologies: ['31', '36', '26', '89'] },
      { code: '51', name: 'Heupgewricht', fullName: 'Heupgewricht (coxofemorale gewricht)', keywords: ['heup', 'coxofemorale', 'acetabulum'], relevantPathologies: ['20', '21', '22', '23', '31'] },
      { code: '52', name: 'Trochanter', fullName: 'Trochanterregio', keywords: ['trochanter', 'greater', 'bursitis'], relevantPathologies: ['21', '26', '20'] },
      { code: '53', name: 'Lies', fullName: 'Liesregio', keywords: ['lies', 'inguinaal', 'adductoren'], relevantPathologies: ['26', '33', '20'] }
    ]
  },
  {
    code: '6X',
    name: 'Onderste Extremiteit',
    icon: '🦵',
    description: 'Dijbeen, knie, onderbeen, enkel en voet',
    color: 'from-teal-50 to-cyan-50 border-teal-200',
    regions: [
      { code: '61', name: 'Dijbeen', fullName: 'Dijbeen (femur)', keywords: ['dijbeen', 'femur', 'quadriceps', 'hamstrings'], relevantPathologies: ['26', '33', '36', '31'] },
      { code: '62', name: 'Kniegewricht', fullName: 'Kniegewricht', keywords: ['knie', 'patella', 'meniscus', 'kruisbanden'], relevantPathologies: ['20', '21', '22', '31', '01', '03'] },
      { code: '63', name: 'Onderbeen', fullName: 'Onderbeen (tibia/fibula)', keywords: ['onderbeen', 'tibia', 'fibula', 'kuit'], relevantPathologies: ['26', '33', '36', '31'] },
      { code: '72', name: 'Bovenste spronggewricht', fullName: 'Bovenste spronggewricht (inclusief weke delen)', keywords: ['enkel', 'bovenste', 'spronggewricht'], relevantPathologies: ['20', '21', '31', '22'] },
      { code: '73', name: 'Onderste spronggewricht', fullName: 'Onderste spronggewricht (inclusief weke delen)', keywords: ['onderste', 'spronggewricht', 'subtalar'], relevantPathologies: ['31', '22', '23'] },
      { code: '74', name: 'Voetwortel', fullName: 'Voetwortel', keywords: ['voetwortel', 'midfoot'], relevantPathologies: ['22', '23', '31'] },
      { code: '75', name: 'Middenvoet', fullName: 'Middenvoet', keywords: ['middenvoet', 'metatarsaal'], relevantPathologies: ['20', '22', '36', '31'] },
      { code: '76', name: 'Voorvoet', fullName: 'Voorvoet (tenen)', keywords: ['tenen', 'voorvoet', 'hallux'], relevantPathologies: ['22', '23', '31', '19'] },
      { code: '79', name: 'Gecombineerd been', fullName: 'Gecombineerd Knie/Onderbeen/Voet', keywords: ['been', 'gecombineerd'], relevantPathologies: ['26', '31', '80'] }
    ]
  },
  {
    code: '9X',
    name: 'Systemisch/Algemeen',
    icon: '🔄',
    description: 'Systemische en gegeneraliseerde aandoeningen',
    color: 'from-gray-50 to-slate-50 border-gray-200',
    regions: [
      { code: '90', name: 'Één lichaamszijde', fullName: 'Één lichaamszijde', keywords: ['unilateraal', 'hemiplegic'], relevantPathologies: ['72', '76', '78'] },
      { code: '91', name: 'Bovenste lichaamshelft', fullName: 'Bovenste lichaamshelft', keywords: ['bovenste', 'helft'], relevantPathologies: ['72', '73', '78'] },
      { code: '92', name: 'Onderste lichaamshelft', fullName: 'Onderste lichaamshelft', keywords: ['onderste', 'helft'], relevantPathologies: ['72', '76', '78'] },
      { code: '93', name: 'Gegeneraliseerd', fullName: 'Gegeneraliseerd', keywords: ['gegeneraliseerd', 'systemisch'], relevantPathologies: ['90', '91', '92', '93', '94'] },
      { code: '94', name: 'Meer lokalisaties', fullName: 'Meer lokalisaties', keywords: ['meerdere', 'lokalisaties'], relevantPathologies: ['80', '81', '90', '94'] }
    ]
  }
];

// Pathology Categories (Level 2)
const pathologyCategories: PathologyCategory[] = [
  {
    code: '0X',
    name: 'Chirurgische interventies',
    description: 'Post-operatieve en chirurgische aandoeningen',
    color: 'from-red-50 to-rose-50 border-red-200',
    clinicalContext: 'Na operatieve ingrepen aan het bewegingsapparaat',
    subcategories: [
      { code: '00', name: 'Amputatie', description: 'Amputatie van lichaamsdeel', keywords: ['amputatie'], clinicalNotes: 'Revalidatie na amputatie', commonRegions: ['4X', '6X'] },
      { code: '01', name: 'Gewrichtschirurgie', description: 'Gewrichten, uitgezonderd wervelkolom, meniscectomie, synovectomie', keywords: ['gewricht', 'operatie'], clinicalNotes: 'Post-operatieve mobilisatie', commonRegions: ['4X', '5X', '6X'] },
      { code: '02', name: 'Botchirurgie', description: 'Botten, uitgezonderd wervelkolom', keywords: ['bot', 'osteotomie'], clinicalNotes: 'Na botoperaties', commonRegions: ['4X', '6X'] },
      { code: '03', name: 'Meniscectomie', description: 'Meniscectomie, synovectomie', keywords: ['meniscus', 'synovium'], clinicalNotes: 'Specifiek na knieoperaties', commonRegions: ['62'] },
      { code: '04', name: 'Weke delen chirurgie', description: 'Pees, spier, ligament', keywords: ['pees', 'spier', 'ligament'], clinicalNotes: 'Na operaties aan weke delen', commonRegions: ['4X', '6X'] }
    ]
  },
  {
    code: '2X',
    name: 'Inflammatoire/Degeneratieve',
    description: 'Ontstekingen en degeneratieve processen',
    color: 'from-orange-50 to-amber-50 border-orange-200',
    clinicalContext: 'Overbelasting, degeneratie en ontstekingsprocessen',
    subcategories: [
      { code: '20', name: 'Tendinitis', description: 'Epicondylitis / tendinitis / tendovaginitis', keywords: ['tendinitis', 'epicondylitis', 'pees'], clinicalNotes: 'Overbelasting peesstructuren', commonRegions: ['41', '43', '45', '62', '72'] },
      { code: '21', name: 'Bursitis', description: 'Bursitis (niet traumatisch) / capsulitis', keywords: ['bursitis', 'capsulitis', 'slijmbeurs'], clinicalNotes: 'Ontsteking bursae of gewrichtskapsels', commonRegions: ['41', '51', '52', '62'] },
      { code: '22', name: 'Chondropathie', description: 'Chondropathie / arthropathie / meniscuslaesie', keywords: ['kraakbeen', 'meniscus', 'chondropathie'], clinicalNotes: 'Kraakbeenschade', commonRegions: ['41', '43', '51', '62', '72'] },
      { code: '23', name: 'Artrose', description: 'Artrose', keywords: ['artrose', 'slijtage', 'degeneratie'], clinicalNotes: 'Degeneratieve gewrichtsveranderingen', commonRegions: ['30', '34', '41', '43', '51', '62'] },
      { code: '26', name: 'Spier-pees aandoeningen', description: 'Spier-, pees- en fascie aandoeningen', keywords: ['spier', 'fascie', 'trigger points'], clinicalNotes: 'Myofasciale problematiek', commonRegions: ['1X', '2X', '3X', '4X', '6X'] },
      { code: '27', name: 'Discusdegeneratie/HNP', description: 'Discusdegeneratie, coccygodynie / HNP', keywords: ['discus', 'hernia', 'hnp'], clinicalNotes: 'Discuspathologie zonder radiculopathie', commonRegions: ['30', '34', '35'] }
    ]
  },
  {
    code: '3X',
    name: 'Traumatische aandoeningen',
    description: 'Acute traumatische letsels',
    color: 'from-yellow-50 to-orange-50 border-yellow-200',
    clinicalContext: 'Acute trauma, sport- en ongevalletsels',
    subcategories: [
      { code: '31', name: 'Contusie/Distorsie', description: 'Gewrichtcontusie / -distorsie', keywords: ['distorsie', 'verstuiking', 'contusie'], clinicalNotes: 'Acute gewrichtstrauma', commonRegions: ['36', '41', '43', '51', '62', '72'] },
      { code: '32', name: 'Luxatie', description: 'Luxatie (sub-)', keywords: ['luxatie', 'subluxatie'], clinicalNotes: 'Gewrichtsdislocatie', commonRegions: ['41', '43', '45'] },
      { code: '33', name: 'Spier-/peesruptuur', description: 'Spier-, peesruptuur / haematoom', keywords: ['ruptuur', 'scheur', 'haematoom'], clinicalNotes: 'Acute spier-/peesletsels', commonRegions: ['4X', '6X'] },
      { code: '36', name: 'Fracturen', description: 'Fracturen', keywords: ['fractuur', 'breuk', 'bot'], clinicalNotes: 'Botbreuken (conservatief behandeld)', commonRegions: ['1X', '2X', '4X', '6X'] },
      { code: '38', name: 'Whiplash', description: 'Whiplash injury (nektrauma)', keywords: ['whiplash', 'nektrauma'], clinicalNotes: 'Specifiek cervicaal acceleratie-deceleratie trauma', commonRegions: ['30', '13'] }
    ]
  },
  {
    code: '7X',
    name: 'Neurologische aandoeningen',
    description: 'Neurologische en neuromusculaire aandoeningen',
    color: 'from-blue-50 to-indigo-50 border-blue-200',
    clinicalContext: 'Centrale en perifere zenuwstelsel aandoeningen',
    subcategories: [
      { code: '70', name: 'Perifere zenuwaandoening', description: 'Perifere zenuwaandoening', keywords: ['perifeer', 'zenuw', 'neuropathie'], clinicalNotes: 'Perifere zenuwletsels', commonRegions: ['45', '4X', '6X'] },
      { code: '72', name: 'CVA/Centrale parese', description: 'Cerebrovasculair accident / centrale parese', keywords: ['cva', 'beroerte', 'parese'], clinicalNotes: 'Na cerebrovasculaire accidenten', commonRegions: ['90', '91', '92'] },
      { code: '73', name: 'Multiple sclerose/ALS', description: 'Multiple sclerose / ALS/ spinale spieratrofie', keywords: ['ms', 'als', 'spieratrofie'], clinicalNotes: 'Progressieve neurologische aandoeningen', commonRegions: ['93'] },
      { code: '75', name: 'HNP met radiculopathie', description: 'HNP met radiculair syndroom', keywords: ['radiculair', 'uitstraling', 'zenuwwortel'], clinicalNotes: 'Discushernia met zenuwwortelcompressie', commonRegions: ['30', '34', '35'] },
      { code: '76', name: 'Dwarslaesie', description: 'Dwarslaesie (incl. traumatisch en partieel)', keywords: ['dwarslaesie', 'spinaal'], clinicalNotes: 'Complete of incomplete ruggenmergletsel', commonRegions: ['91', '92'] }
    ]
  },
  {
    code: '8X',
    name: 'Functioneel/Psychosomatisch',
    description: 'Functionele en psychosomatische klachten',
    color: 'from-green-50 to-emerald-50 border-green-200',
    clinicalContext: 'Klachten zonder duidelijke structurele pathologie',
    subcategories: [
      { code: '80', name: 'Symptomatologie', description: 'Symptomatologie (nog zonder aanwijsbare pathologie)', keywords: ['symptomatologie', 'onverklaard'], clinicalNotes: 'Klachten zonder duidelijke pathologie', commonRegions: ['1X', '2X', '3X', '4X', '6X'] },
      { code: '81', name: 'Psychosomatisch', description: 'Psychosomatische aandoeningen', keywords: ['psychosomatisch', 'stress'], clinicalNotes: 'Lichamelijke klachten met psychische component', commonRegions: ['1X', '2X', '3X'] }
    ]
  },
  {
    code: '9X',
    name: 'Reumatische aandoeningen',
    description: 'Systemische reumatische en auto-immuun aandoeningen',
    color: 'from-purple-50 to-violet-50 border-purple-200',
    clinicalContext: 'Systemische inflammatoire aandoeningen',
    subcategories: [
      { code: '90', name: 'Reumatoïde arthritis', description: 'Reumatoïde arthritis, chronische reuma', keywords: ['ra', 'reumatoïde', 'chronisch'], clinicalNotes: 'Auto-immuun gewrichtsontsteking', commonRegions: ['93', '4X', '6X'] },
      { code: '92', name: 'Polyarthritis', description: '(Poly-) arthritis', keywords: ['polyarthritis', 'meerdere gewrichten'], clinicalNotes: 'Meerdere gewrichten aangedaan', commonRegions: ['93', '94'] },
      { code: '93', name: 'Spondylitis', description: 'Spondylitis ankylopoetica / ankylose', keywords: ['spondylitis', 'ankylose', 'bechterew'], clinicalNotes: 'Inflammatoire wervelkolomaandoening', commonRegions: ['3X'] }
    ]
  }
];

interface PatternListProps {
  onCodeGenerated?: (code: string, description: string) => void;
  className?: string;
}

export function PatternList({ onCodeGenerated, className = '' }: PatternListProps) {
  // Wizard State Management
  const [currentStep, setCurrentStep] = useState<'system' | 'region' | 'pathology' | 'complete'>('system');
  const [selectedSystem, setSelectedSystem] = useState<BodySystem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PathologyCategory | null>(null);
  const [selectedPathology, setSelectedPathology] = useState<Pathology | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Breadcrumb navigation
  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: 'Lichaamssysteem', active: currentStep === 'system' }];
    if (selectedSystem) {
      crumbs.push({ label: selectedSystem.name, active: currentStep === 'region' });
    }
    if (selectedRegion) {
      crumbs.push({ label: selectedRegion.name, active: currentStep === 'pathology' });
    }
    if (selectedPathology) {
      crumbs.push({ label: 'Voltooid', active: currentStep === 'complete' });
    }
    return crumbs;
  }, [currentStep, selectedSystem, selectedRegion, selectedPathology]);

  // Generate final DCSPH code
  const finalCode = useMemo(() => {
    if (selectedRegion && selectedPathology) {
      return `${selectedRegion.code}${selectedPathology.code}`;
    }
    return null;
  }, [selectedRegion, selectedPathology]);

  const finalDescription = useMemo(() => {
    if (selectedRegion && selectedPathology) {
      return `${selectedPathology.name} - ${selectedRegion.fullName}`;
    }
    return null;
  }, [selectedRegion, selectedPathology]);

  // Copy to clipboard functionality
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

  // Reset wizard
  const resetWizard = () => {
    setCurrentStep('system');
    setSelectedSystem(null);
    setSelectedRegion(null);
    setSelectedCategory(null);
    setSelectedPathology(null);
    setSearchQuery('');
  };

  // Step navigation handlers
  const handleSystemSelect = (system: BodySystem) => {
    setSelectedSystem(system);
    setSelectedRegion(null);
    setSelectedCategory(null);
    setSelectedPathology(null);
    setCurrentStep('region');
  };

  const handleRegionSelect = (region: BodyRegion) => {
    setSelectedRegion(region);
    setSelectedCategory(null);
    setSelectedPathology(null);
    setCurrentStep('pathology');
  };

  const handlePathologySelect = (category: PathologyCategory, pathology: Pathology) => {
    setSelectedCategory(category);
    setSelectedPathology(pathology);
    setCurrentStep('complete');
  };

  // Get relevant pathologies for selected region
  const getRelevantPathologies = () => {
    if (!selectedRegion) return pathologyCategories;

    return pathologyCategories.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(path =>
        selectedRegion.relevantPathologies.includes(path.code) ||
        path.commonRegions.some(region =>
          region === selectedSystem?.code || region === selectedRegion.code
        )
      )
    })).filter(category => category.subcategories.length > 0);
  };

  // Filter systems based on search
  const filteredSystems = useMemo(() => {
    if (!searchQuery) return bodySystems;
    return bodySystems.filter(system =>
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.regions.some(region =>
        region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.keywords.some(keyword =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    );
  }, [searchQuery]);

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
          <Target className="h-5 w-5" />
          Hysio Diagnosecode Gids
          <Badge variant="outline" className="border-emerald-200 text-emerald-700 ml-2">
            Intelligente Klinische Wizard
          </Badge>
        </CardTitle>
        <CardDescription>
          Stap-voor-stap klinische beslisboom voor accurate DCSPH code identificatie
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <span className={`text-sm ${crumb.active ? 'font-semibold text-hysio-deep-green' : 'text-gray-600'}`}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
          {currentStep !== 'system' && (
            <Button variant="ghost" size="sm" onClick={resetWizard} className="ml-auto">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Step 1: Body System Selection */}
        {currentStep === 'system' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-hysio-deep-green">
              <Brain className="h-5 w-5" />
              <span>Stap 1: Selecteer Lichaamssysteem</span>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek lichaamssysteem of regio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-hysio-deep-green/20 focus:border-hysio-deep-green transition-all duration-200 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSystems.map((system) => (
                <Button
                  key={system.code}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all bg-gradient-to-br ${system.color}`}
                  onClick={() => handleSystemSelect(system)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-2xl">{system.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-hysio-deep-green">{system.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{system.description}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500 w-full text-left">
                    {system.regions.length} regio's beschikbaar
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Region Selection */}
        {currentStep === 'region' && selectedSystem && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-hysio-deep-green">
              <MapPin className="h-5 w-5" />
              <span>Stap 2: Specificeer Lichaamsregio</span>
            </div>

            <div className={`bg-gradient-to-r ${selectedSystem.color} p-4 rounded-lg`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedSystem.icon}</span>
                <div>
                  <div className="font-semibold text-hysio-deep-green">{selectedSystem.name}</div>
                  <div className="text-sm text-gray-600">{selectedSystem.description}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedSystem.regions.map((region) => (
                <Button
                  key={region.code}
                  variant="outline"
                  className="w-full p-4 h-auto flex items-start gap-4 text-left hover:shadow-md transition-all"
                  onClick={() => handleRegionSelect(region)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-white/80 px-2 py-1 rounded border">
                        {region.code}XX
                      </code>
                      <span className="font-semibold text-hysio-deep-green">{region.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{region.fullName}</div>
                    <div className="text-xs text-gray-500">
                      Keywords: {region.keywords.join(', ')}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Pathology Selection */}
        {currentStep === 'pathology' && selectedRegion && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-hysio-deep-green">
              <Stethoscope className="h-5 w-5" />
              <span>Stap 3: Selecteer Pathologie/Aandoening</span>
            </div>

            <div className="bg-hysio-mint/10 p-4 rounded-lg border border-hysio-mint/20">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-hysio-deep-green" />
                <span className="font-medium text-hysio-deep-green">Geselecteerde regio:</span>
                <Badge className="bg-hysio-mint text-hysio-deep-green">
                  {selectedRegion.code} - {selectedRegion.name}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              {getRelevantPathologies().map((category) => (
                <div key={category.code} className="space-y-3">
                  <div className={`bg-gradient-to-r ${category.color} p-3 rounded-lg`}>
                    <div className="font-semibold text-gray-800">{category.name}</div>
                    <div className="text-sm text-gray-600">{category.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{category.clinicalContext}</div>
                  </div>

                  <div className="grid gap-2 ml-4">
                    {category.subcategories.map((pathology) => (
                      <Button
                        key={pathology.code}
                        variant="outline"
                        className={`w-full p-3 h-auto flex items-start gap-3 text-left hover:shadow-md transition-all ${category.color}`}
                        onClick={() => handlePathologySelect(category, pathology)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono bg-white/80 px-2 py-1 rounded border">
                              {selectedRegion.code}{pathology.code}
                            </code>
                            <span className="font-semibold">{pathology.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">{pathology.description}</div>
                          <div className="text-xs text-gray-500">{pathology.clinicalNotes}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Final Code Display */}
        {currentStep === 'complete' && finalCode && finalDescription && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span>Stap 4: DCSPH Code Gegenereerd</span>
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
                    <div className="space-y-2 text-sm text-emerald-600">
                      <p>
                        <strong>Samenstelling:</strong> {selectedRegion?.name} ({selectedRegion?.code}) + {selectedPathology?.name} ({selectedPathology?.code})
                      </p>
                      <p>
                        <strong>Klinische context:</strong> {selectedPathology?.clinicalNotes}
                      </p>
                    </div>
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
                      onClick={resetWizard}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Nieuwe Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Verification Notice */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Klinische Verificatie:</p>
                  <p>
                    Controleer altijd of de gegenereerde code overeenkomt met je klinische bevindingen.
                    Deze wizard ondersteunt het beslissingsproces, maar jouw professionele beoordeling blijft leidend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Tip */}
        {currentStep === 'system' && (
          <div className="bg-gradient-to-r from-hysio-mint/10 to-hysio-emerald/10 p-4 rounded-lg border border-hysio-mint/20">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-hysio-mint-dark" />
              <div className="text-sm">
                <span className="font-medium text-hysio-deep-green">Pro tip:</span>
                <span className="text-hysio-deep-green-900/80 ml-2">
                  Gebruik de Chat voor snelle natuurlijke taal invoer, of deze Gids voor systematische exploratie van alle opties.
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}