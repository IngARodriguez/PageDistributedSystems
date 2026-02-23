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
const revealEls = document.querySelectorAll(
  '.section-title, .section-text, .stat, .event-card, .contact-form, .form-row, .form-group, .gallery-item, .gallery-cta'
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
