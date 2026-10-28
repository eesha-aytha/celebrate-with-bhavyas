# Celebrate with Bhavya's

Website for Celebrate with Bhavya's, a luxury event planning business. It's a plain HTML/CSS/JavaScript site with no build step: open `index.html` in a browser to view it.

## Files

- `index.html`: home page (planning + decor offer, event types and services, destination weddings band, process, gallery preview, reviews, about, closing call to action)
- `quote.html`: Get a Quote page with the request form and contact details
- `destination-weddings.html`: destination wedding planning and decor (Michigan, US and abroad), with its own FAQ and structured data
- `faq.html`: frequently asked questions, written for search engines too (Google can show them in results)
- `netlify/functions/quote.mjs`: sends the quote emails (the only code that runs on a server)
- `privacy.html`: privacy policy (update it if you add analytics, ads or another form service)
- `gallery.html`: full gallery page with category filters, photo viewer and highlight videos
- `styles.css`: gold and light-blue theme on white, soft blue and champagne sections, with dark accent bands
- `script.js`: menu, scroll animations, testimonial slider, contact form

## Filling in your details

Content (services, about, founders, contact details) and the photos in `images/` come from bhavyas.events and the @celebratewithbhavyas Instagram (files starting with `ig-`), and professional event photos by Miles To Go Photos (files starting with `ev-`, resized to 1600px). Highlight clips in `videos/` are 24-second cuts from the photographer's event films. Reviews come from the business's Google listing.

- **Photos:** add new photos to `images/`, then copy a `<figure class="g-item">` block in `gallery.html` (and in the home page preview in `index.html` if it should be featured there); set `data-cat` (stages, entrances, tables, details, ceremonies, couples or celebrations) and update the count on that tab's button, the `src`, `alt`, title and event. Add `g-tall` or `g-wide` to the class for a larger tile.
- **FAQ:** edit the questions and answers in `tools/faq_content.py`, then run `python3 tools/build_faq.py`. It updates the page and the matching Google FAQ data together so they never drift apart.
- **Reviews:** each review is a `<figure class="review">` in the Kind Words section; copy one to add another.
- **Form submissions:** the Get a Quote form sends each request to `netlify/functions/quote.mjs`, which emails it to hi@bhavyasevents.com and sends the customer a branded thank-you, both **from hi@bhavyasevents.com**. Until that is set up on Netlify (below), requests go through [FormSubmit](https://formsubmit.co) instead: its very first request sends a one-time activation email to hi@bhavyasevents.com; click the link in it. The address is set in `CONTACT_EMAIL` in `script.js`.
- **Email wording and design:** edit `thankYouHtml` / `thankYouText` (customer) and `requestHtml` (business inbox) in `netlify/functions/quote.mjs`. The logo in the emails is `images/email-logo.png`; after changing it, run `python3 tools/build_email_logo.py`.

## Fast photos (WebP)

Every photo is served as WebP in three sizes (480, 960 and 1600px wide) from `images/webp/` and `videos/webp/`; phones download the small ones and the photo viewer uses the large one. The original JPG/PNG files stay in `images/` as the master copies and fallback.

After adding or replacing photos, run:

```bash
python3 tools/optimize-images.py
```

It only converts new or changed photos and updates the pages automatically (needs `brew install webp`). To have it run by itself before every commit, install the hook once with `sh tools/install-hooks.sh`.

## Publishing with GitHub Pages

In the GitHub repo: **Settings → Pages → Source: Deploy from a branch → `main` / root**. The site will be live at `https://<username>.github.io/<repo-name>/`.

## Sending quote emails from hi@bhavyasevents.com (Netlify)

Do this once the site is on Netlify. Nothing secret goes in the code; the mailbox password lives only in Netlify.

1. In Zoho Mail (signed in as hi@bhavyasevents.com): **My Account → Security → App Passwords**, create one named "Website".
2. In Netlify: **Site configuration → Environment variables → Add a variable**, and add each line from `.env.example`, putting the app password in `SMTP_PASSWORD`. If the mailbox isn't on Zoho, use that provider's SMTP host and port instead.
3. **Deploys → Trigger deploy**. Send yourself a test request from the Get a Quote page: you should get the request email, and the address you entered gets the thank-you.

If those settings are missing, the form automatically falls back to FormSubmit, so requests are never lost.

## Photo credits

- `images/beach-mandap-destination.jpg` (Destinations page): free stock photo from Unsplash, [unsplash.com/photos/_D1rKHYi9lc](https://unsplash.com/photos/_D1rKHYi9lc), used under the Unsplash License (no credit required). Replace it with a photo from one of our own destination weddings when we have one. 
- `images/cliffside-floral-arch.jpg` (Destinations page top photo): free stock photo from Unsplash, [unsplash.com/photos/vJQEtOj46eA](https://unsplash.com/photos/vJQEtOj46eA), Unsplash License.

- `images/corporate-gala-dinner.jpg` (home page Corporate & Social card): free stock photo from Unsplash, [unsplash.com/photos/EJQnHC6GEe8](https://unsplash.com/photos/EJQnHC6GEe8), Unsplash License.

Every other photo is from our own events.
