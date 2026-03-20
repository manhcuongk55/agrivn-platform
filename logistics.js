/* AgriVN Logistics — Interactive Logic */
'use strict';

// ============================
// SHIPPING ROUTES DATA
// ============================
const ROUTES = {
  'hcm-shanghai': { distance: 1800, transit: '5-7', rate: 2800, port: { origin: 'Cat Lai, HCMC', dest: 'Yangshan, Shanghai', destCode: 'CNSHA' } },
  'hcm-hamburg': { distance: 9200, transit: '28-32', rate: 4200, port: { origin: 'Cat Lai, HCMC', dest: 'Hamburg, Germany', destCode: 'DEHAM' } },
  'hcm-la': { distance: 7600, transit: '18-22', rate: 3800, port: { origin: 'Cat Lai, HCMC', dest: 'Long Beach, LA', destCode: 'USLGB' } },
  'hcm-tokyo': { distance: 2900, transit: '7-10', rate: 3100, port: { origin: 'Cat Lai, HCMC', dest: 'Tokyo, Japan', destCode: 'JPTYO' } },
  'hcm-busan': { distance: 2200, transit: '5-8', rate: 2600, port: { origin: 'Cat Lai, HCMC', dest: 'Busan, South Korea', destCode: 'KRPUS' } },
  'hcm-sydney': { distance: 5500, transit: '14-18', rate: 3400, port: { origin: 'Cat Lai, HCMC', dest: 'Sydney, Australia', destCode: 'AUSYD' } },
  'hp-shanghai': { distance: 1600, transit: '4-6', rate: 2500, port: { origin: 'Hai Phong', dest: 'Yangshan, Shanghai', destCode: 'CNSHA' } },
  'hp-hamburg': { distance: 9500, transit: '30-35', rate: 4500, port: { origin: 'Hai Phong', dest: 'Hamburg, Germany', destCode: 'DEHAM' } },
};

const CONTAINER_PREMIUMS = {
  'dry-20': { name: "20' Dry", premium: 1.0, teu: 1 },
  'dry-40': { name: "40' Dry", premium: 1.7, teu: 2 },
  'reefer-20': { name: "20' Reefer", premium: 1.8, teu: 1 },
  'reefer-40': { name: "40' Reefer", premium: 2.8, teu: 2 },
};

// ============================
// QUOTE CALCULATOR
// ============================
function calculateQuote() {
  const routeKey = document.getElementById('quoteRoute').value;
  const containerKey = document.getElementById('quoteContainer').value;
  const qty = Number(document.getElementById('quoteQty').value) || 1;

  const route = ROUTES[routeKey];
  const container = CONTAINER_PREMIUMS[containerKey];
  if (!route || !container) return;

  const baseRate = route.rate * container.premium;
  const totalShipping = baseRate * qty;
  const customs = Math.round(totalShipping * 0.05);
  const insurance = Math.round(totalShipping * 0.02);
  const totalCost = totalShipping + customs + insurance;

  // Update result
  document.getElementById('resRoute').textContent = `${route.port.origin} → ${route.port.dest}`;
  document.getElementById('resContainer').textContent = `${container.name} × ${qty}`;
  document.getElementById('resTransit').textContent = route.transit + ' days';
  document.getElementById('resDistance').textContent = route.distance.toLocaleString() + ' nm';
  document.getElementById('resShipping').textContent = '$' + totalShipping.toLocaleString();
  document.getElementById('resCustoms').textContent = '$' + customs.toLocaleString();
  document.getElementById('resInsurance').textContent = '$' + insurance.toLocaleString();
  document.getElementById('resTotal').textContent = '$' + totalCost.toLocaleString();

  // Update route visual
  document.getElementById('originPort').textContent = route.port.origin;
  document.getElementById('destPort').textContent = route.port.dest;
  document.getElementById('destCode').textContent = route.port.destCode;
  document.getElementById('routeTransit').textContent = route.transit + ' days';
  document.getElementById('routeDistance').textContent = route.distance.toLocaleString() + ' nm';
  document.getElementById('routeTEU').textContent = (container.teu * qty) + ' TEU';
}

document.getElementById('quoteForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  calculateQuote();
});

// Live update
['quoteRoute', 'quoteContainer', 'quoteQty'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', calculateQuote);
  document.getElementById(id)?.addEventListener('input', calculateQuote);
});

// ============================
// BOOKING FORM
// ============================
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const company = document.getElementById('bookCompany').value.trim();
    const email = document.getElementById('bookEmail').value.trim();

    if (!company || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const btn = bookingForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    setTimeout(() => {
      const bookingId = 'AGV-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      btn.textContent = '✓ Booking Confirmed!';
      btn.style.background = 'linear-gradient(135deg, #1a5c37, #22a463)';
      showToast(`Booking ${bookingId} confirmed for ${company}! Check your email for details.`);
      setTimeout(() => {
        btn.textContent = 'Request Booking';
        btn.style.background = '';
        btn.disabled = false;
        bookingForm.reset();
      }, 3000);
    }, 1500);
  });
}

// ============================
// TOAST
// ============================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #111d15; border: 1px solid ${type === 'error' ? 'rgba(232,85,85,0.4)' : 'rgba(74,154,222,0.4)'};
    border-radius: 10px; padding: 12px 20px; font-size: 0.85rem;
    color: #f0f7f2; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); animation: toastIn 0.3s ease;
    min-width: 280px;
  `;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================
// SCROLL REVEAL
// ============================
document.querySelectorAll('.svc-card, .quote-form-card, .quote-result-card, .route-card, .tracking-card, .booking-card, .log-kpi-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ${i * 0.06}s, transform 0.5s ${i * 0.06}s`;
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); }
  }, { threshold: 0.1 });
  obs.observe(el);
});

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
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

let countersStarted = false;
const kpiObs = new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !countersStarted) {
    countersStarted = true;
    animateCounter(document.getElementById('kpiShipments'), 12400, '+');
    animateCounter(document.getElementById('kpiCountries'), 48, '');
    animateCounter(document.getElementById('kpiOnTime'), 96, '%');
    animateCounter(document.getElementById('kpiPartners'), 85, '+');
  }
}, { threshold: 0.3 });
const kpiStrip = document.querySelector('.log-kpi-strip');
if (kpiStrip) kpiObs.observe(kpiStrip);

// Init
calculateQuote();

console.log('%c🌿 AgriVN Logistics loaded', 'color:#4a9ade;font-size:13px;font-weight:bold;');
