/* AgriVN — App.js */
'use strict';

// ============================
// DATA
// ============================
const LISTINGS = [
  { id: 1, emoji: '☕', category: 'coffee', name: 'Premium Robusta G1', region: 'Dak Lak, Vietnam', price: '$2,340/MT', minQty: '5 MT', availQty: '240 MT', cert: 'UTZ, Rainforest', seller: 'Dak Lak Coffex', imgClass: 'listing-img-coffee', urgency: false },
  { id: 2, emoji: '🍈', category: 'durian', name: 'Monthong Durian — IQF Frozen', region: 'Dak Lak, Vietnam', price: '$4,200/MT', minQty: '2 MT', availQty: '80 MT', cert: 'GlobalG.A.P', seller: 'Mekong Agri Export', imgClass: 'listing-img-durian', urgency: true },
  { id: 3, emoji: '🌾', category: 'rice', name: 'ST25 Jasmine Rice', region: 'Soc Trang, Mekong Delta', price: '$720/MT', minQty: '20 MT', availQty: '1,200 MT', cert: 'Organic, USDA', seller: 'Delta Rice Corp', imgClass: 'listing-img-rice', urgency: false },
  { id: 4, emoji: '🥭', category: 'fruit', name: 'Cat Hoa Loc Mango', region: 'Dong Thap, Vietnam', price: '$890/MT', minQty: '3 MT', availQty: '65 MT', cert: 'VietGAP', seller: 'Mekong Fresh', imgClass: 'listing-img-fruit', urgency: false },
  { id: 5, emoji: '☕', category: 'coffee', name: 'Arabica SHG Lam Dong', region: 'Lam Dong, Vietnam', price: '$3,780/MT', minQty: '2 MT', availQty: '120 MT', cert: 'Organic, FLO', seller: 'Highland Coop', imgClass: 'listing-img-coffee', urgency: false },
  { id: 6, emoji: '🐉', category: 'fruit', name: 'Red Dragon Fruit', region: 'Binh Thuan, Vietnam', price: '$760/MT', minQty: '5 MT', availQty: '320 MT', cert: 'GlobalG.A.P', seller: 'ThanhLong Export', imgClass: 'listing-img-fruit', urgency: true },
  { id: 7, emoji: '🫘', category: 'cashew', name: 'W320 Cashew Kernels', region: 'Binh Phuoc, Vietnam', price: '$7,800/MT', minQty: '1 MT', availQty: '45 MT', cert: 'FSSC 22000', seller: 'Viet Cashew Co', imgClass: 'listing-img-cashew', urgency: false },
  { id: 8, emoji: '🍈', category: 'durian', name: 'Ri6 Durian — Fresh Export', region: 'Tien Giang, Vietnam', price: '$3,600/MT', minQty: '3 MT', availQty: '55 MT', cert: 'VietGAP', seller: 'Mekong Premium', imgClass: 'listing-img-durian', urgency: false },
  { id: 9, emoji: '🌾', category: 'rice', name: 'Fragrant White Rice 5%', region: 'An Giang, Mekong Delta', price: '$520/MT', minQty: '50 MT', availQty: '5,000 MT', cert: 'ISO 22000', seller: 'VietRice Export', imgClass: 'listing-img-rice', urgency: false },
];

const PRODUCERS = [
  { emoji: '☕', name: 'Dak Lak Coffex Co.', loc: 'Buon Ma Thuot, Dak Lak', tags: ['Robusta', 'Arabica', 'UTZ'], rating: '4.9 ★', volume: '2,400 MT/yr' },
  { emoji: '🍈', name: 'Mekong Agri Export', loc: 'Tien Giang, Mekong Delta', tags: ['Durian', 'Mango', 'GlobalG.A.P'], rating: '4.8 ★', volume: '380 MT/yr' },
  { emoji: '🌾', name: 'Delta Rice Corporation', loc: 'Soc Trang, An Giang', tags: ['Jasmine', 'ST25', 'Organic'], rating: '4.7 ★', volume: '12,000 MT/yr' },
  { emoji: '🫘', name: 'VietCashew Processing Ltd', loc: 'Binh Phuoc Province', tags: ['W240', 'W320', 'FSSC 22000'], rating: '4.9 ★', volume: '480 MT/yr' },
  { emoji: '🐉', name: 'ThanhLong Dragon Fruit Farm', loc: 'Binh Thuan Province', tags: ['Red Flesh', 'White Flesh', 'GlobalG.A.P'], rating: '4.6 ★', volume: '720 MT/yr' },
  { emoji: '🌶️', name: 'Central Highlands Pepper', loc: 'Gia Lai, Dak Nong', tags: ['Black Pepper', 'White Pepper', 'Organic'], rating: '4.8 ★', volume: '320 MT/yr' },
];

const BUYERS = [
  { country: '🇨🇳 China', pct: 92 },
  { country: '🇺🇸 United States', pct: 68 },
  { country: '🇩🇪 Germany', pct: 54 },
  { country: '🇯🇵 Japan', pct: 48 },
  { country: '🇰🇷 South Korea', pct: 39 },
  { country: '🇦🇺 Australia', pct: 28 },
];

const CHART_DATA = {
  coffee: [2050, 2120, 2200, 2180, 2290, 2340],
  durian:  [3200, 3500, 3800, 3700, 4100, 4200],
  rice:    [490,  510,  530,  505,  520,  520],
};

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ============================
// NAVBAR SCROLL
// ============================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ============================
// PARTICLES
// ============================
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${60 + Math.random() * 40}%;
      --dur: ${5 + Math.random() * 8}s;
      --delay: ${Math.random() * 6}s;
      width: ${2 + Math.random() * 3}px;
      height: ${2 + Math.random() * 3}px;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(p);
  }
}
createParticles();

// ============================
// MODIFYING HERO BG WITH IMG
// ============================
(function setHeroBg() {
  const overlay = document.querySelector('.hero-bg-overlay');
  if (overlay) {
    overlay.style.backgroundImage = "url('hero.jpg')";
    overlay.style.opacity = '0.06';
  }
})();

// ============================
// LISTINGS
// ============================
let activeFilter = 'all';
let searchQuery = '';

function renderListings() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;
  let data = LISTINGS.filter(l => {
    const matchFilter = activeFilter === 'all' || l.category === activeFilter;
    const matchSearch = searchQuery === '' ||
      l.name.toLowerCase().includes(searchQuery) ||
      l.region.toLowerCase().includes(searchQuery) ||
      l.cert.toLowerCase().includes(searchQuery);
    return matchFilter && matchSearch;
  });
  grid.innerHTML = data.map((l, i) => `
    <div class="listing-card" style="animation-delay:${i * 0.06}s" id="listing-${l.id}">
      <div class="listing-img ${l.imgClass}">
        <span>${l.emoji}</span>
        <span class="listing-badge-cert">${l.cert.split(',')[0].trim()}</span>
        ${l.urgency ? '<span class="listing-badge-cert" style="right:10px;left:auto;background:rgba(232,85,85,0.2);border-color:rgba(232,85,85,0.4);color:#e85555;">⚡ Limited</span>' : ''}
      </div>
      <div class="listing-body">
        <div class="listing-top">
          <div class="listing-name">${l.name}</div>
          <div class="listing-price">${l.price}</div>
        </div>
        <div class="listing-country">📍 ${l.region}</div>
        <div class="listing-info">
          <span class="listing-tag">Min: ${l.minQty}</span>
          <span class="listing-tag">Avail: ${l.availQty}</span>
          <span class="listing-tag">${l.cert.split(',')[0].trim()}</span>
        </div>
        <div class="listing-footer">
          <div class="listing-seller">By <strong>${l.seller}</strong></div>
          <button class="listing-action" onclick="openModal('sourcing')">Request Quote</button>
        </div>
      </div>
    </div>
  `).join('');
}
renderListings();

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderListings();
  });
});

// Search
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderListings();
});

// Load more
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
  const btn = document.getElementById('loadMoreBtn');
  btn.textContent = 'Loading...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'All listings loaded ✓';
  }, 1200);
});

// ============================
// PRODUCERS
// ============================
function renderProducers() {
  const list = document.getElementById('producersList');
  if (!list) return;
  list.innerHTML = PRODUCERS.map((p) => `
    <div class="producer-card">
      <div class="producer-avatar">${p.emoji}</div>
      <div class="producer-info">
        <div class="producer-name">${p.name}</div>
        <div class="producer-loc">📍 ${p.loc}</div>
        <div class="producer-tags">
          ${p.tags.map(t => `<span class="producer-tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="producer-right">
        <div class="producer-rating">${p.rating}</div>
        <div class="producer-volume">${p.volume}</div>
      </div>
    </div>
  `).join('');
}
renderProducers();

// ============================
// BUYER BARS
// ============================
function renderBuyerBars() {
  const container = document.getElementById('buyerBars');
  if (!container) return;
  container.innerHTML = BUYERS.map(b => `
    <div class="buyer-bar-item">
      <div class="buyer-bar-label">
        <span>${b.country}</span>
        <span>${b.pct}%</span>
      </div>
      <div class="buyer-bar-track">
        <div class="buyer-bar-fill" style="width:0%" data-width="${b.pct}%"></div>
      </div>
    </div>
  `).join('');
  // Animate bars when visible
  const bars = container.querySelectorAll('.buyer-bar-fill');
  setTimeout(() => {
    bars.forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 400);
}
renderBuyerBars();

// ============================
// ANIMATED COUNTERS
// ============================
function animateCounter(el, target, suffix = '', prefix = '') {
  if (!el) return;
  let start = 0;
  const duration = 2000;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

let countersStarted = false;
function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  animateCounter(document.getElementById('counterExport'), 184600, ' MT');
  animateCounter(document.getElementById('counterTrade'), 2840, '');
}

// ============================
// PRICE CHART (Canvas)
// ============================
let activeChartData = 'coffee';
const canvas = document.getElementById('priceChart');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawChart(dataKey) {
  if (!ctx) return;
  const data = CHART_DATA[dataKey];
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const minV = Math.min(...data) * 0.96;
  const maxV = Math.max(...data) * 1.04;
  const range = maxV - minV;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xOf = (i) => padL + (i / (data.length - 1)) * plotW;
  const yOf = (v) => padT + plotH - ((v - minV) / range) * plotH;

  // Grid lines
  ctx.strokeStyle = 'rgba(34,164,99,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    const val = maxV - (i / 4) * range;
    ctx.fillStyle = 'rgba(139,171,150,0.6)';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('$' + Math.round(val).toLocaleString(), padL - 6, y + 4);
  }

  // X labels
  MONTHS.forEach((m, i) => {
    ctx.fillStyle = 'rgba(139,171,150,0.6)';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m, xOf(i), H - 10);
  });

  // Area fill
  const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  grad.addColorStop(0, 'rgba(34,164,99,0.22)');
  grad.addColorStop(1, 'rgba(34,164,99,0)');
  ctx.beginPath();
  data.forEach((v, i) => {
    i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v));
  });
  ctx.lineTo(xOf(data.length - 1), padT + plotH);
  ctx.lineTo(padL, padT + plotH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#22a463';
  ctx.lineJoin = 'round';
  data.forEach((v, i) => {
    i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v));
  });
  ctx.stroke();

  // Points
  data.forEach((v, i) => {
    const x = xOf(i), y = yOf(v);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#22a463';
    ctx.fill();
    ctx.strokeStyle = '#080e0a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Value label on last point
    if (i === data.length - 1) {
      ctx.fillStyle = '#f5bc47';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$' + v.toLocaleString(), x, y - 12);
    }
  });
}

if (canvas) {
  // Resize canvas properly
  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 56;
    canvas.height = 220;
    drawChart(activeChartData);
  };
  setTimeout(resize, 100);
  window.addEventListener('resize', resize);
}

document.querySelectorAll('.chart-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeChartData = tab.dataset.chart;
    drawChart(activeChartData);
  });
});

// ============================
// INTERSECTION OBSERVER
// ============================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (el.id === 'exportCard' || el.id === 'tradeCard') startCounters();
      // Animate buyer bars when visible
      if (el.id === 'buyerBars') {
        el.querySelectorAll('.buyer-bar-fill').forEach(b => {
          b.style.width = b.dataset.width;
        });
      }
    }
  });
}, { threshold: 0.3 });

['exportCard', 'tradeCard', 'buyerBars'].forEach(id => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

// Observe section reveals
document.querySelectorAll('.cat-card, .svc-card, .listing-card, .producer-card, .insight-stat-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ${i * 0.06}s, transform 0.5s ${i * 0.06}s`;
  const obs2 = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      obs2.disconnect();
    }
  }, { threshold: 0.1 });
  obs2.observe(el);
});

// ============================
// MODAL
// ============================
const overlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

const MODAL_CONFIGS = {
  signup: { icon: '🌿', title: 'Join AgriVN', sub: 'Access Vietnam\'s #1 B2B agricultural export platform' },
  login: { icon: '🔑', title: 'Welcome Back', sub: 'Sign in to your AgriVN trade account' },
  sourcing: { icon: '🔍', title: 'Request a Quote', sub: 'Our sourcing team will respond within 24 hours' },
  buyer: { icon: '🌍', title: 'Start Buying', sub: 'Register as an international buyer on AgriVN' },
  seller: { icon: '🌱', title: 'List Your Farm', sub: 'Join 1,200+ verified Vietnamese producers' },
  logistics: { icon: '🚢', title: 'Get a Logistics Quote', sub: 'Door-to-port cold chain for your shipment' },
  financing: { icon: '💰', title: 'Apply for Trade Finance', sub: 'Pre-shipment finance, LC & invoice factoring' },
};

function openModal(type = 'signup') {
  const cfg = MODAL_CONFIGS[type] || MODAL_CONFIGS.signup;
  document.getElementById('modalIcon').textContent = cfg.icon;
  document.getElementById('modalTitle').textContent = cfg.title;
  document.getElementById('modalSub').textContent = cfg.sub;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Wire up all CTA buttons
document.getElementById('startSourcingBtn')?.addEventListener('click', () => openModal('signup'));
document.getElementById('watchDemoBtn')?.addEventListener('click', () => openModal('signup'));
document.getElementById('signupBtn')?.addEventListener('click', () => openModal('signup'));
document.getElementById('loginBtn')?.addEventListener('click', () => openModal('login'));
document.getElementById('buyerSignupBtn')?.addEventListener('click', () => openModal('buyer'));
document.getElementById('sellerSignupBtn')?.addEventListener('click', () => openModal('seller'));
document.getElementById('logisticsBtn')?.addEventListener('click', () => openModal('logistics'));
document.getElementById('financingBtn')?.addEventListener('click', () => openModal('financing'));
document.getElementById('sourcingBtn')?.addEventListener('click', () => openModal('sourcing'));

// Category cards
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('sourcing');
  });
});

// Modal submit
document.getElementById('modalSubmit')?.addEventListener('click', () => {
  const email = document.getElementById('modalEmail').value;
  const company = document.getElementById('modalCompany').value;
  if (!email || !company) {
    document.getElementById('modalEmail').style.borderColor = '#e85555';
    document.getElementById('modalCompany').style.borderColor = '#e85555';
    setTimeout(() => {
      document.getElementById('modalEmail').style.borderColor = '';
      document.getElementById('modalCompany').style.borderColor = '';
    }, 1800);
    return;
  }
  const btn = document.getElementById('modalSubmit');
  btn.textContent = '✓ Application Received!';
  btn.style.background = 'linear-gradient(135deg, #1a5c37, #22a463)';
  setTimeout(closeModal, 1800);
  setTimeout(() => { btn.textContent = 'Get Early Access →'; btn.style.background = ''; }, 2200);
});

// ============================
// SMOOTH SCROLL NAV
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================
// TICKER PAUSE ON HOVER
// ============================
const ticker = document.getElementById('tickerTrack');
if (ticker) {
  ticker.addEventListener('mouseenter', () => { ticker.style.animationPlayState = 'paused'; });
  ticker.addEventListener('mouseleave', () => { ticker.style.animationPlayState = 'running'; });
}

// ============================
// MAP PIN TOOLTIPS
// ============================
const pinData = {
  pinCoffee: 'Dak Lak — 520K coffee farms',
  pinDurian: 'Binh Phuoc — Durian heartland',
  pinRice: 'Mekong Delta — Rice bowl of Vietnam',
  pinCashew: 'Binh Phuoc — World\'s largest cashew exporter',
  pinHanoi: 'Hanoi — Trade HQ',
  pinHCM: 'Ho Chi Minh City — AgriVN HQ',
};
Object.entries(pinData).forEach(([id, tip]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('mouseenter', (e) => {
    const tooltip = document.createElement('div');
    tooltip.id = 'mapTooltip';
    tooltip.textContent = tip;
    tooltip.style.cssText = `
      position:fixed; background:#0d1810; border:1px solid rgba(34,164,99,0.3);
      color:#f0f7f2; padding:6px 12px; border-radius:8px; font-size:0.75rem;
      z-index:9999; pointer-events:none; white-space:nowrap;
      left:${e.clientX + 12}px; top:${e.clientY - 30}px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(tooltip);
  });
  el.addEventListener('mousemove', (e) => {
    const t = document.getElementById('mapTooltip');
    if (t) { t.style.left = `${e.clientX + 12}px`; t.style.top = `${e.clientY - 30}px`; }
  });
  el.addEventListener('mouseleave', () => {
    document.getElementById('mapTooltip')?.remove();
  });
  el.addEventListener('click', () => openModal('sourcing'));
});

// ============================
// HERO BG — Use generated image if available
// ============================
(function() {
  const img = new Image();
  img.onload = () => {
    const overlay = document.querySelector('.hero-bg-overlay');
    if (overlay) {
      overlay.style.backgroundImage = `url('${img.src}')`;
      overlay.style.opacity = '0.07';
      overlay.style.backgroundSize = 'cover';
    }
  };
  img.src = 'hero.jpg';
})();

console.log('%c🌿 AgriVN Platform loaded — Vietnam\'s B2B Agri Export Intelligence', 'color:#22a463;font-size:14px;font-weight:bold;');

// ============================
// AI CHAT WIDGET
// ============================
const aiChatToggle = document.getElementById('aiChatToggle');
const aiChatBox = document.getElementById('aiChatBox');
const aiMessages = document.getElementById('aiMessages');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');
const aiToggleClose = document.getElementById('aiToggleClose');
const aiToggleIcon = document.querySelector('.ai-toggle-icon');
const aiToggleLabel = document.querySelector('.ai-toggle-label');
let chatOpen = false;

const AI_RESPONSES = {
  'coffee': `Great choice! ☕ I found **3 verified Arabica farms** in the Central Highlands:\n\n• **Highland Coop** — Lam Dong, Organic & FLO certified, 120 MT available, $3,780/MT\n• **Dak Lak Coffex** — Buon Ma Thuot, UTZ certified, 240 MT, $2,340/MT (Robusta G1)\n• **Gia Lai Premium** — Gia Lai, Rainforest Alliance, 80 MT, $3,200/MT\n\n📋 Want me to request samples from these farms?`,
  'durian': `Durian is on fire right now! 🍈 ▲7.1% this month.\n\nTop matches:\n• **Mekong Premium** — Tien Giang, Ri6 Fresh, 55 MT, $3,600/MT\n• **Mekong Agri Export** — Dak Lak, Monthong IQF Frozen, 80 MT, $4,200/MT\n\nBoth are GlobalG.A.P certified. IQF frozen has longer shelf life for ocean freight. Shall I get quotes?`,
  'rice': `Vietnam's rice is world-class! 🌾\n\nBest matches for your needs:\n• **Delta Rice Corp** — Soc Trang, ST25 Jasmine, USDA Organic, 1,200 MT avail, $720/MT\n• **VietRice Export** — An Giang, Fragrant White 5%, ISO 22000, 5,000 MT, $520/MT\n\nST25 won "World's Best Rice" 3 years running. I can arrange samples within 5 days.`,
  'price': `📊 Current market prices (updated today):\n\n| Product | Price/MT | Trend |\n|---------|----------|-------|\n| Robusta G1 | $2,340 | ▲ 3.2% |\n| Arabica SHG | $3,780 | ▲ 5.5% |\n| Monthong Durian | $4,200 | ▲ 7.1% |\n| ST25 Rice | $720 | ▲ 1.4% |\n| Dragon Fruit | $760 | ▲ 2.9% |\n\nWant price alerts for any commodity?`,
  'default': `I understand you're looking for Vietnamese agricultural products! 🌿\n\nLet me help. Could you specify:\n1. **Product type** (coffee, durian, rice, fruits, cashew, pepper)\n2. **Volume needed** (MT)\n3. **Certifications** (Organic, UTZ, GlobalG.A.P, etc.)\n4. **Delivery timeline**\n\nOr ask me about current market prices!`
};

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('coffee') || lower.includes('arabica') || lower.includes('robusta') || lower.includes('cà phê')) return 'coffee';
  if (lower.includes('durian') || lower.includes('sầu riêng') || lower.includes('monthong')) return 'durian';
  if (lower.includes('rice') || lower.includes('gạo') || lower.includes('st25') || lower.includes('jasmine')) return 'rice';
  if (lower.includes('price') || lower.includes('giá') || lower.includes('cost') || lower.includes('market')) return 'price';
  return 'default';
}

function addMessage(text, type) {
  const suggestions = document.getElementById('aiSuggestions');
  if (suggestions) suggestions.remove();

  const msg = document.createElement('div');
  msg.className = `ai-msg ${type}`;
  const bubble = document.createElement('div');
  bubble.className = 'ai-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  msg.appendChild(bubble);
  aiMessages.appendChild(msg);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'ai-msg bot';
  typing.id = 'aiTyping';
  typing.innerHTML = `<div class="ai-typing"><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div></div>`;
  aiMessages.appendChild(typing);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function removeTyping() {
  document.getElementById('aiTyping')?.remove();
}

function handleChatSend() {
  const text = aiInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  aiInput.value = '';
  showTyping();
  const intent = detectIntent(text);
  const delay = 800 + Math.random() * 1200;
  setTimeout(() => {
    removeTyping();
    addMessage(AI_RESPONSES[intent], 'bot');
  }, delay);
}

if (aiChatToggle) {
  aiChatToggle.addEventListener('click', () => {
    chatOpen = !chatOpen;
    aiChatBox.classList.toggle('open', chatOpen);
    if (chatOpen) {
      aiToggleIcon.style.display = 'none';
      aiToggleLabel.textContent = '';
      aiToggleClose.style.display = 'inline';
      aiInput.focus();
    } else {
      aiToggleIcon.style.display = '';
      aiToggleLabel.textContent = 'AI Sourcing';
      aiToggleClose.style.display = 'none';
    }
  });
}

if (aiSend) aiSend.addEventListener('click', handleChatSend);
if (aiInput) aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleChatSend(); });

document.querySelectorAll('.ai-suggest').forEach(btn => {
  btn.addEventListener('click', () => {
    aiInput.value = btn.dataset.msg;
    handleChatSend();
  });
});

// Also reveal feed cards on scroll
document.querySelectorAll('.feed-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`;
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(el);
});

