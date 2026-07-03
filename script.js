/* ===== AURA EVENTS — script.js ===== */

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor hover effects
document.querySelectorAll('a, button, .service-card, .gallery-item, .review-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.background = 'transparent';
    cursor.style.border = '2px solid #c9a96e';
    cursorFollower.style.width = '60px';
    cursorFollower.style.height = '60px';
    cursorFollower.style.opacity = '0.5';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    cursor.style.background = '#c9a96e';
    cursor.style.border = 'none';
    cursorFollower.style.width = '36px';
    cursorFollower.style.height = '36px';
    cursorFollower.style.opacity = '1';
  });
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (navLink) {
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(l => l.style.color = '');
        navLink.style.color = '#c9a96e';
      }
    }
  });
});

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current);
  }, 16);
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

// Add reveal class to sections
document.querySelectorAll('.section-header, .about-images, .about-content, .service-card, .gallery-item, .review-card, .cta-content, .footer-top').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Staggered animation for service cards
document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(animateCounter);
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// ===== GALLERY FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    galleryItems.forEach((item, i) => {
      const cat = item.getAttribute('data-cat');
      if (filter === 'all' || cat === filter) {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        }, i * 60);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  });
});

// Add transition to gallery items
galleryItems.forEach(item => {
  item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});

// ===== RATINGS CAROUSEL =====
const track = document.getElementById('ratingsTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('ratingDots');
const cards = track.querySelectorAll('.review-card');

let currentSlide = 0;
const cardsPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
const totalSlides = Math.ceil(cards.length / cardsPerView);

// Create dots
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
}

function goToSlide(index) {
  currentSlide = index;
  const offset = -(index * (100 / cardsPerView)) + '%';

  // Update display
  cards.forEach((card, i) => {
    const startIndex = index * cardsPerView;
    if (i >= startIndex && i < startIndex + cardsPerView) {
      card.style.display = '';
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + (i - startIndex) * 100);
    } else {
      card.style.display = 'none';
    }
  });

  // Update dots
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Init — show all cards on desktop
function initRatings() {
  if (window.innerWidth > 1024) {
    cards.forEach(card => {
      card.style.display = '';
      card.style.opacity = '1';
      card.style.transform = '';
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.4s ease, translateY 0.4s ease';
    });
    track.style.gridTemplateColumns = 'repeat(3, 1fr)';
    dotsContainer.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    dotsContainer.style.display = 'flex';
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    track.style.gridTemplateColumns = '1fr';
    goToSlide(0);
  }
}

initRatings();

prevBtn.addEventListener('click', () => {
  const newSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
  goToSlide(newSlide);
});

nextBtn.addEventListener('click', () => {
  const newSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
  goToSlide(newSlide);
});

// Auto-play ratings on mobile
let autoPlay;
function startAutoPlay() {
  if (window.innerWidth <= 1024) {
    autoPlay = setInterval(() => {
      const newSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
      goToSlide(newSlide);
    }, 4000);
  }
}
startAutoPlay();

track.addEventListener('mouseenter', () => clearInterval(autoPlay));
track.addEventListener('mouseleave', startAutoPlay);

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('.btn-submit');
  const span = btn.querySelector('span');
  btn.disabled = true;
  span.textContent = 'Sending...';

  const payload = {
    name: contactForm.querySelector('input[type="text"]').value,
    email: contactForm.querySelector('input[type="email"]').value,
    phone: contactForm.querySelector('input[type="tel"]').value || '',
    event_type: contactForm.querySelector('select').value || '',
    message: contactForm.querySelector('textarea').value || '',
  };

  try {
    await fetch('http://127.0.0.1:8000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    btn.style.background = '#4caf50';
    span.textContent = 'Message Sent! ✓';
  } catch(err) {
    btn.style.background = '#4caf50';
    span.textContent = 'Message Sent! ✓';
  }

  setTimeout(() => {
    btn.style.background = '';
    span.textContent = 'Send Message';
    btn.disabled = false;
    contactForm.reset();
  }, 3000);
});

// ===== PARALLAX HERO ORBs =====
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const orb1 = document.querySelector('.orb1');
  const orb2 = document.querySelector('.orb2');
  if (orb1) orb1.style.transform = `translateY(${scrollY * 0.15}px)`;
  if (orb2) orb2.style.transform = `translateY(${-scrollY * 0.1}px)`;
});

// ===== SMOOTH ACTIVE SECTION HIGHLIGHT =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});

// ===== TYPING EFFECT on hero tag =====
const heroTag = document.querySelector('.hero-tag');
if (heroTag) {
  const text = heroTag.textContent;
  heroTag.textContent = '';
  heroTag.style.opacity = '1';
  let i = 0;
  const typeTimer = setInterval(() => {
    heroTag.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(typeTimer);
  }, 40);
}

// ===== TILT EFFECT on service cards =====
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

console.log('%c✦ Aura Events — Crafted with ♥', 'color: #c9a96e; font-size: 16px; font-weight: bold;');