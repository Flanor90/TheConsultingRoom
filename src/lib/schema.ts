import { config } from '../config';
import { u } from './url';
import type { Product, Bundle } from './catalog';
import { coverSrc, imgSrc, bundleProducts, saleOf, promotion } from './catalog';

const abs = (path: string, site: URL) => new URL(u(path), site).href;

export function personSchema(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': abs('/about/#person', site),
    name: config.author,
    url: abs('/about/', site),
    jobTitle: 'Psychologist and psychoanalytically oriented psychotherapist',
    description:
      'Psychologist and psychoanalytically oriented psychotherapist in Itri, near Rome, trained in Demand Analysis at SPS; author of clinical guides and session tools for psychotherapists.',
    knowsLanguage: ['en', 'it', 'es'],
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Sapienza University of Rome' },
      { '@type': 'EducationalOrganization', name: 'SPS, Rome (specialization in psychoanalytic psychotherapy)' },
    ],
    knowsAbout: ['Psychoanalytic psychotherapy', 'Artificial intelligence in psychotherapy', 'Adult ADHD', 'Attachment theory'],
  };
}

export function websiteSchema(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: abs('/', site),
    description: config.description,
    inLanguage: 'en',
    author: { '@id': abs('/about/#person', site) },
  };
}

function offer(url: string, price?: { amount: number; currency: string }, sale?: { amount: number; currency: string }) {
  const now = sale ?? price;
  return {
    '@type': 'Offer',
    url,
    ...(now ? { price: now.amount.toFixed(2), priceCurrency: now.currency } : {}),
    ...(sale && promotion ? { priceValidUntil: promotion.ends } : {}),
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'Organization', name: 'Etsy shop TheConsultingRoom', url: config.etsyShop },
  };
}

export function productSchema(p: Product, site: URL) {
  const isBook = /compendium|guide/i.test(p.kind);
  return {
    '@context': 'https://schema.org',
    '@type': isBook ? ['Product', 'Book'] : 'Product',
    '@id': abs(`/guides/${p.slug}/#product`, site),
    name: p.title,
    alternateName: p.subtitle,
    description: p.description,
    ...(p.abstract ? { abstract: p.abstract } : {}),
    image: abs(coverSrc(p.id, 1600), site),
    url: abs(`/guides/${p.slug}/`, site),
    sku: p.id,
    category: p.kind,
    brand: { '@type': 'Brand', name: config.name },
    author: { '@type': 'Person', name: config.author, url: abs('/about/', site) },
    inLanguage: 'en',
    ...(isBook ? { numberOfPages: p.pages, bookFormat: 'https://schema.org/EBook' } : {}),
    offers: offer(p.etsyUrl, p.price, saleOf(p)),
  };
}

export function bundleSchema(b: Bundle, site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': abs(`/bundles/#${b.slug}`, site),
    name: b.title,
    description: b.summary,
    image: abs(imgSrc(b.images.hero, 1600), site),
    url: abs(`/bundles/#${b.slug}`, site),
    sku: b.id,
    brand: { '@type': 'Brand', name: config.name },
    isRelatedTo: bundleProducts(b).map((p) => ({ '@type': 'Product', name: p.title, url: abs(`/guides/${p.slug}/`, site) })),
    offers: offer(b.etsyUrl, b.price, saleOf(b)),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[], site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path, site) })),
  };
}
