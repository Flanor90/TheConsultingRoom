# The Consulting Room · sito vetrina

Sito statico (Astro) per il negozio Etsy **The Consulting Room**. Il sito non vende: ogni pulsante d'acquisto apre l'inserzione su Etsy in una nuova scheda.

- Lingua del sito: inglese americano. Pubblico: clinici anglofoni (prima gli USA), istituti di formazione; in futuro anche lettori non clinici, con la sezione Articles.
- Nessun file a pagamento nel repository: solo copertine ottimizzate e testi descrittivi. `.gitignore` blocca comunque PDF, EPUB e ZIP.
- Nessuna recensione, valutazione o numero di vendite. Nessun collegamento ad altri siti o marchi dell'autore.

## Comandi

```bash
npm install          # la prima volta
npm run dev          # anteprima locale su http://localhost:4321
npm run build        # crea il sito in dist/
npm run preview      # mostra la versione di produzione su http://localhost:4322
npm run images       # rigenera copertine WebP e immagini di condivisione
```

Serve Node 22.12 o più recente. Per `npm run images` crea un file `.tcr-source` con una sola riga: il percorso della cartella The-Consulting-Room (con `miniature/`, `pacchetti/` e `autore.jpg`). Il file resta sul tuo computer e non va su GitHub.

## Dove sta cosa

| Cosa | Dove |
| --- | --- |
| Catalogo (titoli, descrizioni, prezzi, link Etsy, bundle) | `data/products.json` |
| Impostazioni (email, prezzi sì/no, newsletter, statistiche) | `src/config.ts` |
| Indirizzo del sito (dominio) | `astro.config.mjs`, costante `SITE` |
| Colori, font, componenti grafici | `src/styles/global.css` |
| Animazioni (GSAP) | `src/scripts/motion.ts` |
| Libro 3D e scaffale | `src/components/Book.astro`, `src/components/Shelf.astro` |
| Pagine | `src/pages/` |
| Articoli | `src/articles/*.md` |
| Copertine ottimizzate (generate) | `public/images/` |

Le pagine prodotto, il catalogo, i bundle, la sitemap e i dati strutturati si generano da `data/products.json`: non ci sono pagine prodotto da scrivere a mano.

## Aggiungere un prodotto

1. Metti la copertina quadrata in `EN-Market/The-Consulting-Room/miniature/<ID>.jpg` (l'ID è il numero dell'inserzione Etsy).
2. Aggiungi un blocco in `data/products.json`, dentro `"products"`, copiando uno esistente. I campi:
   - `id`: numero dell'inserzione Etsy
   - `slug`: l'indirizzo della pagina, in minuscolo con trattini (es. `the-distance-map`)
   - `title`, `subtitle`, `kind` (es. "Clinical compendium", "Worksheets")
   - `line`: `ai`, `psychodynamic` oppure `tools`
   - `formats`: es. `["PDF", "EPUB"]`
   - `pages`: numero di pagine (decide anche lo spessore del libro 3D)
   - `summary` (una riga), `description` (2-3 frasi), `whoFor`, `inside` (l'indice, una voce per riga)
   - `price`: `{ "amount": 17.58, "currency": "USD" }` oppure togli il campo per non mostrare il prezzo
   - `etsyUrl`: `https://www.etsy.com/listing/<ID>`, senza parametri
3. Se il prodotto entra in un bundle, aggiungi il suo ID all'elenco `includes` del bundle.
4. Lancia `npm run images`, poi `npm run build`.

## Cambiare un link o un prezzo

- **Link Etsy**: modifica `etsyUrl` del prodotto o del bundle in `data/products.json`. Usa sempre la forma pulita `https://www.etsy.com/listing/<ID>`: niente `?ref=`, `click_key` o altri parametri.
- **Link del negozio**: `etsyShop` in `src/config.ts`.
- **Prezzi**: sono i prezzi base Etsy in dollari, letti il 15 ottobre 2026. Se li cambi, aggiorna `price.amount` e la data `pricesCheckedOn` in cima al file. Il confronto "bought separately" dei bundle si ricalcola da solo. Per nascondere tutti i prezzi metti `showPrices: false` in `src/config.ts`.

## Promozioni

La promozione in corso sta in `data/products.json`, nel blocco `promotion` in cima:

```json
"promotion": { "label": "Autumn opening offer", "percent": 30, "ends": "2026-11-10" }
```

e ogni prodotto o bundle ha il suo `salePrice`, cioè il prezzo scontato che mostra Etsy. Il sito allora mostra la barra in alto, il prezzo scontato, il prezzo pieno barrato e il badge "30% off until November 10".

- **Fine automatica**: dopo la data `ends` il browser nasconde da solo barra, sconti e badge e torna ai prezzi pieni, anche se non rifai il build. Per pulire anche i dati per Google, togli il blocco `promotion` (o i `salePrice`) e rifai il build.
- **Nuova promozione** (es. il Cyber del 23 novembre, -35%): aggiorna `label`, `percent`, `ends` e i `salePrice` leggendoli dal negozio Etsy, poi `npm run build`.
- Scrivi solo sconti che sono davvero attivi su Etsy, con la loro data di fine vera.

## Copertine e ritratto

Le copertine arrivano da `miniature/<ID>.jpg`; se manca un file, lo script crea una copertina tipografica provvisoria. Il ritratto arriva da `autore.jpg` nella cartella del negozio. Dopo ogni cambio: `npm run images`.

## Articoli

Ogni file `.md` in `src/articles/` diventa una pagina in `/articles/<nome-file>/`. Copia `src/articles/_example-draft.md`, rinominalo senza il trattino basso iniziale e imposta:

```yaml
title: "Titolo"
description: "Una frase per Google e per l'anteprima"
date: "2026-11-01"
audience: "public"   # oppure "clinicians"
draft: false
```

Gli articoli `audience: "public"` mostrano in fondo l'avviso che non sono terapia e il numero di crisi USA 988. La voce Articles compare nel menu e nella sitemap solo quando esiste almeno un articolo pubblicato.

## Newsletter e statistiche

- **Newsletter**: il componente è pronto ma spento. Per attivarlo scegli un servizio con doppio opt-in (es. Buttondown o MailerLite), poi in `src/config.ts` metti `newsletter.enabled: true` e l'URL del form in `newsletter.action`. Il modulo chiede già il consenso esplicito con una casella obbligatoria. Aggiorna anche il nome del servizio nella pagina Privacy.
- **Statistiche**: spente. Per usare Plausible o GoatCounter (senza cookie, quindi senza banner) compila `analytics` in `src/config.ts`. La pagina Privacy cambia testo da sola.

## Segnaposto da completare

Restano da decidere solo il dominio (`astro.config.mjs`) e, quando attiverai la newsletter, il nome del servizio nella pagina Privacy.

## Pubblicazione e dominio personalizzato

Il sito è già pubblicato con GitHub Actions su https://flanor90.github.io/TheConsultingRoom/ (workflow in `.github/workflows/deploy.yml`, parte a ogni push su `main`). Quando avrai un dominio:

1. Nel workflow cambia `SITE_URL` nel tuo dominio (es. `https://www.tuodominio.com`) e `BASE_PATH` in `/`.
2. Crea `public/CNAME` con dentro solo il dominio, es. `www.tuodominio.com`.
3. Dal tuo provider del dominio aggiungi i record DNS: per `www` un CNAME verso `<tuo-utente>.github.io`; per il dominio senza `www` i quattro record A di GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
4. In Settings → Pages scrivi il dominio in **Custom domain** e, quando il certificato è pronto, attiva **Enforce HTTPS**.

Le copertine in `public/images/` vanno nel repository (sono generate dallo script ma servono al build su GitHub).

### In alternativa, Netlify

Collega il repository su Netlify con comando di build `npm run build` e cartella `dist`. Il dominio si imposta in Domain settings; non serve il file CNAME.

## Design system

Le regole visive e di voce sono nell'Artifact "The Consulting Room" (design system) su claude.ai: palette, tipografia, componenti, tono. Se cambi un colore qui, aggiornalo anche lì.
