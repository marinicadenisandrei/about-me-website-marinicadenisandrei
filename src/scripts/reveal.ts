/** Luminary reveal-on-scroll. Respects prefers-reduced-motion (CSS already shows everything). */
export function initReveal(root: ParentNode = document): void {
  const els = root.querySelectorAll<HTMLElement>('.reveal:not(.visible)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  // stagger siblings (cards in a grid) like an iOS app grid appearing
  const seen = new Map<Element, number>();
  els.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const n = seen.get(parent) ?? 0;
    if (!el.style.getPropertyValue('--i') && !/reveal-d\d/.test(el.className)) el.style.setProperty('--i', String(Math.min(n, 8)));
    seen.set(parent, n + 1);
  });
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
