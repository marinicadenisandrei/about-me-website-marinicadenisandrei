/**
 * Pointer-driven micro-interactions (transform-only, pointer:fine, off under reduced motion):
 *  - tilt:     glass cards tilt a few degrees toward the cursor (macOS-style 3D hover)
 *  - magnetic: primary buttons drift 0-6px toward the cursor and spring back
 */
const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initTilt(root: ParentNode = document): void {
  if (!fine()) return;
  root.querySelectorAll<HTMLElement>('.glass--lift:not([data-tilt])').forEach((el) => {
    el.dataset.tilt = '';
    let raf = 0, rx = 0, ry = 0;
    const apply = () => { raf = 0; el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`; };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry = px * 5; rx = -py * 5;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    el.addEventListener('pointerdown', () => { el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(0.98)`; });
    el.addEventListener('pointerup', () => { if (!raf) raf = requestAnimationFrame(apply); });
  });
}

export function initMagnetic(root: ParentNode = document): void {
  if (!fine()) return;
  root.querySelectorAll<HTMLElement>('.btn--primary:not([data-magnetic])').forEach((el) => {
    el.dataset.magnetic = '';
    let raf = 0, dx = 0, dy = 0;
    const apply = () => { raf = 0; el.style.setProperty('--mag-x', `${dx}px`); el.style.setProperty('--mag-y', `${dy}px`); };
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      dx = ((e.clientX - r.left) / r.width - 0.5) * 10;
      dy = ((e.clientY - r.top) / r.height - 0.5) * 8;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    el.addEventListener('pointerleave', () => { dx = 0; dy = 0; if (!raf) raf = requestAnimationFrame(apply); });
  });
}
