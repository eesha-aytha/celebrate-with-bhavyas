// Header background on scroll
const header = document.querySelector('.site-header');
const isSubpage = document.body.classList.contains('subpage');
const onScroll = () => header.classList.toggle('scrolled', isSubpage || window.scrollY > 40);
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
// Sections taller than that space, or marked data-scroll-top, start just under the header instead.
const scrollToSection = (target, behavior = 'smooth') => {
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
  const y = height < space - 24 && !target.hasAttribute('data-scroll-top')
    ? top - headerH - (space - height) / 2
    : top - headerH - 24;
  window.scrollTo({ top: Math.max(0, y), behavior });
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
// Arriving from another page with a #section link (e.g. "Watch our highlight videos"):
// once the page has loaded, line it up the same way
window.addEventListener('load', () => {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) scrollToSection(target, 'instant');
});

// Highlight the menu link for the section in the middle of the screen. It is
// recalculated on every scroll, so fast scrolling can never leave one stuck;
// sections without a menu link (hero, banner, contact) clear the highlight, and
// data-nav lets a section light up another section's link (What We Celebrate -> Services).
// Each link's section: its #hash, or data-section for links that open another page
// (Gallery opens the full gallery page but still lights up over the home page preview)
const navLinks = [...document.querySelectorAll('.nav-links a:not(.btn)')].filter(a => a.getAttribute('href').startsWith('#') || a.dataset.section);
const sectionOf = a => a.dataset.section ? '#' + a.dataset.section : a.getAttribute('href');
const sections = [...document.querySelectorAll('main > section')];
const updateActiveLink = () => {
  const middle = window.innerHeight / 2;
  const current = sections.find(s => {
    const r = s.getBoundingClientRect();
    return r.top <= middle && r.bottom > middle;
  });
  const hash = current ? (current.dataset.nav ? '#' + current.dataset.nav : current.id ? '#' + current.id : null) : null;
  navLinks.forEach(a => a.classList.toggle('active', sectionOf(a) === hash));
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
// Stagger items that sit side by side (cards, steps, reviews, photos) so they fade in one after another
document.querySelectorAll('.service-grid, .steps, .review-grid, .gallery-grid, .founders, .contact-cards').forEach(group =>
  [...group.querySelectorAll(':scope > .reveal, :scope > li > .reveal, :scope > *')].filter(el => el.classList.contains('reveal'))
    .forEach((el, i) => el.style.setProperty('--d', `${Math.min(i % 4, 3) * 0.12}s`))
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Quote form: checks every required field, then sends the request to our own email
// function (netlify/functions/quote.mjs), which emails it to the business inbox and
// sends the customer a thank-you, both from hi@bhavyasevents.com. Until the site is on
// Netlify with email set up, requests go through FormSubmit (formsubmit.co) instead;
// its first request triggers a one-time activation email to CONTACT_EMAIL.
const CONTACT_EMAIL = 'hi@bhavyasevents.com';
const QUOTE_ENDPOINT = '/api/quote';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const postJson = (url, body) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify(body)
});
// Our function's answer, or null when it isn't available here (not deployed or not set up yet)
const sendViaFunction = async payload => {
  try {
    const res = await postJson(QUOTE_ENDPOINT, payload);
    if ([404, 405, 501, 503].includes(res.status)) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    if (err instanceof TypeError) return null;                  // network error: try FormSubmit
    throw err;
  }
};
const form = document.getElementById('contact-form');
if (form) {
const DATE_MSGS = { valueMissing: 'Please choose your event date.', rangeUnderflow: 'Please choose a date from today onward.', rangeOverflow: 'Please choose a date within the next 3 years.' };
const MESSAGES = {
  name: { valueMissing: 'Please enter your full name.', tooShort: 'Please enter at least 2 characters.', customError: 'Please enter your full name.' },
  email: { valueMissing: 'Please enter your email address.', typeMismatch: 'Please enter a valid email address, like name@example.com.', patternMismatch: 'Please enter a valid email address, like name@example.com.' },
  phone: { valueMissing: 'Please enter your mobile number.', patternMismatch: 'Please enter a valid 10-digit US phone number, like (248) 555-0123.' },
  date: DATE_MSGS,
  date_confirm: { ...DATE_MSGS, valueMissing: 'Please confirm your event date.', customError: "The two dates don't match. Please check them." },
  budget: { valueMissing: 'Please choose a budget range.' },
  destination: { valueMissing: 'Please tell us where, or the places you are considering.' },
  heard: { valueMissing: 'Please let us know how you heard about us.' },
  extra: { ...DATE_MSGS, valueMissing: 'Please choose a date, or remove this day.' }
};

// Event dates: today through 3 years from now
const isoDate = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const today = new Date();
const MIN_DATE = isoDate(today);
const MAX_DATE = isoDate(new Date(today.getFullYear() + 3, today.getMonth(), today.getDate()));
[form.date, form.date_confirm].forEach(f => { f.min = MIN_DATE; f.max = MAX_DATE; });

// Live character counter for the optional message
const message = form.message;
const counter = form.querySelector('.char-count');
message.addEventListener('input', () => { counter.textContent = `${message.value.length} / ${message.maxLength}`; });

const errorFor = el => (el.closest('label') || el.closest('.chip-group')).querySelector('.field-error');
const checkField = field => {
  const key = field.dataset.msg || field.name;
  if (field.name === 'name') field.setCustomValidity(field.value && !field.value.trim() ? 'blank' : '');
  if (field.name === 'date_confirm') field.setCustomValidity(field.value && form.date.value && field.value !== form.date.value ? 'mismatch' : '');
  let text = '';
  if (!field.validity.valid) {
    const reasons = MESSAGES[key] || {};
    const reason = Object.keys(reasons).find(k => field.validity[k]);
    text = reason ? reasons[reason] : 'Please check this field.';
  }
  errorFor(field).textContent = text;
  field.classList.toggle('invalid', !!text);
  field.setAttribute('aria-invalid', text ? 'true' : 'false');
  return !text;
};

// "Services needed": at least one box must be ticked (skipped when it isn't shown)
const servicesGroup = form.querySelector('.chip-group');
const checkServices = () => {
  const ok = servicesGroup.hidden || !!form.querySelector('input[name="services"]:checked');
  errorFor(servicesGroup).textContent = ok ? '' : 'Please choose at least one service.';
  servicesGroup.classList.toggle('invalid', !ok);
  return ok;
};

let triedSubmit = false;

// "What are you looking for?": every choice asks for a budget; decor only skips the services
// list, planning only hides the decor services and both shows every service
const lookingGroup = form.querySelector('input[name="looking_for"]').closest('.choice-group');
const budgetField = form.querySelector('.budget-field');
const decorChips = [...servicesGroup.querySelectorAll('[data-decor]')];
const lookingFor = () => (form.querySelector('input[name="looking_for"]:checked') || {}).value || '';
const checkLooking = () => {
  const ok = !!lookingFor();
  lookingGroup.querySelector('.field-error').textContent = ok ? '' : 'Please choose decor, event planning or both.';
  lookingGroup.classList.toggle('invalid', !ok);
  return ok;
};
const updateLooking = () => {
  const choice = lookingFor();
  const decorOnly = choice === 'Decor only';
  const planningOnly = choice === 'Event planning only';
  servicesGroup.hidden = !choice || decorOnly;
  if (decorOnly) servicesGroup.querySelectorAll('input:checked').forEach(box => { box.checked = false; });
  decorChips.forEach(chip => {
    chip.classList.toggle('is-off', planningOnly);
    if (planningOnly) chip.querySelector('input').checked = false;
  });
  const askBudget = !!choice;
  budgetField.hidden = !askBudget;
  form.budget.disabled = !askBudget;
  if (!askBudget) { errorFor(form.budget).textContent = ''; form.budget.classList.remove('invalid'); }
  if (triedSubmit) { checkLooking(); checkServices(); }
};
form.querySelectorAll('input[name="looking_for"]').forEach(radio => radio.addEventListener('change', updateLooking));

// "Where is your event?": a destination event asks where (required)
const locationGroup = form.querySelector('.location-group');
const destinationField = form.querySelector('.destination-field');
const locationType = () => (form.querySelector('input[name="location_type"]:checked') || {}).value || '';
const checkLocation = () => {
  const ok = !!locationType();
  locationGroup.querySelector('.field-error').textContent = ok ? '' : 'Please choose local or destination.';
  locationGroup.classList.toggle('invalid', !ok);
  return ok;
};
const updateLocation = () => {
  const isDestination = locationType() === 'Destination';
  destinationField.hidden = !isDestination;
  form.destination.disabled = !isDestination;
  if (!isDestination) { errorFor(form.destination).textContent = ''; form.destination.classList.remove('invalid'); }
  if (triedSubmit) checkLocation();
};
form.querySelectorAll('input[name="location_type"]').forEach(radio => radio.addEventListener('change', updateLocation));
// Arriving from the Destinations page (quote.html?destination) picks Destination for them
if (new URLSearchParams(location.search).has('destination')) {
  form.querySelector('input[name="location_type"][value="Destination"]').checked = true;
  updateLocation();
}

const watch = field => {
  field.addEventListener('blur', () => { if (field.value || triedSubmit) checkField(field); });
  field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
    if (triedSubmit || field.classList.contains('invalid')) checkField(field);
    if (field.name === 'date' && form.date_confirm.value) checkField(form.date_confirm);
  });
};
form.querySelectorAll('[required]').forEach(watch);
form.querySelectorAll('input[name="services"]').forEach(box => box.addEventListener('change', () => { if (triedSubmit) checkServices(); }));

// "Add another day": each extra day has a label (optional) and a date
const daysList = form.querySelector('.extra-days-list');
const addDayBtn = form.querySelector('.add-day');
const MAX_EXTRA_DAYS = 6;
addDayBtn.addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'extra-day';
  row.innerHTML = `
    <label><span class="label-text">Which event?</span><input type="text" name="extra_label" maxlength="40" placeholder="e.g. Sangeet"></label>
    <label><span class="label-text">Date <span class="req" aria-hidden="true">*</span></span><input type="date" name="extra_date" data-msg="extra" required min="${MIN_DATE}" max="${MAX_DATE}"><span class="field-error" aria-live="polite"></span></label>
    <button type="button" class="remove-day" aria-label="Remove this day">&times;</button>`;
  daysList.appendChild(row);
  watch(row.querySelector('[required]'));
  row.querySelector('.remove-day').addEventListener('click', () => { row.remove(); addDayBtn.hidden = daysList.children.length >= MAX_EXTRA_DAYS; });
  addDayBtn.hidden = daysList.children.length >= MAX_EXTRA_DAYS;
  row.querySelector('input').focus();
});

const submitBtn = form.querySelector('button[type="submit"]');
form.addEventListener('submit', async e => {
  e.preventDefault();
  triedSubmit = true;
  const fields = [...form.querySelectorAll('[required]')].filter(field => !field.disabled);
  const results = fields.map(checkField);                      // check every field so all problems show at once
  const locationOk = checkLocation();
  const lookingOk = checkLooking();
  const servicesOk = checkServices();
  const note = form.querySelector('.form-note');
  const bad = fields.filter((field, i) => !results[i]);
  if (!locationOk) bad.push(form.querySelector('input[name="location_type"]'));
  if (!lookingOk) bad.push(form.querySelector('input[name="looking_for"]'));
  if (!servicesOk) bad.push(form.querySelector('input[name="services"]'));
  const firstBad = bad.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))[0];
  if (firstBad) {
    note.textContent = 'Please fill in the highlighted fields.';
    note.className = 'form-note error';
    firstBad.focus();
    return;
  }
  if (form.querySelector('[name="_honey"]').value) return;      // hidden field only bots fill in

  const d = new FormData(form);
  const extraDays = [...daysList.querySelectorAll('.extra-day')].map(row => {
    const label = row.querySelector('[name="extra_label"]').value.trim();
    return `${label || 'Additional day'}: ${row.querySelector('[name="extra_date"]').value}`;
  });
  // Field names become the row labels in the email, in this order
  const payload = {
    'Name': d.get('name').trim(),
    'Email': d.get('email'),
    'Mobile': d.get('phone'),
    'Event date': d.get('date'),
    'More days': extraDays.join(' · ') || '(none)',
    'Location': d.get('location_type') === 'Destination' ? `Destination: ${d.get('destination').trim()}` : d.get('location_type'),
    'Venue': d.get('venue').trim() || '(not given)',
    'Venue address': d.get('venue_address').trim() || '(not given)',
    'Looking for': d.get('looking_for'),
    'Services needed': d.get('looking_for') === 'Decor only' ? '(decor only)' : d.getAll('services').join(', '),
    'Budget': d.get('budget'),
    'Heard about us from': d.get('heard'),
    'Vision': d.get('message').trim() || '(none)',
    _subject: `New quote request (${d.get('looking_for')}${d.get('location_type') === 'Destination' ? ', destination' : ''}): event on ${d.get('date')}`,
    _replyto: d.get('email'),
    _template: 'table',
    _captcha: 'false'
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  note.className = 'form-note';
  note.textContent = '';
  try {
    if (!(await sendViaFunction(payload))) {
      const res = await postJson(FORM_ENDPOINT, payload);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || `HTTP ${res.status}`);
    }
    form.reset();
    daysList.innerHTML = '';
    addDayBtn.hidden = false;
    counter.textContent = `0 / ${message.maxLength}`;
    triedSubmit = false;
    updateLooking();
    updateLocation();
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    note.className = 'form-note success';
    note.textContent = "Thank you! Your request has been sent. We'll be in touch shortly.";
  } catch (err) {
    note.className = 'form-note error';
    note.innerHTML = 'Sorry, something went wrong sending your request. Please try again, or call <a href="tel:+12487164603">(248) 716-4603</a>.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send My Request';
  }
});
} // end quote form

// Gallery page: category filters and live count (the home page shows a fixed preview)
const galleryItems = [...document.querySelectorAll('.g-item')];
const filterBtns = [...document.querySelectorAll('.g-filter')];
const countEl = document.querySelector('.g-count');
const visibleItems = () => galleryItems.filter(item => !item.classList.contains('g-hidden'));
const filterGallery = filter => {
  const matches = galleryItems.filter(item => filter === 'all' || item.dataset.cat === filter);
  galleryItems.forEach(item => item.classList.toggle('g-hidden', !matches.includes(item)));
  matches.forEach(item => item.classList.add('visible'));
  if (countEl) countEl.textContent = `Showing ${matches.length} of ${galleryItems.length} photographs`;
};
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => { const on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
  filterGallery(btn.dataset.filter);
}));
if (filterBtns.length) filterGallery('all');

// Photo viewer: arrows, keyboard and swipe through the photos currently shown
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('p');
  const lbCount = lightbox.querySelector('.lightbox-count');
  let lbList = [];
  let lbIndex = 0;
  const showPhoto = i => {
    lbIndex = (i + lbList.length) % lbList.length;
    const item = lbList[lbIndex];
    const img = item.querySelector('img');
    lbImg.src = img.dataset.full || img.currentSrc || img.src;   // largest version for the full-screen viewer
    lbImg.alt = img.alt;
    lbCap.textContent = item.querySelector('.g-title').textContent;
    lbCount.textContent = `${lbIndex + 1} / ${lbList.length}`;
  };
  galleryItems.forEach(item =>
    item.addEventListener('click', () => {
      lbList = visibleItems();
      showPhoto(lbList.indexOf(item));
      lightbox.classList.add('open');
    })
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
}

// Highlight videos: tap a tile to watch it with sound in a pop-up player
const vModal = document.querySelector('.v-modal');
if (vModal) {
  const vPlayer = vModal.querySelector('video');
  let lastTile = null;
  const closeVideo = () => {
    vPlayer.pause();
    vPlayer.removeAttribute('src');
    vPlayer.load();
    vModal.hidden = true;
    document.body.style.overflow = '';
    if (lastTile) lastTile.focus();
  };
  document.querySelectorAll('.v-play').forEach(btn => btn.addEventListener('click', () => {
    lastTile = btn;
    vPlayer.poster = btn.dataset.poster;
    vPlayer.src = btn.dataset.video;
    vModal.querySelector('.v-modal-event').textContent = btn.querySelector('.v-event').textContent;
    vModal.querySelector('.v-modal-title').textContent = btn.querySelector('.v-title').textContent;
    vModal.querySelector('.v-modal-desc').textContent = btn.dataset.desc;
    vModal.hidden = false;
    document.body.style.overflow = 'hidden';
    vModal.querySelector('.v-modal-close').focus();
    vPlayer.play().catch(() => {});
  }));
  vModal.addEventListener('click', e => { if (e.target === vModal || e.target.classList.contains('v-modal-close')) closeVideo(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !vModal.hidden) closeVideo(); });
}

// Long video lists: show the first 8, with a button for the rest
const vGrid = document.querySelector('.v-grid');
const VIDEOS_SHOWN = 8;
if (vGrid && vGrid.children.length > VIDEOS_SHOWN) {
  [...vGrid.children].slice(VIDEOS_SHOWN).forEach(card => card.classList.add('is-extra'));
  const wrap = document.createElement('div');
  wrap.className = 'v-more';
  wrap.innerHTML = `<button type="button" class="btn btn-ghost">Show all ${vGrid.children.length} videos</button>`;
  wrap.querySelector('button').addEventListener('click', () => { vGrid.classList.add('show-all'); wrap.remove(); });
  vGrid.after(wrap);
}

// Banner video loop: load and play only when the banner is near the screen,
// pause when it scrolls away, and skip it for visitors who prefer less motion
const bannerVideo = document.querySelector('.banner-video');
if (bannerVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!bannerVideo.src) bannerVideo.src = window.innerWidth <= 860 && bannerVideo.dataset.srcSmall ? bannerVideo.dataset.srcSmall : bannerVideo.dataset.src;
      bannerVideo.play().catch(() => {});
    } else {
      bannerVideo.pause();
    }
  }, { rootMargin: '200px 0px' }).observe(bannerVideo);
}

// Phones: show the Call / Get a Quote bar after the first screen, and hide it
// while the quote form itself is on screen so it never covers the form
const mobileCta = document.querySelector('.mobile-cta');
if (mobileCta) {
  const quoteForm = document.getElementById('contact-form');
  const updateCta = () => {
    const r = quoteForm && quoteForm.getBoundingClientRect();
    const formOnScreen = r && r.top < window.innerHeight && r.bottom > 0;
    mobileCta.classList.toggle('show', window.scrollY > window.innerHeight * 0.6 && !formOnScreen);
  };
  window.addEventListener('scroll', updateCta, { passive: true });
  window.addEventListener('resize', updateCta);
  updateCta();
}

document.getElementById('year').textContent = new Date().getFullYear();
