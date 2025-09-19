// DCSPH (Dutch Classification System for Physical Health) Tables
// Based on official Dutch physiotherapy classification system

export interface LocationCode {
  code: string;
  description: string;
  region: string;
}

export interface PathologyCode {
  code: string;
  description: string;
  category: string;
}

export interface DCSPHCode {
  code: string;
  locationCode: string;
  pathologyCode: string;
  locationDescription: string;
  pathologyDescription: string;
  fullDescription: string;
}

// Table A: Location Codes (Lichaamslocaties)
export const LOCATION_CODES: LocationCode[] = [
  { code: "10", description: "Achterzijde hoofd", region: "hoofd-hals" },
  { code: "11", description: "Aangezicht", region: "hoofd-hals" },
  { code: "12", description: "Regio buccalis inclusief de kaak", region: "hoofd-hals" },
  { code: "13", description: "Regio cervicalis (oppervlakkige weke delen)", region: "hoofd-hals" },
  { code: "19", description: "Gecombineerd ** Hoofd/ Hals", region: "hoofd-hals" },

  { code: "20", description: "Regio thoracalis anterior (oppervlakkige weke delen)", region: "thorax-buik" },
  { code: "21", description: "Regio thoracalis dorsalis (oppervlakkige weke delen)", region: "thorax-buik" },
  { code: "22", description: "Ribben I Sternum", region: "thorax-buik" },
  { code: "23", description: "Regio abdominalis (oppervlakkige weke delen)", region: "thorax-buik" },
  { code: "24", description: "Regio lumbalis (oppervlakkige weke delen)", region: "thorax-buik" },
  { code: "25", description: "Inwendige organen thorax", region: "thorax-buik" },
  { code: "26", description: "Inwendige organen abdomen", region: "thorax-buik" },
  { code: "29", description: "Gecombineerd ** Thorax/ Buik/ Organen", region: "thorax-buik" },

  { code: "30", description: "Cervicale wervelkolom", region: "wervelkolom" },
  { code: "31", description: "Cervico-thoracale wervelkolom", region: "wervelkolom" },
  { code: "32", description: "Thoracale wervelkolom", region: "wervelkolom" },
  { code: "33", description: "Thoraco-lumbale wervelkolom", region: "wervelkolom" },
  { code: "34", description: "Lumbale wervelkolom", region: "wervelkolom" },
  { code: "35", description: "Lumbo-sacrale wervel kolom", region: "wervelkolom" },
  { code: "36", description: "Sacrum en S.I. gewrichten", region: "wervelkolom" },

  { code: "72", description: "Bovenste spronggewricht (inclusief weke delen)", region: "onderste-extremiteit" },
  { code: "73", description: "Onderste spronggewricht (inclusief weke delen)", region: "onderste-extremiteit" },
  { code: "74", description: "Voetwortel", region: "onderste-extremiteit" },
  { code: "75", description: "Middenvoet", region: "onderste-extremiteit" },
  { code: "76", description: "Voorvoet (tenen)", region: "onderste-extremiteit" },
  { code: "79", description: "Gecombineerd ** Knie/ Onderbeen/ Voet", region: "onderste-extremiteit" },

  { code: "90", description: "Één lichaamszijde", region: "gegeneraliseerd" },
  { code: "91", description: "Bovenste lichaamshelft", region: "gegeneraliseerd" },
  { code: "92", description: "Onderste lichaamshelft", region: "gegeneraliseerd" },
  { code: "93", description: "Gegeneraliseerd", region: "gegeneraliseerd" },
  { code: "94", description: "Meer Lokalisaties", region: "gegeneraliseerd" },
];

// Table B: Pathology Codes (Pathologieën)
export const PATHOLOGY_CODES: PathologyCode[] = [
  // Chirurgie
  { code: "00", description: "Amputatie", category: "chirurgie" },
  { code: "01", description: "Gewrichten, uitgezonderd wervelkolom, meniscectomie, synovectomie", category: "chirurgie" },
  { code: "02", description: "Botten, uitgezonderd wervelkolom", category: "chirurgie" },
  { code: "03", description: "Meniscectomie, synovectomie", category: "chirurgie" },
  { code: "04", description: "Pees, spier, ligament", category: "chirurgie" },
  { code: "05", description: "Wervelkolom", category: "chirurgie" },
  { code: "06", description: "Verwijderde osteosynthese materiaal", category: "chirurgie" },
  { code: "08", description: "Postoperatieve contractuur / atrofie", category: "chirurgie" },
  { code: "09", description: "Overige chirurgie van het bewegingsapparaat (incl. nieuwvormingen)", category: "chirurgie" },

  // Orthopedische aandoeningen
  { code: "10", description: "Aseptische botnecrose", category: "orthopedisch" },
  { code: "11", description: "Afwijkingen wervelkolom / bekken", category: "orthopedisch" },
  { code: "12", description: "Skeletafwijkingen (aangeboren)", category: "orthopedisch" },
  { code: "13", description: "Ossificatiestoornis", category: "orthopedisch" },
  { code: "14", description: "Ontstekingen / nieuwvormingen in het skelet", category: "orthopedisch" },
  { code: "15", description: "Pseudo-arthrose / epiphysiolysis / apofysitiden", category: "orthopedisch" },
  { code: "16", description: "Standsafwijkingen extremiteiten", category: "orthopedisch" },
  { code: "17", description: "Afwijkingen gewrichten, uitgezonderd wervelkolom / bekken", category: "orthopedisch" },
  { code: "18", description: "Overige orthopedische aandoeningen zonder chirurgie", category: "orthopedisch" },
  { code: "19", description: "Dupuytren", category: "orthopedisch" },

  // Degeneratieve aandoeningen
  { code: "20", description: "Epicondylitis / tendinitis / tendovaginitis", category: "degeneratief" },
  { code: "21", description: "Bursitis (niet traumatisch) / capsulitis", category: "degeneratief" },
  { code: "22", description: "Chondropathie / arthropathie / meniscuslaesie", category: "degeneratief" },
  { code: "23", description: "Artrose", category: "degeneratief" },
  { code: "24", description: "Osteoporose", category: "degeneratief" },
  { code: "25", description: "Syndroom van Costen", category: "degeneratief" },
  { code: "26", description: "Spier-, pees- en fascie aandoeningen", category: "degeneratief" },
  { code: "27", description: "Discusdegeneratie, coccygodynie / HNP", category: "degeneratief" },
  { code: "28", description: "Sudeckse a(dys)trofie", category: "degeneratief" },

  // Traumatische aandoeningen
  { code: "31", description: "Gewrichtcontusie / -distorsie", category: "traumatisch" },
  { code: "32", description: "Luxatie (sub-)", category: "traumatisch" },
  { code: "33", description: "Spier-, peesruptuur / haematoom", category: "traumatisch" },
  { code: "34", description: "Hydrops / haemarthos / haematoom", category: "traumatisch" },
  { code: "35", description: "Myositis ossificans / adhaesies / traumatische bursitis", category: "traumatisch" },
  { code: "36", description: "Fracturen", category: "traumatisch" },
  { code: "38", description: "Whiplash injury (nektrauma)", category: "traumatisch" },
  { code: "39", description: "Status na brandwonden", category: "traumatisch" },

  // Cardiovasculaire aandoeningen
  { code: "40", description: "Hartaandoeningen (niet genoemd onder 41 t/m 49)", category: "cardiovasculair" },
  { code: "41", description: "Myocard-infarct (AMI)", category: "cardiovasculair" },
  { code: "42", description: "Status na coronary artery bypassoperatie (CABG)", category: "cardiovasculair" },
  { code: "43", description: "Status na percutane transluminale coronair angioplastiek (PTCA)", category: "cardiovasculair" },
  { code: "44", description: "Status na hartklepoperatie", category: "cardiovasculair" },
  { code: "45", description: "Status na operatief gecorrigeerde congenitale afwijkingen", category: "cardiovasculair" },
  { code: "46", description: "Lymfevataandoeningen / oedeem", category: "cardiovasculair" },
  { code: "47", description: "Ulcus / decubitus / necrose", category: "cardiovasculair" },
  { code: "48", description: "Algemeen vaatlijden, circulatiestoornissen", category: "cardiovasculair" },

  // Respiratoire aandoeningen
  { code: "51", description: "Aangeboren afwijkingen tractus respiratorius", category: "respiratoir" },
  { code: "52", description: "Pneumothorax / longoedeem", category: "respiratoir" },
  { code: "53", description: "Luchtweginfecties", category: "respiratoir" },
  { code: "54", description: "COPD", category: "respiratoir" },
  { code: "55", description: "Emfyseem", category: "respiratoir" },
  { code: "56", description: "Interstitiële longaandoeningen incl. sarcoïdose", category: "respiratoir" },

  // Endocrinologische en algemene aandoeningen
  { code: "60", description: "Diabetes mellitus", category: "endocrinologisch" },
  { code: "61", description: "Immuniteitsstoornissen", category: "endocrinologisch" },
  { code: "62", description: "Spastisch colon", category: "endocrinologisch" },
  { code: "63", description: "Covid-19", category: "endocrinologisch" },
  { code: "64", description: "Adipositas", category: "endocrinologisch" },
  { code: "65", description: "Overige-, erfelijke aandoeningen", category: "endocrinologisch" },
  { code: "68", description: "Chirurgie niet bewegingsapparaat (niet cardiochirurgie)", category: "endocrinologisch" },
  { code: "69", description: "Nieuwvormingen zonder chirurgie", category: "endocrinologisch" },

  // Neurologische aandoeningen
  { code: "70", description: "Perifere zenuwaandoening", category: "neurologisch" },
  { code: "71", description: "Cerebellaire aandoeningen / encephalopathieën", category: "neurologisch" },
  { code: "72", description: "Cerebrovasculair accident / centrale parese", category: "neurologisch" },
  { code: "73", description: "Multiple sclerose / ALS/ spinale spieratrofie", category: "neurologisch" },
  { code: "74", description: "Parkinson / extrapyramidale aandoening", category: "neurologisch" },
  { code: "75", description: "HNP met radiculair syndroom", category: "neurologisch" },
  { code: "76", description: "Dwarslaesie (incl. traumatisch en partieel)", category: "neurologisch" },
  { code: "77", description: "Neurotraumata", category: "neurologisch" },
  { code: "78", description: "Overige neurologische aandoeningen / neuropathieën /ziekten van neurologische oorsprong", category: "neurologisch" },
  { code: "79", description: "Psychomotore retardatie / ontwikkelingsstoornissen", category: "neurologisch" },

  // Psychosomatische aandoeningen
  { code: "80", description: "Symptomatologie (nog zonder aanwijsbare pathologie)", category: "psychosomatisch" },
  { code: "81", description: "Psychosomatische aandoeningen", category: "psychosomatisch" },
  { code: "82", description: "Hyperventilatie zonder longpathologie", category: "psychosomatisch" },

  // Specialistische aandoeningen
  { code: "83", description: "Proctologie", category: "specialistisch" },
  { code: "84", description: "M.D.L. (Maag, Darm, Lever)", category: "specialistisch" },
  { code: "85", description: "Seksuologie", category: "specialistisch" },
  { code: "86", description: "Urine incontinentie, incontinentie urinae", category: "specialistisch" },
  { code: "87", description: "Fecale incontinentie, incontinentie alvi", category: "specialistisch" },
  { code: "88", description: "Urologie", category: "specialistisch" },
  { code: "89", description: "Gynaecologie", category: "specialistisch" },

  // Reumatische aandoeningen
  { code: "90", description: "Reumatoïde arthritis, chronische reuma", category: "reumatisch" },
  { code: "91", description: "Juveniel reuma", category: "reumatisch" },
  { code: "92", description: "(Poly-) arthritis", category: "reumatisch" },
  { code: "93", description: "Spondylitis ankylopoetica / ankylose", category: "reumatisch" },
  { code: "94", description: "Overige reumatische- en collageenaandoeningen", category: "reumatisch" },

  // Huidaandoeningen
  { code: "95", description: "Littekenweefsel", category: "huid" },
  { code: "96", description: "Sclerodermie", category: "huid" },
  { code: "97", description: "Psoriasis", category: "huid" },
  { code: "98", description: "Hyperhydrosis", category: "huid" },
  { code: "99", description: "Overige huidaandoeningen", category: "huid" },
];

// Helper functions for code lookup
export function getLocationByCode(code: string): LocationCode | undefined {
  return LOCATION_CODES.find(loc => loc.code === code);
}

export function getPathologyByCode(code: string): PathologyCode | undefined {
  return PATHOLOGY_CODES.find(path => path.code === code);
}

export function isValidDCSPHCode(code: string): boolean {
  if (code.length !== 4) return false;

  const locationCode = code.substring(0, 2);
  const pathologyCode = code.substring(2, 4);

  const location = getLocationByCode(locationCode);
  const pathology = getPathologyByCode(pathologyCode);

  return !!(location && pathology);
}

export function buildDCSPHCode(locationCode: string, pathologyCode: string): DCSPHCode | null {
  const location = getLocationByCode(locationCode);
  const pathology = getPathologyByCode(pathologyCode);

  if (!location || !pathology) return null;

  return {
    code: locationCode + pathologyCode,
    locationCode,
    pathologyCode,
    locationDescription: location.description,
    pathologyDescription: pathology.description,
    fullDescription: `${pathology.description} - ${location.description}`
  };
}