/**
 * Energised card edges: adds one decorative element to each glass card (styles in energy.css) and
 * keeps the cursor position on the card so the border glow can follow it.
 */
export function initEnergy(root: ParentNode = document): void {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.querySelectorAll<HTMLElement>('.glass.card:not([data-edge])').forEach((card) => {
    card.dataset.edge = '';
    const edge = document.createElement('i');
    edge.className = 'edge';
    edge.setAttribute('aria-hidden', 'true');
    card.appendChild(edge);
    // cards with .glass--spot already track the cursor (spotlight.ts)
    if (fine && !card.classList.contains('glass--spot')) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }, { passive: true });
    }
  });
}
