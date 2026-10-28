"""Tag styles.css and script.js links with a short fingerprint of their contents
(styles.css?v=ab12cd34), so browsers load the new files as soon as they change.
Runs automatically before each commit (tools/pre-commit)."""
import glob, hashlib, os, re
root = os.path.join(os.path.dirname(__file__), '..')
for name in ('styles.css', 'script.js'):
    tag = hashlib.md5(open(os.path.join(root, name), 'rb').read()).hexdigest()[:8]
    pattern = re.compile(r'((?:href|src)="' + re.escape(name) + r')(\?v=[\w]+)?"')
    for page in glob.glob(os.path.join(root, '*.html')):
        text = open(page).read()
        new = pattern.sub(rf'\1?v={tag}"', text)
        if new != text:
            open(page, 'w').write(new)
