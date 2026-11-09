#!/usr/bin/env python3
"""Generates Open Graph images (1200×630) from the brand avatar + Montserrat.
  python3 scripts/make-og.py             → public/og-default.png
  python3 scripts/make-og.py --projects  → public/og/projects/<slug>.png for every project (title + summary)
Needs: pip install pillow fonttools brotli. Runs in CI before `astro build`."""
import os, io, sys, re, glob, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'node_modules/@fontsource/montserrat/files')
from fontTools.merge import Merger
def ttf(weight):
    # fontsource ships per-subset files; merge latin + latin-ext so "Ă" renders.
    paths = []
    for sub in ('latin', 'latin-ext'):
        f = TTFont(os.path.join(FONTS, f'montserrat-{sub}-{weight}-normal.woff2')); f.flavor = None
        tmp = f'/tmp/montserrat-{sub}-{weight}.ttf'; f.save(tmp); paths.append(tmp)
    merged = Merger().merge(paths)
    b = io.BytesIO(); merged.save(b); b.seek(0); return b
W, H = 1200, 630
img = Image.new('RGB', (W, H), (15, 17, 21))
# mesh orbs
orbs = Image.new('RGB', (W, H), (15, 17, 21)); d = ImageDraw.Draw(orbs)
for (x, y, r, c) in [(-100, -150, 520, (46, 58, 140)), (1150, 80, 480, (40, 90, 150)), (500, 650, 420, (36, 100, 95)), (980, 560, 320, (80, 50, 120))]:
    d.ellipse((x - r, y - r, x + r, y + r), fill=c)
orbs = orbs.filter(ImageFilter.GaussianBlur(120))
img = Image.blend(img, orbs, 0.55)
# avatar
av = Image.open(os.path.join(ROOT, 'src/assets/brand/logo-icon-512.png')).convert('RGBA').resize((400, 400), Image.LANCZOS)
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
gd.ellipse((760, 80, 1160, 480), fill=(90, 120, 220, 120)); glow = glow.filter(ImageFilter.GaussianBlur(70))
img = Image.alpha_composite(img.convert('RGBA'), glow); img.alpha_composite(av, (760, 115))
# text
d = ImageDraw.Draw(img)
f700 = ImageFont.truetype(ttf(700), 58); f300 = ImageFont.truetype(ttf(300), 58); f500 = ImageFont.truetype(ttf(500), 20); fm = ImageFont.truetype(ttf(400), 17)
d.text((80, 200), 'MARINICĂ', font=f700, fill=(229, 231, 235))
d.text((80, 268), 'DENIS-ANDREI', font=f300, fill=(176, 184, 196))
lines = ['SENIOR DEVOPS ENGINEER @ LSEG', 'PHD CANDIDATE · AIOPS & MLOPS', 'TEACHING AI & MACHINE LEARNING @ ACS-UNSTPB']
y = 370
for l in lines:
    d.text((80, y), l, font=f500, fill=(156, 163, 175), spacing=4); y += 34
d.rounded_rectangle((80, 528, 86, 560), radius=3, fill=(109, 140, 230))
d.text((100, 538), 'BUCHAREST, ROMANIA', font=fm, fill=(107, 114, 128))
base_img = img

def render(path, title, subtitle, kicker):
    im = base_img.copy(); dd = ImageDraw.Draw(im)
    # cover the default text block
    dd.rectangle((60, 170, 760, 600), fill=None)
    cover = Image.new('RGBA', (720, 460), (0, 0, 0, 0)); im.alpha_composite(cover, (40, 150))
    return im, dd

if '--projects' in sys.argv:
    out_dir = os.path.join(ROOT, 'public/og/projects'); os.makedirs(out_dir, exist_ok=True)
    ft = ImageFont.truetype(ttf(600), 44); fs = ImageFont.truetype(ttf(400), 22); fk = ImageFont.truetype(ttf(500), 16)
    # rebuild a clean background (orbs + avatar, no name block)
    bg = Image.new('RGB', (W, H), (15, 17, 21)); bg = Image.blend(bg, orbs, 0.55).convert('RGBA'); bg = Image.alpha_composite(bg, glow); bg.alpha_composite(av.resize((300, 300), Image.LANCZOS), (840, 165))
    for f in glob.glob(os.path.join(ROOT, 'src/content/projects/[!_]*.mdx')):
        slug = os.path.splitext(os.path.basename(f))[0]
        fm = open(f, encoding='utf8').read().split('---')[1]
        title = re.search(r'^title:\s*(.+)$', fm, re.M).group(1).strip().strip('"')
        summary = re.search(r'^summary:\s*(.+)$', fm, re.M).group(1).strip().strip('"')
        im = bg.copy(); dd = ImageDraw.Draw(im)
        dd.text((80, 90), 'PROJECT · MARINICĂ DENIS-ANDREI', font=fk, fill=(156, 163, 175))
        y = 150
        for line in textwrap.wrap(title, 30)[:3]:
            dd.text((80, y), line, font=ft, fill=(229, 231, 235)); y += 56
        y += 14
        for line in textwrap.wrap(summary, 58)[:4]:
            dd.text((80, y), line, font=fs, fill=(176, 184, 196)); y += 32
        dd.rounded_rectangle((80, 548, 86, 580), radius=3, fill=(109, 140, 230))
        dd.text((100, 556), 'BUCHAREST, ROMANIA', font=fm_font if False else fk, fill=(107, 114, 128))
        im.convert('RGB').save(os.path.join(out_dir, f'{slug}.png'), optimize=True)
        print(f'✔ public/og/projects/{slug}.png')
else:
    img.convert('RGB').save(os.path.join(ROOT, 'public/og-default.png'), optimize=True)
    print('✔ public/og-default.png')
