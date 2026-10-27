# Celebrate with Bhavya's

Website for Celebrate with Bhavya's, a luxury event planning business. It's a plain HTML/CSS/JavaScript site with no build step: open `index.html` in a browser to view it.

## Files

- `index.html`: home page (planning + decor offer, event types and services, process, gallery preview, reviews, about, closing call to action)
- `quote.html`: Get a Quote page with the request form and contact details
- `privacy.html`: privacy policy (update it if you add analytics, ads or another form service)
- `gallery.html`: full gallery page with category filters, photo viewer and highlight videos
- `styles.css`: gold and light-blue theme on white, soft blue and champagne sections, with dark accent bands
- `script.js`: menu, scroll animations, testimonial slider, contact form

## Filling in your details

Content (services, about, founders, contact details) and the photos in `images/` come from bhavyas.events and the @celebratewithbhavyas Instagram (files starting with `ig-`), and professional event photos by Miles To Go Photos (files starting with `ev-`, resized to 1600px). Highlight clips in `videos/` are 24-second cuts from the photographer's event films. Reviews come from the business's Google listing.

- **Photos:** add new photos to `images/`, then copy a `<figure class="g-item">` block in `gallery.html` (and in the home page preview in `index.html` if it should be featured there); set `data-cat` (stages, ceremonies, couples, celebrations or details), the `src`, `alt`, title and event. Add `g-tall` or `g-wide` to the class for a larger tile.
- **Reviews:** each review is a `<figure class="review">` in the Kind Words section; copy one to add another.
- **Form submissions:** the Get a Quote form sends each request straight to hi@bhavyasevents.com through [FormSubmit](https://formsubmit.co) (free, no account). The very first submission sends a one-time **activation email** to that address; click the link in it, and every request after that is delivered. The address is set in `CONTACT_EMAIL` in `script.js`.

## Fast photos (WebP)

Every photo is served as WebP in three sizes (480, 960 and 1600px wide) from `images/webp/` and `videos/webp/`; phones download the small ones and the photo viewer uses the large one. The original JPG/PNG files stay in `images/` as the master copies and fallback.

After adding or replacing photos, run:

```bash
python3 tools/optimize-images.py
```

It only converts new or changed photos and updates the pages automatically (needs `brew install webp`). To have it run by itself before every commit, install the hook once with `sh tools/install-hooks.sh`.

## Publishing with GitHub Pages

In the GitHub repo: **Settings → Pages → Source: Deploy from a branch → `main` / root**. The site will be live at `https://<username>.github.io/<repo-name>/`.
