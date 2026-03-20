/* AgriVN Global Fulfillment Hub — Logic */
'use strict';

// ============================
// FULFILLMENT CALCULATOR
// ============================
const CHANNELS = {
  amazon: { label: 'Amazon FBA', shipping: 1.8, prep: 0.35, fba: 0.8, commission: 0.15 },
  dtc: { label: 'DTC Shopify', shipping: 2.2, prep: 0.25, fba: 0, commission: 0.03 },
  b2b: { label: 'B2B Bulk Export', shipping: 0.35, prep: 0.10, fba: 0, commission: 0.05 },
};

const WEIGHTS = { '250g': 0.25, '500g': 0.5, '1kg': 1, '5kg': 5, '10kg': 10 };

function calcFulfillment() {
  const channel = document.getElementById('fcChannel')?.value;
  const units = Number(document.getElementById('fcUnits')?.value) || 0;
  const weightKey = document.getElementById('fcWeight')?.value;
  const farmPrice = Number(document.getElementById('fcFarmPrice')?.value) || 0;
  const retailPrice = Number(document.getElementById('fcRetail')?.value) || 0;

  const ch = CHANNELS[channel];
  if (!ch || !units || !farmPrice) return;

  const weight = WEIGHTS[weightKey] || 1;
  const totalCost = (farmPrice + ch.shipping * weight + ch.prep) * units;
  const revenue = retailPrice * units;
  const fees = revenue * ch.commission;
  const fbaFees = ch.fba * units;
  const profit = revenue - totalCost - fees - fbaFees;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('rChannel', ch.label);
  set('rUnits', units.toLocaleString() + ' units');
  set('rFarmCost', '$' + totalCost.toLocaleString('en', {maximumFractionDigits: 0}));
  set('rRevenue', '$' + revenue.toLocaleString('en', {maximumFractionDigits: 0}));
  set('rFees', '$' + (fees + fbaFees).toLocaleString('en', {maximumFractionDigits: 0}));
  set('rProfit', profit > 0 ? '$' + profit.toLocaleString('en', {maximumFractionDigits: 0}) : 'Loss');
  set('rMargin', margin + '%');

  const profitEl = document.getElementById('rProfit');
  if (profitEl) profitEl.style.color = profit > 0 ? 'var(--brand-green-light)' : '#e85555';
}

document.getElementById('calcForm')?.addEventListener('submit', e => { e.preventDefault(); calcFulfillment(); });
['fcChannel','fcUnits','fcWeight','fcFarmPrice','fcRetail'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', calcFulfillment);
  document.getElementById(id)?.addEventListener('input', calcFulfillment);
});

// ============================
// CHANNEL CTA
// ============================
document.querySelectorAll('.channel-cta').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = document.getElementById('onboardSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================
// ONBOARDING FORM
// ============================
document.getElementById('onboardForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('obName')?.value?.trim();
  const email = document.getElementById('obEmail')?.value?.trim();
  if (!name || !email) { showToast('Please fill in required fields', 'error'); return; }
  const btn = document.getElementById('obSubmit');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  setTimeout(() => {
    showToast(`Welcome ${name}! Your fulfillment setup request is received. Our team will contact you within 24h.`);
    btn.textContent = '✓ Application Sent!';
    btn.style.background = 'linear-gradient(135deg,#1a5c37,#22a463)';
    setTimeout(() => {
      btn.textContent = 'Start My Fulfillment Journey';
      btn.style.background = '';
      btn.disabled = false;
      e.target.reset();
    }, 3000);
  }, 1400);
});

// ============================
// SCROLL REVEAL
// ============================
document.querySelectorAll('.channel-card, .pipe-step, .calc-card, .result-card, .trust-card, .onboard-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = `opacity 0.5s ${i * 0.05}s, transform 0.5s ${i * 0.05}s`;
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); }
  }, { threshold: 0.08 });
  obs.observe(el);
});

// ============================
// TOAST
// ============================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.style.cssText = `background:#111d15;border:1px solid ${type==='error'?'rgba(232,85,85,0.4)':'rgba(34,164,99,0.4)'};border-radius:10px;padding:12px 20px;font-size:0.85rem;color:#f0f7f2;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:toastIn 0.3s ease;min-width:280px;`;
  toast.innerHTML = `<span>${type==='error'?'❌':'✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(20px)'; toast.style.transition='all 0.3s'; setTimeout(()=>toast.remove(),300); }, 4500);
}

// Init calc
calcFulfillment();

console.log('%c🌍 AgriVN Global Fulfillment loaded', 'color:#7c5cbf;font-size:13px;font-weight:bold;');
