import { useEffect, useState } from 'react';
import { clinicalEndpoint, clinicalFields, loadClinicalRecord, type ClinicalRecord } from '../lib/clinical';
type ReaderState = { status: 'loading' } | { status: 'missing' } | { status: 'error' } | { status: 'ready'; record: ClinicalRecord };
const dateLabel = (date: string | null) => date ? new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';

export default function ClinicalReader({ ingredient }: { ingredient: string }) {
  const [state, setState] = useState<ReaderState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    setState({ status: 'loading' });
    loadClinicalRecord(ingredient, controller.signal).then((record) => {
      if (!controller.signal.aborted) setState(record ? { status: 'ready', record } : { status: 'missing' });
    }).catch(() => { if (!controller.signal.aborted) setState({ status: 'error' }); });
    return () => controller.abort();
  }, [ingredient, attempt, expanded]);

  return <section className="reader" aria-label="Clinical reference">
    <h3>Clinical reference</h3>
    <p className="reader-intro">Source information for {ingredient}. Coverage varies by field. This reference does not determine whether a medicine or dose is suitable for a person.</p>
    {!clinicalEndpoint() ? <p className="reader-gap">Detailed reference is not available in this publication. The register extract above contains the fields supplied with this snapshot.</p>
      : <><button className="btn" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide clinical reference' : 'Read clinical reference'}</button>
      {expanded && (state.status === 'loading' ? <p className="reader-gap" role="status">Loading reference…</p>
      : state.status === 'error' ? <div className="feedback" role="alert"><p>Clinical reference could not load.</p><button className="btn" onClick={() => setAttempt(a => a + 1)}>Retry reference</button></div>
      : state.status === 'missing' ? <p className="reader-gap">No exact ingredient reference was found. Combination names are kept intact; related names are not treated as a match.</p>
      : <>
        {state.record.local_preview && <p className="notice">Local reference preview · source revision date and clinical review are unverified.</p>}
        {clinicalFields.map(([key, label]) => <details key={key}>
          <summary>{label}{!state.record.fields[key] && ' · not supplied'}</summary>
          {state.record.fields[key] ? <>
            {key === 'additional_labelling' && <p className="reader-gap">Source codes preserved verbatim. Their meaning is unverified; they are not interpreted as pregnancy categories.</p>}
            {key === 'dosage' && <p className="reader-gap">Source dosage text may depend on indication, age, formulation and organ function. It is not a personalized dose recommendation.</p>}
            <p className="reader-text">{state.record.fields[key]}</p>
          </> : <p className="reader-gap">Not supplied in this reference. Missing information does not establish safety or absence of a risk.</p>}
        </details>)}
        <details><summary>Source and provenance</summary>
          <div className="reader-provenance">
            <div>Source: {state.record.source}</div>
            <div>Reference ID: {state.record.ingredient_id}</div>
            <div>Version: {state.record.source_version}</div>
            <div>Collected: {dateLabel(state.record.collected_at)}</div>
            <div>Source revised: {dateLabel(state.record.source_updated_at)}</div>
            <div>Clinical review: {dateLabel(state.record.clinical_reviewed_at)}</div>
            {state.record.pregnancy_scheme && <div>Pregnancy scheme: {state.record.pregnancy_scheme} · {state.record.jurisdiction}</div>}
            {state.record.source_url && <a className="table-action" href={state.record.source_url} target="_blank" rel="noopener noreferrer">Visit source reference</a>}
          </div>
        </details>
      </>)}
      </>}
  </section>;
}
