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

// Testimonial slider
const slides = document.querySelectorAll('.testimonial');
const dots = document.querySelectorAll('.dot');
let current = 0;
const show = i => {
  slides[current].classList.remove('active');
  dots[current]?.classList.remove('active');
  current = i;
  slides[current].classList.add('active');
  dots[current]?.classList.add('active');
};
dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restart(); }));
let timer;
const restart = () => {
  clearInterval(timer);
  if (slides.length > 1) timer = setInterval(() => show((current + 1) % slides.length), 6000);
};
restart();

// Contact form: opens the visitor's email app with the details filled in.
// To receive submissions directly, connect a form service (see README).
const CONTACT_EMAIL = 'celebratewithbhavyas@gmail.com';
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

document.getElementById('year').textContent = new Date().getFullYear();
