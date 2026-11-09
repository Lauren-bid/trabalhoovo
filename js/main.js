/* ═══════════════════════════════════════════════════════════════
   ZYVORA® – Precision In Ovo Biotechnology  |  Main JS
   Engineering the Future of Life · 2026
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. HELPERS ───────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = fn => requestAnimationFrame(fn);

// State tracking for global page visibility
let isPageVisible = !document.hidden;

/* ── 2. SCROLL HANDLER ─────────────────────────────────────────── */
let scrollTicking = false;
let lastScrollY = 0;

function onScroll() {
  lastScrollY = window.scrollY;
  if (!scrollTicking) {
    raf(() => {
      handleScroll(lastScrollY);
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

function updateActiveNavLink(scrollY) {
  const navLinks = $$('.nav__links .nav__link');
  const sections = [
    $('#tecnologia'),
    $('#ciencia'),
    $('#beneficios'),
    $('#contato')
  ].filter(Boolean);

  const scrollPos = scrollY + 180;
  let currentId = '';

  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = sections[i];
    const top = sec.offsetTop;
    if (scrollPos >= top) {
      currentId = sec.getAttribute('id');
      break;
    }
  }

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${currentId}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function handleScroll(scrollY) {
  // Nav scrolled state
  const nav = $('#nav');
  if (nav) {
    nav.classList.toggle('scrolled', scrollY > 40);
  }

  // Parallax hero orbs
  const orbs = $$('.hero__orb');
  orbs.forEach((orb, i) => {
    const speed = [0.08, 0.05, 0.04][i] || 0.04;
    orb.style.transform = `translateY(${scrollY * speed}px)`;
  });

  // Scroll indicator fade
  const scrollInd = $('.hero__scroll');
  if (scrollInd) {
    scrollInd.style.opacity = Math.max(0, 1 - scrollY / 200);
  }

  // Active nav link highlighting
  updateActiveNavLink(scrollY);
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ── 3. INTERSECTION OBSERVER ANIMATIONS ───────────────────────── */
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.1
};

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('in-view'), delay);
      animObserver.unobserve(el);
    }
  });
}, observerOptions);

function initAnimations() {
  $$('[data-animate]').forEach(el => animObserver.observe(el));
}

/* ── 4. HERO CANVAS PARTICLE SYSTEM ───────────────────────────── */
function initCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let animId = null;
  const particles = [];

  const COUNT = window.innerWidth < 768 ? 100 : 250;
  const CURSOR_R = 160;   // Raio de orbita ao redor do cursor
  const FOLLOW_DIST = 250; // Distancia para comecar a seguir
  const EASE = 0.05;
  const AURA_R = 280;

  // Paleta biotecnologica: tons de azul, verde, ciano e roxo
  const PALETTE = [
    [14,  165, 233], // Blue #0ea5e9
    [16,  185, 129], // Green #10b981
    [6,   182, 212], // Cyan #06b6d4
    [56,  189, 248], // Sky #38bdf8
    [52,  211, 153], // Mint #34d399
    [99,  102, 241], // Indigo #6366f1
    [168, 85,  247], // Purple #a855f7
  ];

  const mouse = { x: -1, y: -1, active: false };
  const hero = canvas.closest('.hero') || canvas.parentElement;

  if (hero) {
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    hero.addEventListener('mouseleave', () => {
      mouse.active = false;
    });
  }

  class HeroParticle {
    constructor(i, total) {
      this.homeX = Math.random() * W;
      this.homeY = Math.random() * H;
      this.x = this.homeX;
      this.y = this.homeY;
      this.orbitAngle = (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 1.5;
      this.radiusOffset = (Math.random() - 0.5) * 100;
      this.orbitSpeed = (Math.random() * 0.01 + 0.003) * (Math.random() < 0.5 ? 1 : -1);
      this.baseLen = Math.random() * 2.5 + 1.2;
      this.len = this.baseLen;
      this.rgb = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.baseAlpha = Math.random() * 0.3 + 0.45;
      this.alpha = this.baseAlpha;
      this.rot = Math.random() * Math.PI * 2;
      // Pulso individual: fase e velocidade unicos por particula
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.04 + 0.02;
    }

    update() {
      let tx, ty, targetRot;

      if (mouse.active) {
        const dx = this.homeX - mouse.x;
        const dy = this.homeY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < FOLLOW_DIST) {
          // Proximo: orbita ao redor do cursor
          this.orbitAngle += this.orbitSpeed;
          const r = CURSOR_R + this.radiusOffset;
          tx = mouse.x + Math.cos(this.orbitAngle) * r;
          ty = mouse.y + Math.sin(this.orbitAngle) * r;
        } else {
          // Longe: fica no ponto de origem
          tx = this.homeX;
          ty = this.homeY;
        }
        targetRot = Math.atan2(mouse.y - this.y, mouse.x - this.x);
      } else {
        tx = this.homeX;
        ty = this.homeY;
        targetRot = this.rot + 0.005;
      }

      this.x += (tx - this.x) * EASE;
      this.y += (ty - this.y) * EASE;

      // Pulso individual
      this.pulsePhase += this.pulseSpeed;
      const pulse = Math.sin(this.pulsePhase);
      const pv = (pulse + 1) / 2;
      this.len = this.baseLen * (0.4 + 0.6 * pv);
      this.alpha = this.baseAlpha * (0.5 + 0.5 * pv);

      let da = targetRot - this.rot;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      this.rot += da * 0.08;
    }

    draw() {
      const [r, g, b] = this.rgb;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.len, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
      ctx.fill();
    }
  }

  function resize() {
    if (!canvas.parentElement) return;
    W = canvas.width = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) {
      particles.push(new HeroParticle(i, COUNT));
    }
  }

  function draw() {
    if (!isPageVisible) return;
    ctx.clearRect(0, 0, W, H);

    // Radial gradient aura ao redor do cursor
    if (mouse.active) {
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, AURA_R);
      grd.addColorStop(0,   'rgba(14,165,233,0.14)');
      grd.addColorStop(0.4, 'rgba(6,182,212,0.06)');
      grd.addColorStop(0.7, 'rgba(16,185,129,0.02)');
      grd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, AURA_R, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animId = raf(draw);
  }

  new ResizeObserver(() => resize()).observe(canvas.parentElement);
  resize();
  draw();

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animId) draw();
    } else {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  }, { threshold: 0 }).observe(canvas);
}

/* ── 5. EGG HERO IMAGE – INTERACTIVE PARALLAX & GLOW ───────────── */
function initEgg3D() {
  const container = $('#egg-3d-canvas-container');
  const img = $('#egg-hero-img');
  if (!container || !img) return;

  // Parallax tilt on mouse movement
  let rect = container.getBoundingClientRect();

  function updateRect() {
    rect = container.getBoundingClientRect();
  }

  container.addEventListener('mousemove', (e) => {
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = x * 12;  // max 6deg tilt
    const rotateX = -y * 8;  // max 4deg tilt
    const scale = 1.05;

    img.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;
  });

  container.addEventListener('mouseleave', () => {
    img.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
  });

  // Update rect on resize
  new ResizeObserver(updateRect).observe(container);
  window.addEventListener('scroll', updateRect, { passive: true });
}



/* ── 6. DNA HELIX CINEMATIC 3D MOTION & INTERACTION ──────────── */
function initDnaHelix() {
  const container = $('.science__visual');
  const img = $('.dna-helix-img');
  if (!container || !img) return;

  let mouseX = 0, mouseY = 0;
  let targetRotY = 0, targetRotX = 0;
  let currRotY = 0, currRotX = 0;
  let isHovered = false;
  let time = 0;
  let animId = null;
  let isDnaVisible = true;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX = x * 26; // até ~13 graus de inclinação interativa
    mouseY = -y * 16;
    isHovered = true;
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    mouseX = 0;
    mouseY = 0;
  });

  function updateDnaMotion() {
    if (!isDnaVisible || !isPageVisible) {
      animId = raf(updateDnaMotion);
      return;
    }

    time += 0.028;

    // Movimento senoidal orgânico contínuo (respiração / flutuação holográfica 3D)
    const naturalRotY = Math.sin(time * 0.9) * 11;
    const naturalRotX = Math.cos(time * 0.7) * 5.5;
    const naturalRotZ = Math.sin(time * 0.5) * 2;
    const naturalTranslateY = Math.sin(time * 1.3) * 12;
    const naturalScale = 1.02 + Math.sin(time * 0.6) * 0.02;

    if (isHovered) {
      targetRotY = naturalRotY * 0.25 + mouseX;
      targetRotX = naturalRotX * 0.25 + mouseY;
    } else {
      targetRotY = naturalRotY;
      targetRotX = naturalRotX;
    }

    // Interpolação suave e contínua com inércia
    currRotY += (targetRotY - currRotY) * 0.08;
    currRotX += (targetRotX - currRotX) * 0.08;

    img.style.transform = `perspective(1100px) translateY(${naturalTranslateY.toFixed(2)}px) rotateY(${currRotY.toFixed(2)}deg) rotateX(${currRotX.toFixed(2)}deg) rotateZ(${naturalRotZ.toFixed(2)}deg) scale(${naturalScale.toFixed(3)})`;

    animId = raf(updateDnaMotion);
  }

  // Observador de visibilidade para economia de GPU/CPU
  new IntersectionObserver(([entry]) => {
    isDnaVisible = entry.isIntersecting;
  }, { threshold: 0.05 }).observe(container);

  updateDnaMotion();
}

/* ── 7. CTA CANVAS PARTICLES ({ } FORMATION) ──────────────────── */
function initCtaCanvas() {
  const canvas = $('#cta-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let animId = null;
  const particles = [];
  const COUNT = 400;

  const EASE_HOME = 0.035;
  const EASE_TARGET = 0.07;

  let braceMode = false;
  let bracePts = [];

  function getCharPoints(char, cx, cy, size) {
    const oc = document.createElement('canvas');
    oc.width = size * 2;
    oc.height = size * 2;
    const ox = oc.getContext('2d');
    ox.fillStyle = '#fff';
    ox.font = `bold ${size}px serif`;
    ox.textAlign = 'center';
    ox.textBaseline = 'middle';
    ox.fillText(char, oc.width / 2, oc.height / 2);
    const data = ox.getImageData(0, 0, oc.width, oc.height).data;
    const pts = [];
    for (let py = 0; py < oc.height; py += 4) {
      for (let px = 0; px < oc.width; px += 4) {
        if (data[(py * oc.width + px) * 4 + 3] > 80) {
          pts.push({
            x: cx + px - oc.width / 2,
            y: cy + py - oc.height / 2,
          });
        }
      }
    }
    return pts;
  }

  function assignBraceTargets() {
    const content = $('.cta-final__content');
    if (!content) return;
    const cvRect = canvas.getBoundingClientRect();
    const cRect = content.getBoundingClientRect();

    const cy = cRect.top - cvRect.top + cRect.height / 2;
    const charH = cRect.height * 1.1;
    const lCx = cRect.left - cvRect.left - charH * 0.22;
    const rCx = cRect.right - cvRect.left + charH * 0.22;

    const lPts = getCharPoints('{', lCx, cy, charH);
    const rPts = getCharPoints('}', rCx, cy, charH);
    bracePts = [...lPts, ...rPts];

    if (bracePts.length === 0) return;

    particles.forEach((p, i) => {
      const pt = bracePts[Math.floor(i / COUNT * bracePts.length)];
      p.tx = pt ? pt.x : p.homeX;
      p.ty = pt ? pt.y : p.homeY;
      p.following = true;
    });
  }

  function clearBraceTargets() {
    particles.forEach(p => { p.following = false; });
  }

  class CtaParticle {
    constructor() {
      this.homeX = Math.random() * W;
      this.homeY = Math.random() * H;
      this.x = this.homeX;
      this.y = this.homeY;
      this.tx = this.homeX;
      this.ty = this.homeY;
      this.following = false;
      this.baseLen = Math.random() * 2 + 1.5;
      this.activeLen = Math.random() * 2.5 + 2;
      this.len = this.baseLen;
      this.rgb = [140, 140, 200];
      this.activeRgb = [99, 102, 241];
      if (Math.random() < 0.3) this.activeRgb = [14, 165, 233];
      if (Math.random() < 0.1) this.activeRgb = [16, 185, 129];
      this.baseAlpha = Math.random() * 0.3 + 0.55;
      this.activeAlpha = Math.random() * 0.2 + 0.8;
      this.alpha = this.baseAlpha;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
    }

    update() {
      this.pulsePhase += this.pulseSpeed;
      const pv = (Math.sin(this.pulsePhase) + 1) / 2;

      if (this.following) {
        this.x += (this.tx - this.x) * EASE_TARGET;
        this.y += (this.ty - this.y) * EASE_TARGET;
        this.len = this.activeLen * (0.75 + 0.25 * pv);
        this.alpha = this.activeAlpha * (0.75 + 0.25 * pv);
      } else {
        this.x += (this.homeX - this.x) * EASE_HOME;
        this.y += (this.homeY - this.y) * EASE_HOME;
        this.len = this.baseLen * (0.6 + 0.4 * pv);
        this.alpha = this.baseAlpha * (0.6 + 0.4 * pv);
      }
    }

    draw() {
      const [r, g, b] = this.following ? this.activeRgb : this.rgb;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.len, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
      ctx.fill();
    }
  }

  function resize() {
    if (!canvas.parentElement) return;
    W = canvas.width = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
    if (particles.length === 0) {
      for (let i = 0; i < COUNT; i++) particles.push(new CtaParticle());
    } else {
      particles.forEach(p => {
        p.homeX = Math.random() * W;
        p.homeY = Math.random() * H;
        if (!p.following) {
          p.x = p.homeX;
          p.y = p.homeY;
        }
      });
    }
  }

  function loop() {
    if (!isPageVisible) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animId = raf(loop);
  }

  const btn = $('#final-cta');
  if (btn) {
    btn.addEventListener('mouseenter', () => {
      braceMode = true;
      assignBraceTargets();
    });
    btn.addEventListener('mouseleave', () => {
      braceMode = false;
      clearBraceTargets();
    });
  }

  new ResizeObserver(() => resize()).observe(canvas.parentElement);
  resize();
  loop();

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animId) loop();
    } else {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  }, { threshold: 0 }).observe(canvas);
}

/* ── 8. MOBILE NAV ────────────────────────────────────────────── */
function initMobileNav() {
  const burger = $('#nav-burger');
  const mobileMenu = $('#nav-mobile');
  if (!burger || !mobileMenu) return;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', toggle);

  // Close on link click
  $$('.nav__link, .btn', mobileMenu).forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggle();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) toggle();
  });
}

/* ── 9. SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ── 10. CTA RIPPLE EFFECT ON BUTTONS ─────────────────────────── */
function initCtaRipple() {
  $$('.btn--primary, .btn--xl, .btn--nav, .btn--ghost').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const glow = document.createElement('span');
      glow.style.cssText = `
        position:absolute;
        top:50%;left:50%;
        width:0;height:0;
        background:rgba(255,255,255,0.18);
        border-radius:50%;
        transform:translate(-50%,-50%);
        pointer-events:none;
        animation:ripple 0.6s ease-out forwards;
      `;

      if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `@keyframes ripple{to{width:220%;height:220%;opacity:0}}`;
        document.head.appendChild(style);
      }

      btn.appendChild(glow);
      setTimeout(() => glow.remove(), 600);
    });
  });
}

/* ── 11. FEATURE CARD MOUSE TILT (3D PERSPECTIVE) ─────────────── */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const tiltCards = $$(
    '.feature-card, .problem__card, .process-step-card, .science__lab-card, .compare__col'
  );

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-6px) scale(1.01) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── 12. LAZY IMAGE LOADING FALLBACK ──────────────────────────── */
function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return; // Native lazy load support

  const lazyImgs = $$('img[loading="lazy"]');
  const imgObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src || entry.target.src;
        imgObs.unobserve(entry.target);
      }
    });
  });
  lazyImgs.forEach(img => imgObs.observe(img));
}

/* ── STAT COUNTERS ANIMATION ──────────────────────────────────── */
function animateCounter(el, target, suffix, duration = 1600) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const value = eased * target;
    el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (progress < 1) raf(step);
  }
  raf(step);
}

function initCounters() {
  const stats = $$('.hero__stat-value');
  if (stats.length === 0) return;

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();

        if (text.includes('D-')) {
          // Animate Stage D-01 to D-04
          const start = performance.now();
          const duration = 1400;
          function stepD(now) {
            const p = Math.min((now - start) / duration, 1);
            const val = Math.min(4, Math.floor(1 + p * 3.99));
            el.textContent = `D-0${val}`;
            if (p < 1) raf(stepD);
          }
          raf(stepD);
        } else {
          const unit = el.querySelector('.hero__stat-unit');
          const unitText = unit ? unit.textContent : (text.includes('%') ? '%' : (text.includes('h') ? 'h' : ''));
          const numericTarget = parseFloat(text.replace(/[^0-9.]/g, '')) || 100;

          el.innerHTML = '';
          if (unit) el.appendChild(unit);

          animateCounter(el, numericTarget, unitText);
        }
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(el => counterObs.observe(el));
}

/* ── 13. INIT ON DOMCONTENTLOADED ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initCanvas();
  initEgg3D();
  initDnaHelix();
  initCtaCanvas();
  initMobileNav();
  initSmoothScroll();
  initCtaRipple();
  initCardTilt();
  initLazyImages();

  // Initial scroll calculation
  handleScroll(window.scrollY);

  // Counter animation
  setTimeout(initCounters, 700);

  // Futuristic ZYVORA branding in console
  console.log(
    '%cZYVORA® – ENGINEERING THE FUTURE OF LIFE 🧬',
    'color:#0ea5e9;background:#020d1c;font-size:14px;font-weight:900;padding:6px 12px;border-radius:4px;border:1px solid #0ea5e9;'
  );
  console.log(
    '%cPrecision In Ovo Biotechnology · Deep Learning & Spectroscopic Analysis · 2026',
    'color:#06b6d4;font-size:11px;'
  );
});

/* ── 14. PAGE VISIBILITY ──────────────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;

  if (document.hidden) {
    $$('.hero__orb, .incubator-base-glow-fx').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  } else {
    $$('.hero__orb, .incubator-base-glow-fx').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }
});
