/** Development-only bridge to the user's existing files. Never emitted to dist. */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {loadReferenceCatalogue,clinicalFromCatalogue} from './reference-catalogue.js';
const input = fileURLToPath(new URL('../../04_Working Data/drugindex_active_ingredients.json', import.meta.url));
const fields = ['indications', 'mode_of_action', 'precautions', 'contraindications', 'drug_interactions', 'side_effects', 'dosage', 'special_information', 'pregnancy_information', 'pregnancy_risk_category', 'breastfeeding', 'considerations', 'additional_labelling'];
export function localReference() {
  return {
    name: 'local-clinical-reference', apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__local-reference', async (request, response) => {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        if (request.method !== 'GET') { response.statusCode = 405; response.end('{}'); return; }
        try {
          const ingredient = new URL(request.url, 'http://localhost').searchParams.get('ingredient');
          try {
            const captured=clinicalFromCatalogue(await loadReferenceCatalogue(),ingredient);
            if(!captured){response.statusCode=404;response.end('{}');return;}
            response.end(JSON.stringify(captured));return;
          } catch(error) { if(error.code!=='ENOENT') throw error; }
          const raw = await readFile(input, 'utf8');
          const records = JSON.parse(raw);
          const matches = records.filter(record => record.name === ingredient);
          // Ambiguous names never select an arbitrary record.
          if (matches.length !== 1 || !matches[0].ai_key) { response.statusCode = 404; response.end('{}'); return; }
          const record = matches[0];
          response.end(JSON.stringify({
            schema_version: 1, ingredient_id: record.ai_key, ingredient_name: record.name,
            source: 'Drug Index · existing local export', source_version: createHash('sha256').update(raw).digest('hex'),
            source_url: null, source_updated_at: null, collected_at: null, clinical_reviewed_at: null,
            pregnancy_scheme: null, jurisdiction: null, local_preview: true,
            fields: Object.fromEntries(fields.map(key => [key, typeof record[key] === 'string' && record[key].trim() ? record[key] : null])),
          }));
        } catch { response.statusCode = 503; response.end('{}'); }
      });
    },
  };
}
