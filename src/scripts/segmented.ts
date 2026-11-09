/** iOS segmented control: moves the glass thumb under the active button; emits "segmented:change". */
export function initSegmented(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.segmented:not([data-bound])').forEach((seg) => {
    seg.dataset.bound = '';
    const thumb = seg.querySelector<HTMLElement>('.segmented__thumb');
    const btns = [...seg.querySelectorAll<HTMLButtonElement>('.segmented__btn')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastX = 0, lastW = 0;
    const move = (btn: HTMLElement, animate = true) => {
      if (!thumb) return;
      const x = btn.offsetLeft - 3, w = btn.offsetWidth;
      if (animate && !reduce && seg.hasAttribute('data-ready') && (x !== lastX || w !== lastW)) {
        // liquid blob: the thumb stretches toward the target, then snaps to size
        const dir = x > lastX ? 1 : -1;
        const stretch = Math.min(Math.abs(x - lastX) * 0.55, 56);
        const from = { transform: `translateX(${lastX}px)`, width: `${lastW}px` };
        const mid = { transform: `translateX(${Math.min(x, lastX) + (dir > 0 ? 0 : 0)}px)`, width: `${Math.abs(x - lastX) + Math.max(w, lastW) + stretch * 0}px`, offset: 0.45 };
        const to = { transform: `translateX(${x}px)`, width: `${w}px` };
        thumb.animate([from, mid, to], { duration: 520, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.05)' });
      }
      thumb.style.width = `${w}px`;
      thumb.style.transform = `translateX(${x}px)`;
      lastX = x; lastW = w;
    };
    const select = (btn: HTMLButtonElement, emit = true) => {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      move(btn);
      if (emit) seg.dispatchEvent(new CustomEvent('segmented:change', { bubbles: true, detail: { value: btn.dataset.value, group: seg.dataset.group } }));
    };
    btns.forEach((b) => b.addEventListener('click', () => select(b)));
    const active = btns.find((b) => b.getAttribute('aria-pressed') === 'true') ?? btns[0];
    if (active) {
      select(active, false);
      requestAnimationFrame(() => { move(active, false); seg.setAttribute('data-ready', ''); });
    }
    addEventListener('resize', () => { const a = btns.find((b) => b.getAttribute('aria-pressed') === 'true'); if (a) move(a); }, { passive: true });
  });
}
