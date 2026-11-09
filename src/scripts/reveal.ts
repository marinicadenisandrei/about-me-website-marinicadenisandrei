/** Luminary reveal-on-scroll. Respects prefers-reduced-motion (CSS already shows everything). */
export function initReveal(root: ParentNode = document): void {
  const els = root.querySelectorAll<HTMLElement>('.reveal:not(.visible)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
  );
  els.forEach((el) => io.observe(el));
}
