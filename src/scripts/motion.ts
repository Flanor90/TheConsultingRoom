// Movimento del sito (GSAP + ScrollTrigger). Con "riduci movimento" non parte nulla
// e la pagina resta nel suo stato finale, leggibile.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  // Le animazioni seguono il tempo reale anche se il browser salta dei frame.
  gsap.ticker.lagSmoothing(0);

  // Scroll morbido, sincronizzato con ScrollTrigger.
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -100 }); }
    })
  );
  const ease = 'expo.out';

  // Titoli divisi in parole: ogni parola sale ruotando in 3D dalla riga sotto.
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const words = el.querySelectorAll('.w__i');
    const onLoad = el.hasAttribute('data-split-now');
    gsap.from(words, {
      yPercent: 115,
      rotateX: -70,
      opacity: 0,
      duration: 1.3,
      ease,
      stagger: 0.045,
      delay: onLoad ? 0.15 : 0,
      scrollTrigger: onLoad ? undefined : { trigger: el, start: 'top 85%', once: true },
    });
  });

  // Blocchi che entrano quando arrivano nello schermo.
  const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  gsap.set(reveals, { opacity: 0, y: 48 });
  ScrollTrigger.batch(reveals, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, ease, stagger: 0.09, overwrite: true }),
  });

  // Scaffali: i libri arrivano uno dopo l'altro e si mettono in piedi.
  gsap.utils.toArray<HTMLElement>('[data-shelf]').forEach((shelf) => {
    const books = shelf.querySelectorAll('[data-shelf-book]');
    gsap.from(books, {
      x: 120,
      y: -30,
      rotate: 8,
      opacity: 0,
      duration: 1.1,
      ease,
      stagger: 0.06,
      scrollTrigger: { trigger: shelf, start: 'top 85%', once: true },
    });
  });

  // Griglie di schede: ondata a cascata.
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((grid) => {
    const items = gsap.utils.toArray<HTMLElement>(grid.children);
    gsap.set(items, { opacity: 0, y: 60, rotateX: -12, transformPerspective: 900 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease, stagger: 0.08, overwrite: true }),
    });
  });

  // Parallasse legata allo scroll.
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax) || 80;
    gsap.fromTo(el, { y: -amount / 2 }, { y: amount / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });

  // Cerchi che si disegnano con lo scroll.
  gsap.utils.toArray<SVGCircleElement>('[data-draw]').forEach((c) => {
    gsap.fromTo(c, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: c.closest('section') ?? c, start: 'top 80%', end: 'center 40%', scrub: 1 } });
  });

  // Numeri che contano fino al valore reale.
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: 1.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v).toString(); },
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Barra di avanzamento della lettura.
const bar = document.querySelector<HTMLElement>('.progress');
if (bar) {
  const setP = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : '0');
  };
  addEventListener('scroll', setP, { passive: true });
  setP();
}

// Interazioni che rispondono al puntatore: solo con mouse e senza riduzione del movimento.
if (!reduce && matchMedia('(pointer: fine)').matches) {
  // Pulsanti magnetici: seguono il cursore di qualche pixel.
  document.querySelectorAll<HTMLElement>('.tcr-btn:not(.tcr-btn--quiet)').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
      btn.style.setProperty('--mx', `${x.toFixed(1)}px`);
      btn.style.setProperty('--my', `${y.toFixed(1)}px`);
    });
    btn.addEventListener('pointerleave', () => { btn.style.removeProperty('--mx'); btn.style.removeProperty('--my'); });
  });

  // Luce che segue il cursore su schede e pannelli.
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', `${e.clientX - r.left}px`);
      el.style.setProperty('--sy', `${e.clientY - r.top}px`);
      el.style.setProperty('--so', '1');
    });
    el.addEventListener('pointerleave', () => el.style.setProperty('--so', '0'));
  });

  // Nelle schede il libro si inclina verso il cursore.
  document.querySelectorAll<HTMLElement>('.tcr-card').forEach((card) => {
    const book = card.querySelector<HTMLElement>('.book');
    if (!book) return;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      book.style.setProperty('--ry', `${(14 + x * 44).toFixed(1)}deg`);
      book.style.setProperty('--rx', `${(-3 - y * 12).toFixed(1)}deg`);
    });
    card.addEventListener('pointerleave', () => { book.style.removeProperty('--ry'); book.style.removeProperty('--rx'); });
  });
}
