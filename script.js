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
    if (!target || id === 'top') return;
    e.preventDefault();
    scrollToSection(target);
    history.pushState(null, '', '#' + id);
  })
);

// Highlight the menu link for the section currently on screen. Every section is
// watched, so ones without a menu link (hero, banner, contact) clear the highlight.
const navLinks = [...document.querySelectorAll('.nav-links a:not(.btn)')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const hash = '#' + entry.target.id;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main > section').forEach(section => spy.observe(section));

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

// Gallery lightbox
const lightbox = document.querySelector('.lightbox');
const lbImg = lightbox.querySelector('img');
const lbCap = lightbox.querySelector('p');
document.querySelectorAll('.g-item').forEach(item =>
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = item.querySelector('figcaption').textContent;
    lightbox.classList.add('open');
  })
);
const closeLightbox = () => lightbox.classList.remove('open');
lightbox.addEventListener('click', e => { if (e.target !== lbImg) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

document.getElementById('year').textContent = new Date().getFullYear();
