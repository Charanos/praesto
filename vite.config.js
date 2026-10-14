import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localReference } from './dev/local-reference.js';

export default defineConfig({
  plugins: [react(), localReference()],
  // Keeps generated, browser-facing contract artifacts separate from source and
  // prevents an obsolete experimental JSON payload from being shipped.
  publicDir: 'static',
});
