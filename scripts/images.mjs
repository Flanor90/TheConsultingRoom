// Ottimizza le copertine in WebP (800 e 1600 px) e crea le immagini Open Graph.
// Legge gli originali dalla cartella del negozio e NON li modifica.
// Uso: npm run images (legge il percorso da .tcr-source o da TCR_SOURCE)
import { readFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Cartella con miniature/, pacchetti/ e autore.jpg: dalla variabile TCR_SOURCE
// oppure dal file locale .tcr-source (una riga con il percorso, non va nel repository).
const SOURCE = (process.env.TCR_SOURCE ?? (await readFile('.tcr-source', 'utf8').catch(() => ''))).trim();
if (!SOURCE) {
  console.error('Manca la cartella sorgente: crea il file .tcr-source con il percorso di The-Consulting-Room.');
  process.exit(1);
}
const OUT = path.resolve('public/images');
const data = JSON.parse(await readFile('data/products.json', 'utf8'));

const PAPER = '#F3EFE6';
const NIGHT = '#1E2A3A';
const SAGE = '#9CAF9A';
const SAGE_DEEP = '#4E664C';
const LINE_NAMES = Object.fromEntries(data.lines.map((l) => [l.id, l.name]));

const exists = (p) => access(p).then(() => true, () => false);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

// Copertina tipografica provvisoria, usata solo se manca miniature/<id>.jpg
function placeholderSvg(p) {
  const title = wrap(p.title, 16);
  const sub = wrap(p.subtitle, 44).slice(0, 3);
  const meta = `${p.pages} ${p.pages === 1 ? 'page' : 'pages'} · ${p.formats.join(' + ')}`;
  const tSize = title.length > 3 ? 150 : 172;
  const tStart = 760 - (title.length - 1) * (tSize * 0.55);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000" viewBox="0 0 2000 2000">
  <rect width="2000" height="2000" fill="${PAPER}"/>
  <rect x="60" y="60" width="1880" height="1880" fill="none" stroke="#D8D1C2" stroke-width="4"/>
  <text x="1000" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="54" letter-spacing="6" fill="${SAGE_DEEP}">${esc(LINE_NAMES[p.line])}</text>
  <circle cx="1000" cy="${tStart - 260}" r="70" fill="none" stroke="${SAGE}" stroke-width="5"/>
  ${title
    .map(
      (l, i) =>
        `<text x="1000" y="${tStart + i * tSize * 1.08}" text-anchor="middle" font-family="Georgia, serif" font-size="${tSize}" font-weight="700" fill="${NIGHT}">${esc(l)}</text>`
    )
    .join('\n  ')}
  ${sub
    .map(
      (l, i) =>
        `<text x="1000" y="${tStart + title.length * tSize * 1.08 + 80 + i * 72}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="58" fill="#3D4A5C">${esc(l)}</text>`
    )
    .join('\n  ')}
  <text x="1000" y="1560" text-anchor="middle" font-family="Georgia, serif" font-size="56" fill="${NIGHT}">Alberto Del Bove</text>
  <rect x="200" y="1660" width="1600" height="190" fill="${NIGHT}"/>
  <text x="1000" y="1782" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="74" font-weight="700" fill="${PAPER}">${esc(meta)}</text>
</svg>`;
}

async function writeWebp(input, base, widths = [800, 1600]) {
  await mkdir(path.dirname(base), { recursive: true });
  for (const w of widths) {
    await sharp(input).resize(w, w, { fit: 'inside' }).webp({ quality: 80 }).toFile(`${base}-${w}.webp`);
  }
}

async function writeOg(input, file, title, kicker) {
  await mkdir(path.dirname(file), { recursive: true });
  const cover = await sharp(input).resize(560, 560).toBuffer();
  const lines = wrap(title, 22).slice(0, 4);
  const size = lines.length > 2 ? 46 : 56;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="70" y="110" font-family="Georgia, serif" font-size="30" fill="${SAGE_DEEP}">The Consulting Room</text>
  ${lines
    .map((l, i) => `<text x="70" y="${230 + i * size * 1.18}" font-family="Georgia, serif" font-size="${size}" font-weight="700" fill="${NIGHT}">${esc(l)}</text>`)
    .join('')}
  <text x="70" y="${230 + lines.length * size * 1.18 + 24}" font-family="Georgia, serif" font-style="italic" font-size="28" fill="#3D4A5C">${esc(kicker)}</text>
  <text x="70" y="575" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#3D4A5C">Clinical guides by Alberto Del Bove</text>
</svg>`;
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: PAPER } })
    .composite([{ input: cover, left: 600, top: 35 }, { input: Buffer.from(svg), left: 0, top: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(file);
}

const missing = [];
for (const p of data.products) {
  const src = path.join(SOURCE, 'miniature', `${p.id}.jpg`);
  let input;
  if (await exists(src)) input = src;
  else {
    missing.push(p.id);
    input = await sharp(Buffer.from(placeholderSvg(p))).png().toBuffer();
  }
  await writeWebp(input, path.join(OUT, 'covers', p.id), [400, 800, 1600]);
  await writeOg(input, path.join(OUT, 'og', `${p.id}.jpg`), p.title, p.kind);
}

const bundleDirs = {
  'ai-in-therapy-complete-kit': ['AI-in-Therapy-Complete-Kit', '01_hero.jpg', '02_inside.jpg'],
  'psychodynamic-practice-bundle': ['Psychodynamic-Practice-Bundle', 'p01_hero.jpg', 'p02_inside.jpg'],
  'the-consulting-room-complete-library': ['The-Consulting-Room-Complete-Library', 'l01_hero.jpg', 'l02_inside.jpg'],
};
for (const b of data.bundles) {
  const [dir, hero, inside] = bundleDirs[b.slug] ?? [];
  if (!dir) continue;
  const heroSrc = path.join(SOURCE, 'pacchetti', dir, hero);
  await writeWebp(heroSrc, path.join(OUT, 'bundles', `${b.slug}-hero`));
  await writeWebp(path.join(SOURCE, 'pacchetti', dir, inside), path.join(OUT, 'bundles', `${b.slug}-inside`));
  await writeOg(heroSrc, path.join(OUT, 'og', `${b.slug}.jpg`), b.title, `${b.includes.length} titles, ${b.pages} pages`);
}

// Immagine di condivisione generica: la libreria completa
await writeOg(
  path.join(SOURCE, 'pacchetti', 'The-Consulting-Room-Complete-Library', 'l01_hero.jpg'),
  path.join(OUT, 'og', 'default.jpg'),
  'Clinical guides for therapists whose clients already talk to AI',
  'Written by a psychoanalytic clinician'
);

// Ritratto dell'autore: salva la foto come autore.jpg nella cartella del negozio.
const portrait = ['autore.jpg', 'autore.jpeg', 'autore.png'].map((f) => path.join(SOURCE, f));
let portraitDone = false;
for (const f of portrait) {
  if (!(await exists(f))) continue;
  await mkdir(path.join(OUT, 'author'), { recursive: true });
  for (const w of [480, 960]) {
    await sharp(f).rotate().resize(w, Math.round(w * 1.25), { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(path.join(OUT, 'author', `portrait-${w}.webp`));
  }
  portraitDone = true;
  break;
}

console.log(`Fatto: ${data.products.length} copertine, ${data.bundles.length} bundle${portraitDone ? ', ritratto' : ''}.`);
if (!portraitDone) console.log('Ritratto non trovato: salva la foto come autore.jpg nella cartella del negozio.');
if (missing.length)
  console.log(
    `Copertina provvisoria (manca miniature/<id>.jpg) per: ${missing.join(', ')}.\n` +
      'Aggiungi i file JPG in miniature/ e rilancia "npm run images".'
  );
