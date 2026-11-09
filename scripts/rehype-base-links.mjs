/**
 * rehype plugin: prefixes site-absolute hrefs/srcs in Markdown/MDX ("/projects/x") with the
 * configured base path, so content authors can write normal links and sub-path deploys still work.
 */
import { visit } from 'unist-util-visit';

export default function rehypeBaseLinks(options = {}) {
  const base = (options.base ?? '/').replace(/\/+$/, '');
  return (tree) => {
    if (!base) return;
    visit(tree, 'element', (node) => {
      for (const attr of ['href', 'src']) {
        const v = node.properties?.[attr];
        if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(base + '/')) {
          node.properties[attr] = base + v;
        }
      }
    });
  };
}
