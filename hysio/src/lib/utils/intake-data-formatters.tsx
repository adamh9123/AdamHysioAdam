/**
 * Intake Data Formatters - Universal formatting for both Semantic Intelligence and Legacy structures
 *
 * Handles data from:
 * - New Semantic Intelligence v8.0.0 (semantic-intake-processor.ts)
 * - Legacy Enhanced HHSB system (hhsb-generation.ts, onderzoek-generation.ts, etc.)
 */

import React from 'react';

// ============================================================================
// STOORNISSEN FORMATTER
// ============================================================================

export function formatStoornissen(stoornissen: any) {
  if (!stoornissen) return <div className="text-gray-500">Geen stoornissen geïdentificeerd</div>;

  // Support both new (pain/movement) and legacy (painDescription/movementImpairments) structures
  const pain = stoornissen.pain || stoornissen.painDescription;
  const movement = stoornissen.movement || stoornissen.movementImpairments;
  const otherSymptoms = stoornissen.otherSymptoms || [];
  const strengthDeficits = stoornissen.strengthDeficits || [];
  const sensoryChanges = stoornissen.sensoryChanges || [];
  const coordinationIssues = stoornissen.coordinationIssues || [];

  const hasAnyData = pain || (movement && movement.length > 0) || otherSymptoms.length > 0 ||
                      strengthDeficits.length > 0 || sensoryChanges.length > 0 || coordinationIssues.length > 0;

  if (!hasAnyData) return <div className="text-gray-500">Geen stoornissen geïdentificeerd</div>;

  return (
    <div className="space-y-4">
      {pain && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Pijn</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {pain.location && pain.location.length > 0 && (
              <li><strong>Locatie:</strong> {pain.location.join(', ')}</li>
            )}
            {pain.character && (
              <li><strong>Karakter:</strong> {Array.isArray(pain.character) ? pain.character.join(', ') : pain.character}</li>
            )}
            {pain.intensity && (
              <li>
                <strong>Intensiteit (NRS):</strong>
                {pain.intensity.current !== undefined && ` Huidig: ${pain.intensity.current}/10`}
                {pain.intensity.worst !== undefined && `, Ergste: ${pain.intensity.worst}/10`}
                {pain.intensity.average !== undefined && `, Gemiddeld: ${pain.intensity.average}/10`}
                {pain.intensity.best !== undefined && `, Beste: ${pain.intensity.best}/10`}
              </li>
            )}
            {pain.pattern && <li><strong>Patroon:</strong> {pain.pattern}</li>}
            {pain.timePattern && <li><strong>Tijdspatroon:</strong> {pain.timePattern}</li>}
            {pain.aggravatingFactors && pain.aggravatingFactors.length > 0 && (
              <li><strong>Provocerende factoren:</strong> {pain.aggravatingFactors.join(', ')}</li>
            )}
            {pain.relievingFactors && pain.relievingFactors.length > 0 && (
              <li><strong>Verlichtende factoren:</strong> {pain.relievingFactors.join(', ')}</li>
            )}
          </ul>
        </div>
      )}

      {movement && Array.isArray(movement) && movement.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Bewegingsbeperkingen</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {movement.map((item: any, idx: number) => (
              <li key={idx}>
                <strong>{item.joint || item.movement}:</strong> {item.limitation}
                {item.severity && ` (${item.severity})`}
                {item.compensations && ` - Compensaties: ${item.compensations}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {movement && !Array.isArray(movement) && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Beweging</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {movement.restrictions && movement.restrictions.length > 0 && (
              <li><strong>Beperkingen:</strong> {movement.restrictions.join(', ')}</li>
            )}
            {movement.quality && <li><strong>Kwaliteit:</strong> {movement.quality}</li>}
          </ul>
        </div>
      )}

      {strengthDeficits.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Krachtdeficits</h5>
          <ul className="list-disc list-inside ml-2">
            {strengthDeficits.map((deficit: string, idx: number) => (
              <li key={idx}>{deficit}</li>
            ))}
          </ul>
        </div>
      )}

      {sensoryChanges.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Sensorische veranderingen</h5>
          <ul className="list-disc list-inside ml-2">
            {sensoryChanges.map((change: string, idx: number) => (
              <li key={idx}>{change}</li>
            ))}
          </ul>
        </div>
      )}

      {coordinationIssues.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Coördinatieproblemen</h5>
          <ul className="list-disc list-inside ml-2">
            {coordinationIssues.map((issue: string, idx: number) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {otherSymptoms.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Overige symptomen</h5>
          <ul className="list-disc list-inside ml-2">
            {otherSymptoms.map((symptom: string, idx: number) => (
              <li key={idx}>{symptom}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BEPERKINGEN FORMATTER
// ============================================================================

export function formatBeperkingen(beperkingen: any) {
  if (!beperkingen) return <div className="text-gray-500">Geen beperkingen geïdentificeerd</div>;

  // Support both new and legacy structures
  const adl = beperkingen.adl || beperkingen.activitiesOfDailyLiving || [];
  const work = beperkingen.work || beperkingen.workLimitations || [];
  const sport = beperkingen.sport || beperkingen.sportRecreationLimitations || [];
  const social = beperkingen.social || beperkingen.socialParticipationImpact || [];
  const sleep = beperkingen.sleepImpact;
  const mood = beperkingen.moodCognitiveImpact;

  const hasAnyData = adl.length > 0 || work.length > 0 || sport.length > 0 || social.length > 0 || sleep || mood;

  if (!hasAnyData) return <div className="text-gray-500">Geen beperkingen geïdentificeerd</div>;

  return (
    <div className="space-y-4">
      {adl.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">ADL (Dagelijkse activiteiten)</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {adl.map((item: any, idx: number) => (
              <li key={idx}>
                <strong>{item.activity}:</strong> {item.limitation}
                {item.severity && ` (${item.severity})`}
                {item.frequency && ` - Frequentie: ${item.frequency}`}
                {item.impact && ` - Impact: ${item.impact}`}
                {item.adaptations && ` - Aanpassingen: ${item.adaptations}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {work.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Werk</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {work.map((item: any, idx: number) => (
              <li key={idx}>
                {typeof item === 'string' ? item : (
                  <>
                    <strong>{item.task}:</strong> {item.limitation}
                    {item.severity && ` (${item.severity})`}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sport.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Sport & Hobby</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {sport.map((item: any, idx: number) => (
              <li key={idx}>
                {typeof item === 'string' ? item : (
                  <>
                    <strong>{item.activity}:</strong> {item.limitation}
                    {item.severity && ` (${item.severity})`}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {social.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Sociaal & Participatie</h5>
          <ul className="list-disc list-inside ml-2">
            {social.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {sleep && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Slaap</h5>
          <p className="ml-2">{sleep}</p>
        </div>
      )}

      {mood && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Stemming & Cognitie</h5>
          <p className="ml-2">{mood}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ONDERZOEK FORMATTER
// ============================================================================

export function formatOnderzoek(onderzoek: any) {
  if (!onderzoek) return <div className="text-gray-500">Geen onderzoeksbevindingen beschikbaar</div>;

  const hasAnyData = onderzoek.inspectie || onderzoek.palpatie || onderzoek.bewegingsonderzoek ||
                      onderzoek.specifiekeTesten || onderzoek.krachtEnStabiliteit || onderzoek.klinimetrie ||
                      onderzoek.observatie || onderzoek.houding || onderzoek.gang || onderzoek.spanning || onderzoek.pijnpunten ||
                      onderzoek.afwijkingen || onderzoek.overige;

  if (!hasAnyData) return <div className="text-gray-500">Geen onderzoeksbevindingen beschikbaar</div>;

  return (
    <div className="space-y-4">
      {/* Inspection/Observation */}
      {onderzoek.inspectie && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Inspectie & Observatie</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {onderzoek.inspectie.posture && <li><strong>Houding:</strong> {onderzoek.inspectie.posture}</li>}
            {onderzoek.inspectie.swelling && <li><strong>Zwelling:</strong> {onderzoek.inspectie.swelling}</li>}
            {onderzoek.inspectie.atrophy && <li><strong>Atrofie:</strong> {onderzoek.inspectie.atrophy}</li>}
            {onderzoek.inspectie.other && onderzoek.inspectie.other.map((obs: string, idx: number) => (
              <li key={idx}>{obs}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Legacy observation fields */}
      {onderzoek.observatie && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Observatie</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {onderzoek.observatie.algemeneIndruk && (
              <li><strong>Algemene indruk:</strong> {onderzoek.observatie.algemeneIndruk}</li>
            )}
            {onderzoek.observatie.houding && (
              <li>
                <strong>Houding:</strong>{' '}
                {typeof onderzoek.observatie.houding === 'string'
                  ? onderzoek.observatie.houding
                  : onderzoek.observatie.houding.staand || JSON.stringify(onderzoek.observatie.houding)}
              </li>
            )}
            {onderzoek.observatie.gang && (
              <li>
                <strong>Gang:</strong>{' '}
                {typeof onderzoek.observatie.gang === 'string'
                  ? onderzoek.observatie.gang
                  : onderzoek.observatie.gang.patroon || JSON.stringify(onderzoek.observatie.gang)}
              </li>
            )}
            {onderzoek.observatie.afwijkingen && onderzoek.observatie.afwijkingen.length > 0 && (
              <>
                <li><strong>Afwijkingen:</strong></li>
                <ul className="list-disc list-inside ml-4">
                  {onderzoek.observatie.afwijkingen.map((afw: string, idx: number) => (
                    <li key={idx}>{afw}</li>
                  ))}
                </ul>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Palpation */}
      {onderzoek.palpatie && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Palpatie</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {onderzoek.palpatie.tenderness && onderzoek.palpatie.tenderness.length > 0 && (
              <li>
                <strong>Drukpijn:</strong> {onderzoek.palpatie.tenderness.map((t: any) => `${t.location} (${t.severity})`).join(', ')}
              </li>
            )}
            {onderzoek.palpatie.tone && <li><strong>Tonus:</strong> {onderzoek.palpatie.tone}</li>}
            {onderzoek.palpatie.temperature && <li><strong>Temperatuur:</strong> {onderzoek.palpatie.temperature}</li>}
            {onderzoek.palpatie.spanning && onderzoek.palpatie.spanning.length > 0 && (
              <li><strong>Spanning:</strong> {onderzoek.palpatie.spanning.join(', ')}</li>
            )}
            {onderzoek.palpatie.pijnpunten && onderzoek.palpatie.pijnpunten.length > 0 && (
              <li><strong>Pijnpunten:</strong> {onderzoek.palpatie.pijnpunten.join(', ')}</li>
            )}
            {onderzoek.palpatie.zwelling && onderzoek.palpatie.zwelling.length > 0 && (
              <li><strong>Zwelling:</strong> {onderzoek.palpatie.zwelling.join(', ')}</li>
            )}
            {onderzoek.palpatie.overige && onderzoek.palpatie.overige.length > 0 && (
              onderzoek.palpatie.overige.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Movement examination */}
      {onderzoek.bewegingsonderzoek && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Bewegingsonderzoek</h5>
          {onderzoek.bewegingsonderzoek.arom && onderzoek.bewegingsonderzoek.arom.length > 0 && (
            <div className="mb-3">
              <p className="font-medium mb-1">Actief ROM (AROM):</p>
              <ul className="list-disc list-inside pl-4 ml-2">
                {onderzoek.bewegingsonderzoek.arom.map((m: any, idx: number) => (
                  <li key={idx}>
                    {m.movement}: {m.range} {m.pain && `- Pijn: ${m.pain}`} {m.limitation && `- ${m.limitation}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {onderzoek.bewegingsonderzoek.prom && onderzoek.bewegingsonderzoek.prom.length > 0 && (
            <div>
              <p className="font-medium mb-1">Passief ROM (PROM):</p>
              <ul className="list-disc list-inside pl-4 ml-2">
                {onderzoek.bewegingsonderzoek.prom.map((m: any, idx: number) => (
                  <li key={idx}>
                    {m.movement}: {m.range} {m.endFeel && `- Eindgevoel: ${m.endFeel}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Specific tests */}
      {onderzoek.specifiekeTesten && onderzoek.specifiekeTesten.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Specifieke Tests</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {onderzoek.specifiekeTesten.map((test: any, idx: number) => (
              <li key={idx}>
                <strong>{test.testName}:</strong>{' '}
                {test.result === 'positive' ? '✅ Positief' : test.result === 'negative' ? '❌ Negatief' : '❓ Onduidelijk'}
                {test.description && ` - ${test.description}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strength and stability */}
      {onderzoek.krachtEnStabiliteit && onderzoek.krachtEnStabiliteit.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Kracht & Stabiliteit</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {onderzoek.krachtEnStabiliteit.map((k: any, idx: number) => (
              <li key={idx}>
                <strong>{k.muscle}:</strong> {k.strength} {k.comment && `- ${k.comment}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clinimetrics */}
      {onderzoek.klinimetrie && onderzoek.klinimetrie.length > 0 && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Klinimetrie</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {onderzoek.klinimetrie.map((k: any, idx: number) => (
              <li key={idx}>
                <strong>{k.measureName}:</strong> {k.score} - {k.interpretation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legacy: samenvattingOnderzoek */}
      {onderzoek.samenvattingOnderzoek && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Samenvatting Onderzoek</h5>
          {typeof onderzoek.samenvattingOnderzoek === 'string' ? (
            <p className="ml-2">{onderzoek.samenvattingOnderzoek}</p>
          ) : (
            <ul className="list-disc list-inside space-y-1 ml-2">
              {onderzoek.samenvattingOnderzoek.klinischeIndruk && (
                <li><strong>Klinische indruk:</strong> {onderzoek.samenvattingOnderzoek.klinischeIndruk}</li>
              )}
              {onderzoek.samenvattingOnderzoek.hoofdbevindingen && onderzoek.samenvattingOnderzoek.hoofdbevindingen.length > 0 && (
                <>
                  <li><strong>Hoofdbevindingen:</strong></li>
                  <ul className="list-disc list-inside ml-4">
                    {onderzoek.samenvattingOnderzoek.hoofdbevindingen.map((finding: string, idx: number) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </>
              )}
              {onderzoek.samenvattingOnderzoek.beperkingen && onderzoek.samenvattingOnderzoek.beperkingen.length > 0 && (
                <>
                  <li><strong>Beperkingen:</strong></li>
                  <ul className="list-disc list-inside ml-4">
                    {onderzoek.samenvattingOnderzoek.beperkingen.map((limitation: string, idx: number) => (
                      <li key={idx}>{limitation}</li>
                    ))}
                  </ul>
                </>
              )}
              {onderzoek.samenvattingOnderzoek.werkdiagnoseHypotheses && onderzoek.samenvattingOnderzoek.werkdiagnoseHypotheses.length > 0 && (
                <>
                  <li><strong>Werkdiagnose hypotheses:</strong></li>
                  <ul className="list-disc list-inside ml-4">
                    {onderzoek.samenvattingOnderzoek.werkdiagnoseHypotheses.map((hypothesis: string, idx: number) => (
                      <li key={idx}>{hypothesis}</li>
                    ))}
                  </ul>
                </>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONCLUSIE FORMATTER
// ============================================================================

export function formatConclusie(conclusie: any) {
  if (!conclusie) return <div className="text-gray-500">Geen klinische conclusie beschikbaar</div>;

  // Support both structures
  const diagnose = conclusie.diagnose || conclusie.fysiotherapeutischeDiagnose;
  const behandelplan = conclusie.behandelplan;
  const prognose = conclusie.prognose;
  const onderbouwing = conclusie.onderbouwing || conclusie.klinischeRedenering;

  const hasAnyData = diagnose || behandelplan || prognose || onderbouwing;

  if (!hasAnyData) return <div className="text-gray-500">Geen klinische conclusie beschikbaar</div>;

  return (
    <div className="space-y-4">
      {/* Diagnosis */}
      {diagnose && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Diagnose</h5>
          <p className="mb-2 ml-2">
            <strong>Primair:</strong> {diagnose.primary || diagnose.primaireDiagnose || diagnose.diagnose || diagnose}
          </p>
          {diagnose.differential && diagnose.differential.length > 0 && (
            <div className="ml-2">
              <p className="font-medium">Differentiaal diagnoses:</p>
              <ul className="list-disc list-inside pl-4">
                {diagnose.differential.map((d: string, idx: number) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {diagnose.icdCode && (
            <p className="ml-2 mt-2"><strong>ICD-code:</strong> {diagnose.icdCode}</p>
          )}
          {diagnose.zekerheid && (
            <p className="ml-2"><strong>Zekerheid:</strong> {diagnose.zekerheid}</p>
          )}
        </div>
      )}

      {/* Clinical reasoning */}
      {onderbouwing && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Onderbouwing & Klinische Redenering</h5>
          {typeof onderbouwing === 'string' ? (
            <p className="ml-2">{onderbouwing}</p>
          ) : (
            <>
              {onderbouwing.supportingFindings && onderbouwing.supportingFindings.length > 0 && (
                <div className="mb-3 ml-2">
                  <p className="font-medium">Ondersteunende bevindingen:</p>
                  <ul className="list-disc list-inside pl-4">
                    {onderbouwing.supportingFindings.map((finding: string, idx: number) => (
                      <li key={idx}>✓ {finding}</li>
                    ))}
                  </ul>
                </div>
              )}
              {onderbouwing.excludedConditions && onderbouwing.excludedConditions.length > 0 && (
                <div className="mb-3 ml-2">
                  <p className="font-medium">Uitgesloten aandoeningen:</p>
                  <ul className="list-disc list-inside pl-4">
                    {onderbouwing.excludedConditions.map((excluded: any, idx: number) => (
                      <li key={idx}>
                        ✗ {typeof excluded === 'string' ? excluded : `${excluded.condition} → ${excluded.reason}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {onderbouwing.evidenceLevel && (
                <p className="ml-2"><strong>Evidence Level:</strong> {onderbouwing.evidenceLevel}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Treatment plan */}
      {behandelplan && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Behandelplan</h5>
          {behandelplan.mainGoals && behandelplan.mainGoals.length > 0 && (
            <div className="mb-3 ml-2">
              <p className="font-medium mb-1">SMART Behandeldoelen:</p>
              <ul className="list-decimal list-inside pl-4">
                {behandelplan.mainGoals.map((goal: any, idx: number) => (
                  <li key={idx}>
                    {typeof goal === 'string' ? goal : (
                      <>
                        {goal.goal} {goal.timeframe && `(${goal.timeframe})`}
                        {goal.measures && <span className="text-sm text-gray-600"> - Meetbaar: {goal.measures}</span>}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {behandelplan.phases && behandelplan.phases.length > 0 && (
            <div className="mb-3 ml-2">
              <p className="font-medium mb-1">Behandelfasen:</p>
              {behandelplan.phases.map((phase: any, idx: number) => (
                <div key={idx} className="ml-4 mb-2">
                  <p className="font-medium">Fase {idx + 1}: {phase.phaseName} ({phase.duration})</p>
                  <p className="text-sm">{phase.focus}</p>
                  {phase.interventions && phase.interventions.length > 0 && (
                    <ul className="list-disc list-inside pl-4 text-sm">
                      {phase.interventions.map((intervention: string, i: number) => (
                        <li key={i}>{intervention}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {behandelplan.frequency && <p className="ml-2"><strong>Frequentie:</strong> {behandelplan.frequency}</p>}
          {behandelplan.estimatedDuration && <p className="ml-2"><strong>Geschatte duur:</strong> {behandelplan.estimatedDuration}</p>}
        </div>
      )}

      {/* Prognosis */}
      {prognose && (
        <div>
          <h5 className="font-semibold text-hysio-deep-green mb-2">Prognose</h5>
          {typeof prognose === 'string' ? (
            <p className="mb-2 ml-2">{prognose}</p>
          ) : (
            <>
              {prognose.expected && (
                <p className="mb-2 ml-2">{prognose.expected}</p>
              )}
              {prognose.verwachting && (
                <p className="mb-2 ml-2"><strong>Verwachting:</strong> {prognose.verwachting}</p>
              )}
              {prognose.overwegingen && (
                <p className="mb-2 ml-2"><strong>Overwegingen:</strong> {prognose.overwegingen}</p>
              )}
              {prognose.factorsPositive && prognose.factorsPositive.length > 0 && (
                <div className="mb-2 ml-2">
                  <p className="font-medium text-green-700">Positieve factoren:</p>
                  <ul className="list-disc list-inside pl-4">
                    {prognose.factorsPositive.map((f: string, idx: number) => (
                      <li key={idx}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {prognose.factorsNegative && prognose.factorsNegative.length > 0 && (
                <div className="ml-2">
                  <p className="font-medium text-orange-700">Belemmerende factoren:</p>
                  <ul className="list-disc list-inside pl-4">
                    {prognose.factorsNegative.map((f: string, idx: number) => (
                      <li key={idx}>⚠️ {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
