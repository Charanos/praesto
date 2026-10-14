import test from 'node:test';
import assert from 'node:assert/strict';
import { installAdaptiveFavicon } from '../src/lib/favicon.ts';

test('favicon follows system preference changes and removes its listener on cleanup', () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const icon = { href: '/favicon.svg' };
  const preference = Object.assign(new EventTarget(), { matches: false });
  try {
    globalThis.document = { querySelector: () => icon };
    globalThis.window = { matchMedia: () => preference };
    const cleanup = installAdaptiveFavicon();
    assert.equal(icon.href, '/brand/praesto/praesto-b-favicon-light.svg?v=praesto-2');
    preference.matches = true;
    preference.dispatchEvent(new Event('change'));
    assert.equal(icon.href, '/brand/praesto/praesto-b-favicon-dark.svg?v=praesto-2');
    preference.matches = false;
    preference.dispatchEvent(new Event('change'));
    assert.equal(icon.href, '/brand/praesto/praesto-b-favicon-light.svg?v=praesto-2');
    cleanup();
    preference.matches = true;
    preference.dispatchEvent(new Event('change'));
    assert.equal(icon.href, '/brand/praesto/praesto-b-favicon-light.svg?v=praesto-2');
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
