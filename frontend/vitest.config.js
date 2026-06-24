// vitest.config.js — à placer à la racine de /frontend

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['tests/pokemonApi.test.js', 'jsdom'],
      ['tests/favoriteApi.test.js', 'jsdom'],
      ['tests/filterPokemons.test.js', 'node'],
    ],
    include: ['tests/**/*.test.{js,jsx}'],
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000'),
  },
});

// ============================================================
// INSTALLATION (à exécuter dans /frontend) :
//
//   npm install -D vitest @vitest/ui jsdom
//
// LANCEMENT DES TESTS :
//   npm run test          → mode watch
//   npm run vitest run    → one-shot (pour capture d'écran)
//   npx vitest run --reporter=verbose  → sortie détaillée
//
// AJOUTER dans package.json → "scripts" :
//   "test": "vitest run --reporter=verbose"
// ============================================================