/* ─── NAV SCROLL ─────────────────────────────────────────── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ─── MOBILE HAMBURGER ───────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// close on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.section-title, .section-text, .stat, .event-card, .contact-form, .form-row, .form-group'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

/* ─── CONTACT FORM ───────────────────────────────────────── */
const form     = document.getElementById('contactForm');
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

// live validation
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => validate(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('invalid')) validate(field);
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;
  fields.forEach(f => { if (!validate(f)) valid = false; });

  if (!valid) {
    feedback.textContent = 'Por favor completa todos los campos requeridos.';
    feedback.className   = 'form-feedback error';
    return;
  }

  // Simulate async send
  const btn = form.querySelector('.btn');
  btn.textContent = 'Enviando...';
  btn.disabled    = true;

  setTimeout(() => {
    feedback.textContent = '¡Mensaje enviado! Nos pondremos en contacto pronto. 🎉';
    feedback.className   = 'form-feedback success';
    form.reset();
    btn.textContent = 'Enviar mensaje';
    btn.disabled    = false;

    // clear feedback after 5s
    setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 5000);
  }, 1200);
});
