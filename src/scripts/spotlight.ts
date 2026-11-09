/**
 * Cursor-following highlight — the template's --mx/--my technique, generalised.
 * Used by the hero grid (lerped, window-level) and by .glass--spot cards (direct).
 */
export function initCardSpot(root: ParentNode = document): void {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  root.querySelectorAll<HTMLElement>('.glass--spot:not([data-spot])').forEach((card) => {
    card.dataset.spot = '';
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function initHeroGrid(hero: HTMLElement, grid: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  let gx = 0, gy = 0, tx = 0, ty = 0;
  const reset = () => {
    const g = grid.getBoundingClientRect();
    tx = g.width / 2;
    ty = g.height * 0.3;
  };
  reset();
  document.addEventListener(
    'mousemove',
    (e) => {
      const h = hero.getBoundingClientRect();
      const g = grid.getBoundingClientRect();
      if (e.clientY >= h.top + h.height * 0.3 && e.clientY <= h.bottom) {
        tx = e.clientX - g.left;
        ty = e.clientY - g.top;
      } else reset();
    },
    { passive: true },
  );
  let running = true;
  const io = new IntersectionObserver(([e]) => { running = !!e?.isIntersecting; if (running) requestAnimationFrame(lerp); });
  io.observe(hero);
  function lerp() {
    gx += (tx - gx) * 0.08;
    gy += (ty - gy) * 0.08;
    grid.style.setProperty('--mx', `${gx}px`);
    grid.style.setProperty('--my', `${gy}px`);
    if (running) requestAnimationFrame(lerp);
  }
}
