/** Luminary animated counters: <span class="counter" data-target="12" data-decimals="0">0</span> */
export function initCounters(root: ParentNode = document): void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll<HTMLElement>('.counter').forEach((el) => {
    const target = parseFloat(el.dataset.target ?? '0');
    const decimals = parseInt(el.dataset.decimals ?? '0', 10);
    const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (reduce || !('IntersectionObserver' in window)) {
      el.textContent = fmt(target);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const dur = 1800;
        const start = performance.now();
        const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const step = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = fmt(target * ease(p));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
  });
}
