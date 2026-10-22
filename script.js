// Header background on scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
  })
);

// In-page links: center the section's content in the space below the header.
// Sections taller than that space start just under the header instead.
const scrollToSection = target => {
  // Center on the section's main block (e.g. About's story, not the mission below it)
  const first = target.firstElementChild || target;
  const last = first;
  // offsetTop ignores the reveal animation's temporary shift
  const pageTop = el => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop; return y; };
  const top = pageTop(first);
  const bottom = pageTop(last) + last.offsetHeight;
  const headerH = header.offsetHeight;
  const space = window.innerHeight - headerH;
  const height = bottom - top;
  const y = height < space - 24
    ? top - headerH - (space - height) / 2
    : top - headerH - 24;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
};
document.querySelectorAll('a[href^="#"]').forEach(link =>
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (id === 'top') {
      // Logo / company name: back to the top of the home page
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', location.pathname);
      return;
    }
    if (!target) return;
    e.preventDefault();
    scrollToSection(target);
    history.pushState(null, '', '#' + id);
  })
);

// Highlight the menu link for the section in the middle of the screen. It is
// recalculated on every scroll, so fast scrolling can never leave one stuck;
// sections without a menu link (hero, banner, contact) clear the highlight.
const navLinks = [...document.querySelectorAll('.nav-links a:not(.btn)')];
const sections = [...document.querySelectorAll('main > section')];
const updateActiveLink = () => {
  const middle = window.innerHeight / 2;
  const current = sections.find(s => {
    const r = s.getBoundingClientRect();
    return r.top <= middle && r.bottom > middle;
  });
  const hash = current && current.id ? '#' + current.id : null;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
};
window.addEventListener('scroll', updateActiveLink, { passive: true });
window.addEventListener('resize', updateActiveLink);
updateActiveLink();

// Reveal sections as they scroll into view
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form: opens the visitor's email app with the details filled in.
// To receive submissions directly, connect a form service (see README).
const CONTACT_EMAIL = 'hi@bhavyasevents.com';
const form = document.getElementById('contact-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form);
  const body = [
    `Name: ${d.get('name')}`,
    `Email: ${d.get('email')}`,
    `Phone: ${d.get('phone') || 'N/A'}`,
    `Event type: ${d.get('event')}`,
    `Event date: ${d.get('date') || 'TBD'}`,
    `Estimated guests: ${d.get('guests') || 'TBD'}`,
    '',
    d.get('message') || ''
  ].join('\n');
  const subject = `Event inquiry: ${d.get('event')}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.querySelector('.form-note').textContent = 'Thank you! Your email app should open so you can send your inquiry.';
});

// Gallery: show the first 12 photos, with a button for the rest
const GALLERY_START = 12;
const galleryItems = [...document.querySelectorAll('.g-item')];
const moreBtn = document.querySelector('.gallery-more button');
if (galleryItems.length > GALLERY_START) {
  galleryItems.slice(GALLERY_START).forEach(item => item.classList.add('g-hidden'));
  moreBtn.hidden = false;
  let expanded = false;
  moreBtn.addEventListener('click', () => {
    expanded = !expanded;
    galleryItems.slice(GALLERY_START).forEach(item => item.classList.toggle('g-hidden', !expanded));
    moreBtn.textContent = expanded ? 'Show less' : 'Show more photos';
    // After collapsing, bring the gallery back into view so the page doesn't jump past it
    if (!expanded) scrollToSection(document.getElementById('gallery'));
  });
}

// Gallery photo viewer: arrows, keyboard and swipe to flip through every photo
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
const lbCap = lightbox.querySelector('p');
const lbCount = lightbox.querySelector('.lightbox-count');
let lbIndex = 0;
const showPhoto = i => {
  lbIndex = (i + galleryItems.length) % galleryItems.length;
  const item = galleryItems[lbIndex];
  const img = item.querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = item.querySelector('figcaption').textContent;
  lbCount.textContent = `${lbIndex + 1} / ${galleryItems.length}`;
};
galleryItems.forEach((item, i) =>
  item.addEventListener('click', () => { showPhoto(i); lightbox.classList.add('open'); })
);
const closeLightbox = () => lightbox.classList.remove('open');
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(lbIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
});
let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

document.getElementById('year').textContent = new Date().getFullYear();
