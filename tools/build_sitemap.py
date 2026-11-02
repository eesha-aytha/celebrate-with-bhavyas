"""Writes sitemap.xml: every page, plus the photos on each page so they show up in Google Images.
Runs automatically before every commit; to run by hand: python3 tools/build_sitemap.py"""
import os, re, subprocess, datetime
from xml.sax.saxutils import escape

ROOT = os.path.join(os.path.dirname(__file__), '..')
SITE = 'https://bhavyasevents.com/'
# (page, address on the site, how often it changes, priority)
PAGES = [
    ('index.html', '', 'monthly', '1.0'),
    ('gallery.html', 'gallery.html', 'monthly', '0.8'),
    ('quote.html', 'quote.html', 'yearly', '0.9'),
    ('destination-weddings.html', 'destination-weddings.html', 'monthly', '0.8'),
    ('faq.html', 'faq.html', 'monthly', '0.7'),
    ('privacy.html', 'privacy.html', 'yearly', '0.3'),
]
# Full-screen background photos set in styles.css, which the pages don't list as <img>
BACKGROUNDS = {
    'index.html': ['images/hero-mandap-celebration.jpg'],
    'destination-weddings.html': ['images/cliffside-floral-arch.jpg'],
}

def last_changed(page):
    """The day the page last changed: today if it has unsaved edits, else its last commit."""
    git = lambda *a: subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if git('status', '--porcelain', '--', page):
        return datetime.date.today().isoformat()
    return git('log', '-1', '--format=%cs', '--', page) or datetime.date.today().isoformat()

def photos(page):
    html = open(os.path.join(ROOT, page), encoding='utf-8').read()
    found = BACKGROUNDS.get(page, []) + re.findall(r'<img\b[^>]*?\bsrc="(images/[^"]+\.(?:jpe?g|png))"', html, re.I)
    return list(dict.fromkeys(found))   # each photo once, in page order

entries = []
for page, path, freq, priority in PAGES:
    images = ''.join(f'\n    <image:image><image:loc>{escape(SITE + src)}</image:loc></image:image>' for src in photos(page))
    entries.append(f'''  <url>
    <loc>{SITE}{path}</loc>
    <lastmod>{last_changed(page)}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>{images}
  </url>''')

xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
       '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
       + '\n'.join(entries) + '\n</urlset>\n')
path = os.path.join(ROOT, 'sitemap.xml')
if not os.path.exists(path) or open(path, encoding='utf-8').read() != xml:
    open(path, 'w', encoding='utf-8').write(xml)
    print('build_sitemap: sitemap.xml updated')
