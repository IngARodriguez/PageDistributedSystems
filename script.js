/* ─── NAV SCROLL ─────────────────────────────────────────── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ─── MOBILE HAMBURGER ───────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ─── SCROLL REVEAL ──────────────────────────────────────── */

// Map: CSS selector → animation direction for that group
const revealGroups = [
  { selector: '.section-title', dir: 'up' },
  { selector: '.section-text', dir: 'up' },
  { selector: '.event-card', dir: 'left' },
  { selector: '.gallery-item', dir: 'up' },
  { selector: '.gallery-cta', dir: 'up' },
  { selector: '.contact-form', dir: 'right' },
  { selector: '.contact-details', dir: 'left' },
  { selector: '.map-wrapper', dir: 'right' },
  { selector: '.stat', dir: 'scale' },
];

// Assign .reveal class + data-dir to each element
revealGroups.forEach(({ selector, dir }) => {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
    el.dataset.dir = dir;
  });
});

// Build a single flat list of all reveal elements in DOM order
const allRevealEls = Array.from(document.querySelectorAll('.reveal'));

// Observe each element; stagger delay based on sibling index within its parent
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Compute sibling index among .reveal elements in same parent for stagger
      const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
      const idx = siblings.indexOf(el);
      const delay = idx >= 0 ? idx * 80 : 0;   // 80 ms between siblings

      el.style.setProperty('--reveal-delay', `${delay}ms`);

      // Small rAF so the delay custom property is applied before visible class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('visible'));
      });

      revealObserver.unobserve(el);
    });
  },
  {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px',  // triggers 60 px before element bottom hits viewport
  }
);

allRevealEls.forEach(el => revealObserver.observe(el));



/* ─── CONTACT FORM ───────────────────────────────────────── */
const form = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');

function validate(field) {
  const val = field.value.trim();
  if (field.required && !val) {
    field.classList.add('invalid');
    return false;
  }
  if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    field.classList.add('invalid');
    return false;
  }
  field.classList.remove('invalid');
  return true;
}

// Live validation
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validate(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('invalid')) validate(field);
  });
});

// Encode form data as URL-encoded string (required by Netlify Forms)
function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  // Client-side validation
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;
  fields.forEach(f => { if (!validate(f)) valid = false; });

  if (!valid) {
    feedback.textContent = 'Por favor completa todos los campos requeridos.';
    feedback.className = 'form-feedback error';
    return;
  }

  const btn = form.querySelector('.btn');
  btn.innerHTML = '<i data-lucide="loader-2"></i> Enviando...';
  btn.disabled = true;
  if (window.lucide) lucide.createIcons();

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': 'contact',
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        subject: form.subject.value,
        message: form.message.value,
      }),
    });

    if (response.ok) {
      feedback.textContent = '¡Mensaje enviado! Nos pondremos en contacto pronto. 🎉';
      feedback.className = 'form-feedback success';
      form.reset();
    } else {
      throw new Error(`Status ${response.status}`);
    }
  } catch (err) {
    console.error('Netlify form error:', err);
    feedback.textContent = 'Ocurrió un error al enviar. Intenta de nuevo o contáctanos por WhatsApp.';
    feedback.className = 'form-feedback error';
  } finally {
    btn.innerHTML = '<i data-lucide="send"></i> Enviar mensaje';
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
    setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 6000);
  }
});
