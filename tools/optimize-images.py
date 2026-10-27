#!/usr/bin/env python3
"""Make the site's photos fast: create WebP copies in three sizes and point the
pages at them. Safe to run any number of times; only new or changed photos are
converted. Runs automatically before every commit (see tools/install-hooks.sh).

  python3 tools/optimize-images.py

Needs `cwebp` (brew install webp). macOS `sips` is used to read photo sizes.
"""
import os, re, subprocess, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIDTHS = (480, 960, 1600)                  # phone, tablet/laptop, large screens and the photo viewer
QUALITY = '78'
SKIP = {'apple-touch-icon.png', 'share-preview.jpg'}   # social previews need JPG/PNG
PAGES = [f for f in os.listdir(ROOT) if f.endswith('.html')]
SOURCES = [('images', f) for f in sorted(os.listdir(os.path.join(ROOT, 'images')))] + \
          [('videos', f) for f in sorted(os.listdir(os.path.join(ROOT, 'videos'))) if f.endswith('-poster.jpg')]

def width_of(path):
    out = subprocess.run(['sips', '-g', 'pixelWidth', path], capture_output=True, text=True).stdout
    return int(re.search(r'pixelWidth: (\d+)', out).group(1))

def webp_name(folder, name, w):
    return f'{folder}/webp/{os.path.splitext(name)[0]}-{w}.webp'

made = {}            # "images/foo.jpg" -> [(width, "images/webp/foo-480.webp"), ...]
converted = 0
for folder, name in SOURCES:
    if not re.search(r'\.(jpe?g|png)$', name, re.I) or name in SKIP:
        continue
    src = os.path.join(ROOT, folder, name)
    os.makedirs(os.path.join(ROOT, folder, 'webp'), exist_ok=True)
    full = width_of(src)
    sizes = sorted({min(w, full) for w in WIDTHS})
    variants = []
    for w in sizes:
        rel = webp_name(folder, name, w)
        dst = os.path.join(ROOT, rel)
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
            subprocess.run(['cwebp', '-quiet', '-q', QUALITY, '-m', '6', '-sharp_yuv', '-metadata', 'none',
                            '-resize', str(w), '0', src, '-o', dst], check=True)
            converted += 1
        variants.append((w, rel))
    made[f'{folder}/{name}'] = variants

def sizes_for(tag, before):
    """Pick a sensible 'sizes' hint from where the photo sits on the page."""
    o, c = before.rfind('<figure'), before.rfind('</figure>')
    fig = before[o:before.find('>', o) + 1] if o > c else ''          # the open <figure ...> tag around this photo
    if 'g-feature-tile' in fig: return '(max-width: 1024px) 100vw, 50vw'
    if 'g-wide' in fig:    return '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw'
    if 'g-item' in fig:    return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
    if 'portrait' in fig:  return '(max-width: 560px) 50vw, (max-width: 860px) 260px, 22vw'
    if 'service-img' in before[before.rfind('<div'):]: return '(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 25vw'
    if 'v-play' in before[before.rfind('<button'):]:      return '(max-width: 860px) 50vw, 25vw'
    if before.rfind('g-feature-mosaic') > before.rfind('</div>'): return '(max-width: 860px) 60vw, 30vw'
    return '(max-width: 860px) 100vw, 50vw'

IMG = re.compile(r'<img\b[^>]*?\bsrc="((?:images|videos)/[^"]+\.(?:jpe?g|png))"[^>]*>', re.I)
def rewrite_img(m, text):
    tag, src = m.group(0), m.group(1)
    if src not in made: return tag
    v = made[src]
    tag = re.sub(r'\s(?:srcset|sizes|data-full)="[^"]*"', '', tag)
    srcset = ', '.join(f'{p} {w}w' for w, p in v)
    extra = f' srcset="{srcset}" sizes="{sizes_for(tag, text[:m.start()])}" data-full="{v[-1][1]}"'
    return tag[:-1].rstrip('/').rstrip() + extra + '>'

POSTER = re.compile(r'\bposter="((?:videos|images)/[^"]+\.(?:jpe?g|png))"')
changed = []
for page in PAGES:
    p = os.path.join(ROOT, page); text = open(p).read(); orig = text
    text = IMG.sub(lambda m: rewrite_img(m, text), text)
    text = POSTER.sub(lambda m: f'poster="{made[m.group(1)][-1][1]}"' if m.group(1) in made else m.group(0), text)
    if text != orig:
        open(p, 'w').write(text); changed.append(page)

# Stylesheet backgrounds: use the large WebP (phones get the 960 inside small-screen rules)
css_path = os.path.join(ROOT, 'styles.css'); css = open(css_path).read(); orig = css
def css_url(m, small=False):
    src = m.group(1)
    if src not in made: return m.group(0)
    v = made[src]; pick = [p for w, p in v if w <= 960][-1] if small else v[-1][1]
    return f'url("{pick}")'
out, pos, depth_small = [], 0, []
for block in re.split(r'(@media[^{]*\{)', css):
    if block.startswith('@media'):
        out.append(block); depth_small.append(bool(re.search(r'max-width:\s*(\d+)px', block) and int(re.search(r'max-width:\s*(\d+)px', block).group(1)) <= 860)); continue
    small = depth_small[-1] if depth_small else False
    out.append(re.sub(r'url\("((?:images|videos)/[^"]+\.(?:jpe?g|png))"\)', lambda m: css_url(m, small), block))
css = ''.join(out)
if css != orig:
    open(css_path, 'w').write(css); changed.append('styles.css')

print(f'optimize-images: {converted} WebP file(s) created, updated: {", ".join(changed) or "nothing"}')
