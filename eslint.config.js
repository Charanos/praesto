import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
const browserGlobals = Object.fromEntries(['window', 'document', 'navigator', 'location', 'history', 'fetch', 'URL', 'URLSearchParams', 'Blob', 'TextDecoder', 'TextEncoder', 'requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver', 'AbortController', 'HTMLElement', 'HTMLDialogElement', 'console', 'setTimeout', 'clearTimeout', 'performance', 'Worker', 'self'].map(key => [key, 'readonly']));
export default [
  { ignores: ['node_modules/**', 'dist/**', 'static/**', 'data/**', 'docs/**'] },
  { ...js.configs.recommended, files: ['src/**/*.{js,jsx}', 'dev/**/*.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: browserGlobals }, rules: { ...js.configs.recommended.rules, 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', args: 'none', caughtErrors: 'none' }] } },
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['src/**/*.{ts,tsx}'] })),
  { files: ['src/**/*.{js,jsx,ts,tsx}'], plugins: { 'react-hooks': hooks, 'jsx-a11y': a11y }, rules: {
    'react-hooks/rules-of-hooks': 'error',
    'jsx-a11y/alt-text': 'error', 'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error', 'jsx-a11y/aria-proptypes': 'error', 'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
  } },
];
