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
  // The loop only runs while the spot is still travelling; it stops once it has settled
  // (a permanent rAF loop repainted the viewport-wide mask every frame).
  let visible = true, raf = 0;
  const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; if (visible) kick(); });
  io.observe(hero);
  function kick() { if (!raf && visible) raf = requestAnimationFrame(lerp); }
  function lerp() {
    raf = 0;
    gx += (tx - gx) * 0.1;
    gy += (ty - gy) * 0.1;
    grid.style.setProperty('--mx', `${gx.toFixed(1)}px`);
    grid.style.setProperty('--my', `${gy.toFixed(1)}px`);
    if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) kick();
  }
  document.addEventListener('mousemove', kick, { passive: true });
  kick();
}
