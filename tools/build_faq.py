"""Writes the questions in faq.html (and the matching Google FAQ data) from tools/faq_content.py."""
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from faq_content import FAQ

ROOT = os.path.join(os.path.dirname(__file__), '..')
page = os.path.join(ROOT, 'faq.html')
esc = lambda t: html.escape(t, quote=False)

nav = '\n'.join(f'          <li><a href="#{key}">{esc(title)}</a></li>' for key, title, _ in FAQ)
groups = []
for key, title, items in FAQ:
    qs = ''.join(f'''          <details class="faq-item">
            <summary>{esc(q)}</summary>
            <div class="faq-a"><p>{esc(a)}</p></div>
          </details>
''' for q, a in items)
    groups.append(f'''        <div class="faq-group reveal" id="{key}">
          <h2>{esc(title)}</h2>
{qs}        </div>
''')
data = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
    {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}}
    for _, _, items in FAQ for q, a in items]}

s = open(page).read()
s = re.sub(r'(<!-- faq:nav -->\n).*?(\s*<!-- /faq:nav -->)', lambda m: m.group(1) + nav + m.group(2), s, flags=re.S)
s = re.sub(r'(<!-- faq:groups -->\n).*?(\s*<!-- /faq:groups -->)', lambda m: m.group(1) + ''.join(groups).rstrip('\n') + m.group(2), s, flags=re.S)
s = re.sub(r'(<script type="application/ld\+json" id="faq-data">\n).*?(\n  </script>)', lambda m: m.group(1) + json.dumps(data, indent=2, ensure_ascii=False) + m.group(2), s, flags=re.S)
open(page, 'w').write(s)
print(f'faq.html: {sum(len(i) for _, _, i in FAQ)} questions in {len(FAQ)} groups')
