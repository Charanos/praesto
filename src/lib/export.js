import { runFilter } from './filters.js';

/** Existing CSV schema and OOS-desc ordering retained. */
export function buildCsv(store, filters) {
    const { P, D } = store;
    const rows = runFilter(store, filters, { key: 'oos', dir: 'desc' }).rows;
    const head = [
      'product_key', 'name', 'type', 'is_clinical', 'form', 'pack', 'active_ingredient',
      'pharmacies_listing', 'pharmacies_eligible', 'pharmacies_oos', 'pharmacies_in_stock',
      'cluster_band', 'price_min', 'price_median', 'price_max',
      'match_confidence', 'match_band', 'review_state', 'class_gap_reason',
      ...store.shops.map((s) => s.pharmacy_id),
    ];
    const esc = (v) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    };
    const lines = [head.join(',')];
    for (const i of rows) {
      const cells = [
        P.key[i], P.name[i], D.type[P.type[i]], P.clinical[i] ? 'yes' : 'no',
        P.form[i] >= 0 ? D.form[P.form[i]] : '', P.packSig[i],
        P.ingredient[i] >= 0 ? D.ingredient[P.ingredient[i]] : '',
        P.nListed[i], P.nEligible[i], P.nOos[i], P.nIn[i],
        D.band[P.band[i]],
        Number.isFinite(P.priceMin[i]) ? P.priceMin[i] : '',
        Number.isFinite(P.priceMed[i]) ? P.priceMed[i] : '',
        Number.isFinite(P.priceMax[i]) ? P.priceMax[i] : '',
        P.matchConf[i].toFixed(3), D.matchBand[P.matchBand[i]],
        D.review[P.review[i]], P.gap[i] >= 0 ? D.gap[P.gap[i]] : '',
        ...store.shops.map((s) => {
          const bit = 1 << s.bit;
          if (!(P.listedMask[i] & bit)) return '';
          if (P.oosMask[i] & bit) return 'out_of_stock';
          if (P.inMask[i] & bit) return 'in_stock';
          return 'not_published';
        }),
      ];
      lines.push(cells.map(esc).join(','));
    }
    return { text: lines.join('\n'), count: rows.length };
}
