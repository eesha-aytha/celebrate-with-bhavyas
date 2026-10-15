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
