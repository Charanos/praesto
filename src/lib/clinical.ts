/** Versioned browser boundary. Vendor-specific API details belong on the server. */
export const clinicalFields = [
  ['indications', 'Indications'], ['mode_of_action', 'Mode of action'],
  ['precautions', 'Precautions'], ['contraindications', 'Contraindications'],
  ['drug_interactions', 'Drug interactions'], ['side_effects', 'Adverse effects'],
  ['dosage', 'Dosage information'], ['special_information', 'Special information'],
  ['pregnancy_information', 'Pregnancy information'], ['pregnancy_risk_category', 'Pregnancy risk category'],
  ['breastfeeding', 'Breastfeeding'], ['considerations', 'Other considerations'],
  ['additional_labelling', 'Source labelling codes'],
] as const;
export type ClinicalField = typeof clinicalFields[number][0];
export type ClinicalRecord = {
  schema_version: 1;
  ingredient_id: string;
  ingredient_name: string;
  source: string;
  source_version: string;
  source_url: string | null;
  source_updated_at: string | null;
  collected_at: string | null;
  clinical_reviewed_at: string | null;
  pregnancy_scheme: string | null;
  jurisdiction: string | null;
  local_preview: boolean;
  fields: Record<ClinicalField, string | null>;
};
const nullableString = (value: unknown): value is string | null => value === null || typeof value === 'string';
export function validateClinicalRecord(value: unknown, ingredient: string): ClinicalRecord {
  if (!value || typeof value !== 'object') throw new Error('Invalid reference response');
  const r = value as Record<string, unknown>;
  if (r.schema_version !== 1 || r.ingredient_name !== ingredient || typeof r.ingredient_id !== 'string' || !r.ingredient_id
    || typeof r.source !== 'string' || !r.source || typeof r.source_version !== 'string' || !r.source_version
    || typeof r.local_preview !== 'boolean' || !r.fields || typeof r.fields !== 'object') throw new Error('Reference identity or version mismatch');
  for (const key of ['source_url', 'source_updated_at', 'collected_at', 'clinical_reviewed_at', 'pregnancy_scheme', 'jurisdiction']) {
    if (!nullableString(r[key])) throw new Error(`Invalid reference ${key}`);
  }
  if (r.source_url !== null && (typeof r.source_url !== 'string' || !r.source_url.startsWith('https://'))) throw new Error('Unsafe reference link');
  for (const key of ['source_updated_at', 'collected_at', 'clinical_reviewed_at']) {
    if (r[key] !== null && !Number.isFinite(Date.parse(String(r[key])))) throw new Error('Invalid reference date');
  }
  const fields = r.fields as Record<string, unknown>;
  for (const [key] of clinicalFields) if (!nullableString(fields[key])) throw new Error(`Invalid reference field ${key}`);
  // A category without its source scheme/jurisdiction cannot be interpreted.
  if (fields.pregnancy_risk_category && (!r.pregnancy_scheme || !r.jurisdiction)) throw new Error('Pregnancy category lacks scheme or jurisdiction');
  return r as ClinicalRecord;
}
export function clinicalEndpoint(): string | null {
  const configured = import.meta.env.VITE_CLINICAL_REFERENCE_URL as string | undefined;
  if (configured) {
    // Same-origin paths keep keys and licensing enforcement on the server.
    return validateClinicalPath(configured);
  }
  return import.meta.env.DEV ? '/__local-reference' : null;
}
export function validateClinicalPath(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\\s?#]/.test(path)) return null;
  return path;
}
export async function loadClinicalRecord(ingredient: string, signal: AbortSignal): Promise<ClinicalRecord | null> {
  const endpoint = clinicalEndpoint();
  if (!endpoint) return null;
  const response = await fetch(`${endpoint}?ingredient=${encodeURIComponent(ingredient)}`, { signal, credentials: 'same-origin' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Reference could not load');
  return validateClinicalRecord(await response.json(), ingredient);
}
