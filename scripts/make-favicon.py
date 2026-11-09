#!/usr/bin/env python3
"""Generates public/favicon.svg: "MDA" monogram (Montserrat 700 outlines, so no font dependency)
on the graphite circle with the silver ring, with a light variant via prefers-color-scheme.
Run: python3 scripts/make-favicon.py   (needs: pip install fonttools brotli)"""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
f = TTFont(os.path.join(ROOT, 'node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2'))
gs, cmap, upm, hmtx = f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm, f['hmtx']
text = 'MDA'
scale = 13 / f["OS/2"].sCapHeight            # cap height = 13 of 64
tracking = upm * 0.02
names = [cmap[ord(c)] for c in text]
width = (sum(hmtx[n][0] for n in names) + tracking * (len(names) - 1)) * scale
x = (64 - width) / 2
y = 32 + 13 / 2
parts = []
for n in names:
    p = SVGPathPen(gs)
    gs[n].draw(TransformPen(p, (scale, 0, 0, -scale, x, y)))
    parts.append(p.getCommands())
    x += (hmtx[n][0] + tracking) * scale
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <style>
    .bg{{fill:#161A20}}.ring{{fill:none;stroke:#B0B8C4;stroke-width:3}}.mono{{fill:#E5E7EB}}
    @media (prefers-color-scheme:light){{.bg{{fill:#F4F5F7}}.ring{{stroke:#2A2E35}}.mono{{fill:#1C1F26}}}}
  </style>
  <circle class="bg" cx="32" cy="32" r="31"/>
  <circle class="ring" cx="32" cy="32" r="29.5"/>
  <path class="mono" d="{' '.join(parts)}"/>
</svg>
'''
out = os.path.join(ROOT, 'public/favicon.svg')
open(out, 'w').write(svg)
print(f'✔ wrote {out} ({len(svg)} bytes, monogram width {width:.1f})')
