# Celebrate with Bhavya's

Website for Celebrate with Bhavya's, a luxury event planning business. It's a plain HTML/CSS/JavaScript site with no build step: open `index.html` in a browser to view it.

## Files

- `index.html`: page content and sections
- `styles.css`: white, gold and light-blue theme
- `script.js`: menu, scroll animations, testimonial slider, contact form

## Filling in your details

Content (services, about, founders, contact details) and the photos in `images/` come from bhavyas.events and the @celebratewithbhavyas Instagram (files starting with `ig-`), and professional event photos by Miles To Go Photos (files starting with `ev-`, resized to 1600px). Highlight clips in `videos/` are 24-second cuts from the photographer's event films. Reviews come from the business's Google listing.

- **Photos:** add new photos to `images/`, then copy a `<figure class="g-item">` block in the Gallery section of `index.html`; set `data-cat` (stages, ceremonies, couples, celebrations or details), the `src`, `alt`, title and event. Add `g-tall` or `g-wide` to the class for a larger tile.
- **Reviews:** each review is a `<figure class="review">` in the Kind Words section; copy one to add another.
- **Form submissions:** the form currently opens the visitor's email app. To receive inquiries directly, sign up for a free form service such as Formspree and point the form at it.

## Publishing with GitHub Pages

In the GitHub repo: **Settings → Pages → Source: Deploy from a branch → `main` / root**. The site will be live at `https://<username>.github.io/<repo-name>/`.
