// Movimento del sito: un solo gesto firma, gli scaffali che si riempiono quando entrano nello schermo.
// Tutto il resto della pagina è già nel suo stato finale; con "riduci movimento" non parte nulla.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce && 'IntersectionObserver' in window) {
  const shelves = document.querySelectorAll<HTMLElement>('[data-shelf]');
  if (shelves.length) {
    document.documentElement.classList.add('shelf-motion');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }),
      { rootMargin: '0px 0px -12% 0px' }
    );
    shelves.forEach((s) => io.observe(s));
    // Se l'osservatore non scatta (scheda in background, stampa), gli scaffali restano comunque visibili.
    setTimeout(() => shelves.forEach((s) => s.getBoundingClientRect().top < innerHeight && s.classList.add('is-in')), 1500);
  }
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
