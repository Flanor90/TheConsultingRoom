// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// La sezione Articles entra nella sitemap solo quando c'è almeno un articolo pubblicato.
const hasArticles = readdirSync('src/articles').some(
  (f) => f.endsWith('.md') && !f.startsWith('_') && !/^draft:\s*true/m.test(readFileSync(`src/articles/${f}`, 'utf8'))
);

// Indirizzo pubblico del sito. Da cambiare quando avrai il dominio:
// qui oppure con la variabile d'ambiente SITE_URL al momento del build.
const SITE = process.env.SITE_URL || 'https://theconsultingroom.example';
// Sottocartella del sito: '/' con un dominio tuo, '/TheConsultingRoom' su flanor90.github.io.
const BASE = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && (hasArticles || !page.includes('/articles/')),
    }),
  ],
});
