"""Rebuilds netlify/functions/lib/email-logo.mjs from images/email-logo.png."""
import base64, os
root = os.path.join(os.path.dirname(__file__), '..')
data = base64.b64encode(open(os.path.join(root, 'images/email-logo.png'), 'rb').read()).decode()
open(os.path.join(root, 'netlify/functions/lib/email-logo.mjs'), 'w').write(
    "// The logo shown at the top of every email, built into the code so it works before the domain is live.\n"
    "// Regenerate from images/email-logo.png if the logo changes: python3 tools/build_email_logo.py\n"
    f"export const EMAIL_LOGO_PNG = '{data}';\n")
print('email-logo.mjs updated')
