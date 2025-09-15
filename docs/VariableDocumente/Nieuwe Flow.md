Prompt voor Developer: Definitieve UI/UX Architectuur voor de Intake Workflow
Context & Hoofddoel: Deze prompt bevat de finale, aangescherpte specificaties om de UI/UX van de gehele Hysio Intake workflow te perfectioneren. De focus ligt op het correct implementeren van de nieuwe layout voor Fase 2 (Onderzoek) en het realiseren van een consistente, globale navigatiestructuur. Voer de onderstaande instructies exact uit om de workflow definitief te maken.
1. Specificaties voor Fase 2: Lichamelijk Onderzoek (Definitieve Layout)
Doel: Implementeer de vernieuwde, logische twee-panelen-indeling voor de onderzoeksfase.
A. Linkerpaneel (Output & Begeleiding):
•	Componenten: Dit paneel bevat twee componenten in de volgende verticale volgorde:
1.	Onderzoeksbevindingen (de resultaten)
2.	Onderzoeksvoorstel (de AI-gegenereerde gids)
•	Initiële Staat (Bij binnenkomst in Fase 2):
o	Het Onderzoeksbevindingen-component is leeg en standaard INGEKLAPT.
o	Het Onderzoeksvoorstel-component is gevuld en standaard UITGEKLAPT, zodat de therapeut direct de aanbevolen tests als leidraad kan gebruiken.
•	Eindstaat (NÁ verwerking van de onderzoeksinvoer):
o	Het Onderzoeksvoorstel-component klapt automatisch IN.
o	Het Onderzoeksbevindingen-component klapt automatisch UIT en wordt gevuld met de gestructureerde, bewerkbare en per sectie kopieerbare resultaten.
B. Rechterpaneel (Invoer-zijde):
•	Dit paneel bevat de bekende, inklapbare invoercomponenten:
1.	Live Opname
2.	Handmatige Notities
3.	Hysio Assistant
Live Opname en Handmatige Notities zijn uitgeklapt vóór verwerking, na verwerking onderzoek klappen ze in en is de focus naar linkerpaneel waar de onderzoeksconclusie zichtbaar wordt
2. Specificaties voor Fase 3: Klinische Conclusie
Doel: De generatie van de conclusie moet een bewuste gebruikersactie zijn.
•	Implementatie:
1.	Wanneer de gebruiker Fase 3 betreedt, is het conclusie-gedeelte leeg.
2.	Implementeer een duidelijke, primaire knop met het label Genereer Klinische Conclusie.
3.	De AI-verwerking en weergave van de conclusie start pas nadat de gebruiker op deze knop heeft geklikt.
3. Specificaties voor Globale Navigatie & UI (Implementatievoorstel)
Doel: Creëer een heldere en consistente navigatie door de gehele intake.
A. Visuele Fase-Indicator (Stepper):
•	Implementeer een permanent zichtbare 'stepper' bovenaan het scherm.
•	Deze toont de drie fases: 1. Anamnese — 2. Onderzoek — 3. Klinische Conclusie.
•	De actieve fase moet duidelijk geaccentueerd zijn. Maak de labels van voltooide fases klikbaar, zodat de gebruiker kan terug navigeren.
B. Full-Width Navigatiebalk Onderaan:
•	Alle knoppen die naar een volgende fase leiden (Ga naar Onderzoek, Ga naar Klinische Conclusie) MOETEN worden weergegeven als een volledig horizontale balk onderaan de gehele pagina. Dit zorgt voor een consistente en duidelijke primaire actieknop.
Conclusie voor de ontwikkelaar: Deze prompt beschrijft de finale, door de gebruiker verfijnde workflow. De belangrijkste wijziging is de positionering en het gedrag van het Onderzoeksvoorstel in het linkerpaneel. Voer deze specificaties nauwkeurig uit om de intake-ervaring consistent, intuïtief en perfect functioneel te maken.


