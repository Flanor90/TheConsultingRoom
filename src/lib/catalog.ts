import data from '../../data/products.json';
import { u } from './url';

export type Price = { amount: number; currency: string };
export type Line = (typeof data.lines)[number];
export type Product = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  subtitle: string;
  line: string;
  kind: string;
  formats: string[];
  pages: number;
  pagesNote?: string;
  summary: string;
  description: string;
  abstract?: string;
  whoFor: string;
  inside: string[];
  price?: Price;
  salePrice?: number;
  etsyUrl: string;
  featured?: boolean;
};
export type Bundle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  line: string;
  includes: string[];
  pages: number;
  formats: string[];
  delivery?: string;
  price?: Price;
  salePrice?: number;
  etsyUrl: string;
  images: { hero: string; inside: string };
  best?: boolean;
};

export const lines: Line[] = [...data.lines].sort((a, b) => a.order - b.order);
export const products: Product[] = data.products as Product[];
export const bundles: Bundle[] = data.bundles as Bundle[];
export const pricesCheckedOn: string = data.pricesCheckedOn;

/** Promozione in corso su Etsy. Finisce alla fine del giorno `ends` (ora del visitatore). */
export type Promotion = { label: string; percent: number; ends: string; note?: string };
export const promotion: Promotion | undefined = (data as { promotion?: Promotion }).promotion;
export const promoEndsAt = promotion ? new Date(`${promotion.ends}T23:59:59`).getTime() : 0;
/** Vero se la promozione è ancora in corso al momento del build. Il browser la ricontrolla da solo. */
export const promoActiveAtBuild = !!promotion && Date.now() <= promoEndsAt;
export const promoEndsLabel = promotion
  ? new Date(`${promotion.ends}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  : '';
export const saleOf = (item: { price?: Price; salePrice?: number }): Price | undefined =>
  promoActiveAtBuild && item.price && item.salePrice ? { amount: item.salePrice, currency: item.price.currency } : undefined;

const lineOrder = Object.fromEntries(lines.map((l) => [l.id, l.order]));
export const sortedProducts = [...products].sort(
  (a, b) => lineOrder[a.line] - lineOrder[b.line] || products.indexOf(a) - products.indexOf(b)
);

export const lineById = (id: string) => lines.find((l) => l.id === id);
export const productById = (id: string) => products.find((p) => p.id === id);
export const productsInLine = (id: string) => sortedProducts.filter((p) => p.line === id);
export const bundlesFor = (p: Product) => bundles.filter((b) => b.includes.includes(p.id));
export const bundleProducts = (b: Bundle) => b.includes.map(productById).filter(Boolean) as Product[];

export const coverSrc = (id: string, w: 400 | 800 | 1600 = 800) => u(`/images/covers/${id}-${w}.webp`);
export const imgSrc = (base: string, w: 800 | 1600 = 800) => u(`/images/${base}-${w}.webp`);

export function formatPrice(p?: Price) {
  if (!p) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency }).format(p.amount);
}

/** Somma dei prezzi dei titoli inclusi, calcolata dai dati (mai scritta a mano). `sale` usa i prezzi scontati. */
export function separateTotal(b: Bundle, sale = false): Price | undefined {
  const items = bundleProducts(b);
  if (!items.every((p) => p.price)) return undefined;
  const amount = Math.round(items.reduce((s, p) => s + ((sale && p.salePrice) || p.price!.amount), 0) * 100) / 100;
  return { amount, currency: items[0].price!.currency };
}

export function pagesLabel(n: number) {
  return `${n} ${n === 1 ? 'page' : 'pages'}`;
}

export function formatsLabel(f: string[]) {
  return f.length > 1 ? `${f.slice(0, -1).join(', ')} and ${f.at(-1)}` : f[0];
}

export const checkedOnLabel = new Date(pricesCheckedOn + 'T12:00:00Z').toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
