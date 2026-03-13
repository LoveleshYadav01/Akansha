/* ═══════════════════════════════════════════════════
   MADHU — Nature's Pure Gold  |  script.js
   All Animations · Cart · Interactions · Scroll FX
═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────
   BEE SWARM ANIMATION
────────────────────────────────────────────────── */
const canvas  = document.getElementById('beeCanvas');
const ctx     = canvas.getContext('2d');
let W, H, jarX, jarY, jarR;

/* Resize canvas to fill window */
function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  jarX = W / 2;
  jarY = H / 2 + 30;
  jarR = Math.min(W, H) * 0.07;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ── Bee class ── */
class Bee {
  constructor(i, total) {
    this.id = i;
    this.reset(total);
    // Start scattered around canvas edges
    const side = Math.floor(Math.random() * 4);
    switch(side) {
      case 0: this.x = Math.random() * W; this.y = -30; break;
      case 1: this.x = W + 30; this.y = Math.random() * H; break;
      case 2: this.x = Math.random() * W; this.y = H + 30; break;
      default: this.x = -30; this.y = Math.random() * H; break;
    }
    this.entered = false;
    this.phase   = Math.random() * Math.PI * 2; // for wavy motion
    this.waggle  = 0;
  }

  reset(total) {
    this.x   = Math.random() * W;
    this.y   = Math.random() * H;
    this.vx  = (Math.random() - 0.5) * 2.5;
    this.vy  = (Math.random() - 0.5) * 2.5;
    this.size = 3.5 + Math.random() * 3;
    this.speed = 1.0 + Math.random() * 1.8;
    this.wingFlap = 0;
    this.wingDir  = 1;
    this.alpha    = 0.85 + Math.random() * 0.15;
    this.entered  = false;
    this.enterProgress = 0;
    this.swarmOffset = { x:(Math.random()-0.5)*120, y:(Math.random()-0.5)*80 };
    this.phase = Math.random() * Math.PI * 2;
  }

  /* Swarm phase: drift toward jar region with natural wave motion */
  swarmUpdate(t, progress) {
    const targetX = jarX + this.swarmOffset.x * (1 - progress);
    const targetY = jarY + this.swarmOffset.y * (1 - progress) - 60;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Steering force
    const steer = 0.015 + progress * 0.06;
    if (dist > 2) {
      this.vx += (dx / dist) * steer * this.speed;
      this.vy += (dy / dist) * steer * this.speed;
    }

    // Wavy organic motion
    this.phase += 0.06;
    this.vx += Math.sin(this.phase + this.id) * 0.08;
    this.vy += Math.cos(this.phase * 0.7 + this.id) * 0.06;

    // Dampen velocity
    const maxV = this.speed * 2.2;
    const v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    if (v > maxV) { this.vx = (this.vx/v)*maxV; this.vy = (this.vy/v)*maxV; }

    this.x += this.vx;
    this.y += this.vy;

    // Wing flap
    this.wingFlap += 0.4 * this.wingDir;
    if (Math.abs(this.wingFlap) > 1) this.wingDir *= -1;
  }

  /* Entry phase: fly into jar opening */
  entryUpdate() {
    if (this.entered) return;
    const dx = jarX - this.x;
    const dy = jarY - 80 - this.y;   // aim for lid area
    const dist = Math.sqrt(dx*dx + dy*dy);

    const speed = 3.5 + Math.random();
    if (dist > 5) {
      this.vx = (dx/dist) * speed;
      this.vy = (dy/dist) * speed;
    }
    this.x += this.vx;
    this.y += this.vy;

    // Spiral inward
    this.x += Math.cos(this.phase) * 1.2;
    this.y += Math.sin(this.phase) * 1.2;
    this.phase += 0.18;

    // Shrink + fade as they enter
    this.enterProgress = Math.min(1, this.enterProgress + 0.025);
    this.size   = Math.max(0, this.size * (1 - this.enterProgress * 0.04));
    this.alpha  = Math.max(0, 1 - this.enterProgress * 0.9);

    if (dist < 22 || this.enterProgress > 0.98) {
      this.entered = true;
    }

    this.wingFlap += 0.5 * this.wingDir;
    if (Math.abs(this.wingFlap) > 1) this.wingDir *= -1;
  }

  draw(ctx) {
    if (this.entered || this.size < 0.5 || this.alpha < 0.02) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = this.alpha;

    const s = this.size;
    const angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(angle);

    // Body (golden ellipse with stripes)
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.8, s * 1.1, 0, 0, Math.PI * 2);
    const bodyGrad = ctx.createLinearGradient(-s*1.8, 0, s*1.8, 0);
    bodyGrad.addColorStop(0,   '#c77800');
    bodyGrad.addColorStop(0.3, '#f4b400');
    bodyGrad.addColorStop(0.6, '#c77800');
    bodyGrad.addColorStop(1,   '#f4b400');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Black stripe bands
    ctx.fillStyle = 'rgba(10,4,0,0.7)';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * s * 0.7, 0, s * 0.22, s * 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wings (flapping)
    const wingAngle = this.wingFlap * 0.5;
    ctx.globalAlpha = this.alpha * 0.55;
    ctx.fillStyle = 'rgba(200,230,255,0.7)';
    // Upper wings
    ctx.save();
    ctx.rotate(-wingAngle * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, -s * 1.4, s * 1.5, s * 0.7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.rotate(wingAngle * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, s * 1.4, s * 1.5, s * 0.7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Stinger
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#c77800';
    ctx.beginPath();
    ctx.moveTo(-s * 1.8, 0);
    ctx.lineTo(-s * 2.4, 0);
    ctx.lineTo(-s * 1.8, s * 0.4);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#1a0a05';
    ctx.beginPath();
    ctx.ellipse(s * 1.9, 0, s * 0.7, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = 'rgba(255,248,220,0.9)';
    ctx.beginPath();
    ctx.ellipse(s * 2.1, -s * 0.2, s * 0.2, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* ── Animation state machine ── */
const PHASE = { SWARM:0, CONVERGE:1, ENTER:2, DONE:3 };
let bees = [];
let phase = PHASE.SWARM;
let phaseTimer = 0;
let beesEntered = 0;
let animationId;
let currentTime = 0;
const BEE_COUNT = 180;

function initBees() {
  bees = Array.from({ length: BEE_COUNT }, (_, i) => new Bee(i, BEE_COUNT));
}

/* Main animation loop */
function animateBees() {
  animationId = requestAnimationFrame(animateBees);
  ctx.clearRect(0, 0, W, H);

  currentTime++;
  phaseTimer++;

  // Swarm for 3s then converge, then enter
  if (phase === PHASE.SWARM && phaseTimer > 180) {
    phase = PHASE.CONVERGE;
    phaseTimer = 0;
  }
  if (phase === PHASE.CONVERGE && phaseTimer > 90) {
    phase = PHASE.ENTER;
    phaseTimer = 0;
  }

  let allEntered = true;

  bees.forEach((bee, i) => {
    if (phase === PHASE.SWARM) {
      bee.swarmUpdate(currentTime, 0);
      bee.draw(ctx);
    } else if (phase === PHASE.CONVERGE) {
      const p = Math.min(1, phaseTimer / 90);
      bee.swarmUpdate(currentTime, p);
      bee.draw(ctx);
    } else if (phase === PHASE.ENTER) {
      if (!bee.entered) {
        bee.entryUpdate();
        bee.draw(ctx);
        allEntered = false;
      }
    }
  });

  if (phase === PHASE.ENTER && allEntered) {
    phase = PHASE.DONE;
    cancelAnimationFrame(animationId);
    onAllBeesEntered();
  }
}

/* ──────────────────────────────────────────────────
   INTRO SEQUENCE
────────────────────────────────────────────────── */
function onAllBeesEntered() {
  // 1. Freeze jar with glow
  const jarWrap = document.getElementById('jarWrap');
  jarWrap.classList.add('frozen');

  // 2. After 400ms: reveal buffalo
  setTimeout(() => {
    const buffalo = document.getElementById('buffaloWrap');
    buffalo.classList.add('show');

    // 3. After buffalo rises: roar animation
    setTimeout(() => {
      buffalo.classList.add('roar');
      buffalo.addEventListener('animationend', () => {
        buffalo.classList.remove('roar');
      }, { once: true });

      // 4. After roar: show brand text
      setTimeout(() => {
        document.getElementById('introText').classList.add('show');
      }, 900);

    }, 1300);
  }, 400);
}

/* Enter button → launch main site */
document.getElementById('enterBtn').addEventListener('click', launchSite);
document.getElementById('skipBtn').addEventListener('click',  launchSite);

function launchSite() {
  cancelAnimationFrame(animationId);
  const intro = document.getElementById('intro');
  const site  = document.getElementById('site');

  intro.style.transition = 'opacity 0.8s ease';
  intro.style.opacity    = '0';
  site.classList.add('visible');

  setTimeout(() => {
    intro.style.display = 'none';
    initScrollReveal();
  }, 820);
}

/* ──────────────────────────────────────────────────
   START THE INTRO
────────────────────────────────────────────────── */
initBees();
animateBees();


/* ──────────────────────────────────────────────────
   NAVBAR
────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
navbar.classList.add('scrolled'); // always show on load

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.add('scrolled'); // keep always
  }
});

/* Mobile burger menu */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/* Close menu on link click */
navLinks.querySelectorAll('.nl').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* Active nav link highlight */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const pos = window.scrollY + 100;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const link   = document.querySelector(`.nl[href="#${sec.id}"]`);
    if (link) {
      link.classList.toggle('active', pos >= top && pos < top + height);
    }
  });
});


/* ──────────────────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────────────────── */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on sibling index
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal,.reveal-left,.reveal-right')]
          : [];
        const idx = siblings.indexOf(entry.target);
        const delay = Math.max(0, idx * 80);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:  0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  targets.forEach(t => observer.observe(t));
}


/* ──────────────────────────────────────────────────
   SIZE BUTTON TOGGLE
────────────────────────────────────────────────── */
document.querySelectorAll('.psizes').forEach(group => {
  group.querySelectorAll('.sz').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.sz').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});


/* ──────────────────────────────────────────────────
   SHOPPING CART
────────────────────────────────────────────────── */
let cart = [];

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCart();
  showToast(`${name} added to cart!`);
  openCart();
}

function updateCart() {
  const list      = document.getElementById('cartList');
  const foot      = document.getElementById('cartFoot');
  const totalEl   = document.getElementById('cartTotal');
  const countEl   = document.getElementById('cartCount');

  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    foot.style.display = 'none';
    countEl.textContent = '0';
    countEl.classList.remove('show');
    return;
  }

  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
      <div class="ci-qty">
        <button onclick="changeQty(${idx},-1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${idx},1)">+</button>
      </div>
      <i class="fas fa-trash ci-del" onclick="removeItem(${idx})"></i>
    `;
    list.appendChild(el);
  });

  foot.style.display = 'block';
  totalEl.textContent = '₹' + total.toLocaleString('en-IN');

  const totalCount = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalCount;
  countEl.classList.toggle('show', totalCount > 0);
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  updateCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  updateCart();
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

document.getElementById('cartBtn').addEventListener('click', openCart);


/* ──────────────────────────────────────────────────
   TOAST NOTIFICATION
────────────────────────────────────────────────── */
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}


/* ──────────────────────────────────────────────────
   CONTACT FORM
────────────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  showToast('Message sent! We\'ll be in touch soon.');
  this.reset();
});


/* ──────────────────────────────────────────────────
   SMOOTH PARALLAX on HERO JAR
────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  const jar  = document.querySelector('.hero-jar');
  if (!hero || !jar) return;
  const scrolled = window.scrollY;
  jar.style.transform = `translateY(calc(-50% + ${scrolled * 0.18}px))`;
});


/* ──────────────────────────────────────────────────
   HONEY DRIP BAR — staggered restart
────────────────────────────────────────────────── */
// Drips are pure CSS; randomize durations for organic feel
document.querySelectorAll('.drip').forEach(drip => {
  const dur = (3.8 + Math.random() * 2.4).toFixed(2);
  drip.style.setProperty('--dur', dur + 's');
  // override animation duration with random value
  drip.style.animationDuration = dur + 's';
  if (drip.previousElementSibling) drip.style.animationDuration = dur + 's';
  // Apply to pseudo-elements via a custom property trick
  const delay = (Math.random() * 3.5).toFixed(2);
  drip.style.animationDelay = delay + 's';
  // Reapply to ::before and ::after via class trick
  drip.setAttribute('data-dur', dur);
  drip.setAttribute('data-delay', delay);
});


/* ──────────────────────────────────────────────────
   HONEYCOMB CURSOR TRAIL (subtle golden dots)
────────────────────────────────────────────────── */
const trail = [];
const TRAIL_MAX = 8;

document.addEventListener('mousemove', (e) => {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed; top:${e.clientY}px; left:${e.clientX}px;
    width:6px; height:6px; border-radius:50%;
    background:rgba(244,180,0,0.45); pointer-events:none;
    z-index:9998; transform:translate(-50%,-50%);
    transition:opacity 0.6s ease, transform 0.6s ease;
  `;
  document.body.appendChild(dot);
  trail.push(dot);

  if (trail.length > TRAIL_MAX) {
    const old = trail.shift();
    old.remove();
  }

  requestAnimationFrame(() => {
    dot.style.opacity   = '0';
    dot.style.transform = 'translate(-50%,-50%) scale(0.2)';
  });

  setTimeout(() => dot.remove(), 650);
});


/* ──────────────────────────────────────────────────
   FLOATING HONEYCOMB BG PARTICLES (hero section)
────────────────────────────────────────────────── */
(function createHexParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  for (let i = 0; i < 12; i++) {
    const hex = document.createElement('div');
    const size = 18 + Math.random() * 40;
    const x    = Math.random() * 100;
    const y    = Math.random() * 100;
    const dur  = 8 + Math.random() * 12;
    const del  = Math.random() * 6;

    hex.style.cssText = `
      position:absolute;
      top:${y}%; left:${x}%;
      width:${size}px; height:${size}px;
      font-size:${size}px; line-height:1;
      color:rgba(244,180,0,${0.04 + Math.random() * 0.07});
      animation:hexFloat ${dur}s ease-in-out ${del}s infinite;
      pointer-events:none;
      user-select:none;
      z-index:0;
    `;
    hex.textContent = '⬡';
    hero.appendChild(hex);
  }

  // Inject keyframes
  if (!document.getElementById('hexKF')) {
    const style = document.createElement('style');
    style.id = 'hexKF';
    style.textContent = `
      @keyframes hexFloat {
        0%,100% { transform:translateY(0) rotate(0deg); opacity:0.6; }
        33%     { transform:translateY(-25px) rotate(20deg); opacity:1; }
        66%     { transform:translateY(12px) rotate(-15deg); opacity:0.4; }
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ──────────────────────────────────────────────────
   QUALITY CARD hover: golden shimmer sweep
────────────────────────────────────────────────── */
document.querySelectorAll('.qcard').forEach(card => {
  card.addEventListener('mouseenter', function() {
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position:absolute; inset:0; border-radius:16px;
      background:linear-gradient(105deg,transparent 40%,rgba(244,180,0,0.1) 50%,transparent 60%);
      animation:shimmerPass 0.55s ease forwards;
      pointer-events:none; z-index:2;
    `;
    this.style.position = 'relative';
    this.appendChild(shimmer);

    if (!document.getElementById('shimKF')) {
      const style = document.createElement('style');
      style.id = 'shimKF';
      style.textContent = `
        @keyframes shimmerPass {
          0%   { transform:translateX(-100%); opacity:0; }
          20%  { opacity:1; }
          100% { transform:translateX(100%); opacity:0; }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => shimmer.remove(), 600);
  });
});


/* ──────────────────────────────────────────────────
   GALLERY: lightbox-style hover zoom label
────────────────────────────────────────────────── */
document.querySelectorAll('.gcell').forEach(cell => {
  cell.addEventListener('mouseenter', function() {
    this.querySelector('.gcell-label').style.background = 'rgba(244,180,0,0.85)';
    this.querySelector('.gcell-label').style.color = '#3e2723';
  });
  cell.addEventListener('mouseleave', function() {
    this.querySelector('.gcell-label').style.background = '';
    this.querySelector('.gcell-label').style.color = '';
  });
});


/* ──────────────────────────────────────────────────
   PRODUCT: size button ripple effect
────────────────────────────────────────────────── */
document.querySelectorAll('.sz').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const r = this.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;
      width:50px; height:50px;
      background:rgba(244,180,0,0.35);
      border-radius:50%;
      top:${e.clientY - r.top - 25}px;
      left:${e.clientX - r.left - 25}px;
      transform:scale(0);
      animation:ripple 0.5s ease forwards;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    if (!document.getElementById('rippleKF')) {
      const st = document.createElement('style');
      st.id = 'rippleKF';
      st.textContent = `
        @keyframes ripple {
          to { transform:scale(3); opacity:0; }
        }
      `;
      document.head.appendChild(st);
    }

    setTimeout(() => ripple.remove(), 550);
  });
});


/* ──────────────────────────────────────────────────
   NEWSLETTER SUBSCRIBE
────────────────────────────────────────────────── */
document.querySelector('.nlbtn').addEventListener('click', function() {
  const input = document.querySelector('.nlinput');
  if (input.value.trim()) {
    showToast('Subscribed! Welcome to the MADHU family.');
    input.value = '';
  } else {
    input.focus();
  }
});


/* ──────────────────────────────────────────────────
   SMOOTH SCROLL for all anchor links
────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ──────────────────────────────────────────────────
   KEYBOARD ACCESSIBILITY: close cart on Escape
────────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});


/* ──────────────────────────────────────────────────
   REVEAL TRIGGER: fire on load if already in view
────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  // If user opens site via direct URL scroll
  window.dispatchEvent(new Event('scroll'));
});


/* ──────────────────────────────────────────────────
   BUFFALO EYE GLOW pulse (in intro)
────────────────────────────────────────────────── */
function pulseBuiffaloEye() {
  const eye = document.querySelector('#buffaloSVG circle[fill="#f4a000"]');
  if (!eye) return;

  let bright = true;
  setInterval(() => {
    eye.setAttribute('fill', bright ? '#fff3b0' : '#f4a000');
    eye.setAttribute('r', bright ? '6.5' : '5');
    bright = !bright;
  }, 800);
}

// Trigger eye pulse after buffalo is shown
setTimeout(pulseBuiffaloEye, 3200);


/* ──────────────────────────────────────────────────
   STATISTICS COUNTER ANIMATION (story section)
────────────────────────────────────────────────── */
function animateCounters() {
  const counters = document.querySelectorAll('.ssn');
  counters.forEach(counter => {
    const text = counter.textContent.trim();
    const hasPlus = text.includes('+');
    const hasPct  = text.includes('%');
    const num = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return;

    let start = 0;
    const duration = 1600;
    const steps = 50;
    const increment = num / steps;
    const stepTime = duration / steps;

    counter.textContent = '0' + (hasPlus ? '+' : hasPct ? '%' : '');

    const timer = setInterval(() => {
      start += increment;
      if (start >= num) {
        start = num;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(start) + (hasPlus ? '+' : hasPct ? '%' : '');
    }, stepTime);
  });
}

// Trigger on scroll into story section
const storySection = document.getElementById('story');
let countersDone = false;

if (storySection) {
  const storyObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersDone) {
      countersDone = true;
      animateCounters();
      storyObserver.disconnect();
    }
  }, { threshold: 0.4 });
  storyObserver.observe(storySection);
}
