/* AgriVN Farmer Trust Profile — Logic */
'use strict';

// Price calculator
const qtyInput = document.getElementById('orderQty');
const productSelect = document.getElementById('orderProduct');
const totalEl = document.getElementById('orderTotal');

const PRICES = {
  'robusta': { label: 'Robusta G1', price: 2.8, unit: 'kg' },
  'arabica': { label: 'Arabica SL28', price: 6.5, unit: 'kg' },
  'cherry': { label: 'Coffee Cherry', price: 1.2, unit: 'kg' },
};

function updateTotal() {
  if (!qtyInput || !productSelect || !totalEl) return;
  const product = PRICES[productSelect.value] || { price: 2.8 };
  const qty = parseFloat(qtyInput.value) || 0;
  const total = (qty * 1000 * product.price).toFixed(0); // qty in MT → kg
  totalEl.textContent = qty > 0 ? `$${Number(total).toLocaleString()}` : '—';
}

qtyInput?.addEventListener('input', updateTotal);
productSelect?.addEventListener('change', updateTotal);

// Order button
document.getElementById('btnOrderMain')?.addEventListener('click', () => {
  const qty = qtyInput?.value;
  const product = productSelect?.options[productSelect?.selectedIndex]?.text;
  const dest = document.getElementById('orderDest')?.value;
  if (!qty || qty <= 0) { showToast('Please enter a quantity', 'error'); return; }
  const btn = document.getElementById('btnOrderMain');
  btn.textContent = 'Processing...';
  btn.disabled = true;
  setTimeout(() => {
    showToast(`✅ Order request sent! ${qty} MT of ${product} → ${dest}. Our team will confirm within 4 hours.`);
    btn.textContent = '✓ Order Sent!';
    btn.style.background = 'linear-gradient(135deg,#1a5c37,#22a463)';
    setTimeout(() => {
      btn.textContent = 'Order Direct from Farm';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1400);
});

// Inquire button
document.getElementById('btnInquire')?.addEventListener('click', () => {
  showToast('Inquiry sent! Our sourcing specialist will contact you within 2 hours.');
});

// Produce order buttons
document.querySelectorAll('.p-order').forEach(btn => {
  btn.addEventListener('click', () => {
    const product = btn.dataset.product;
    showToast(`Sample request for ${product} submitted! You'll receive a quote within 24 hours.`);
    btn.textContent = '✓ Requested';
    btn.style.background = '#1a5c37';
    setTimeout(() => { btn.textContent = 'Order'; btn.style.background = ''; }, 2500);
  });
});

// ============================
// TRUST SCORE ANIMATION
// ============================
let scoreAnimated = false;
const scoreObs = new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !scoreAnimated) {
    scoreAnimated = true;
    animateNum(document.getElementById('statYield'), 240, ' MT');
    animateNum(document.getElementById('statYears'), 12, ' yrs');
    animateNum(document.getElementById('statBuyers'), 38, '+');
    animateNum(document.getElementById('statRating'), 4.9, '', 1);
  }
}, { threshold: 0.3 });
const statsRow = document.querySelector('.stats-row');
if (statsRow) scoreObs.observe(statsRow);

function animateNum(el, target, suffix = '', decimals = 0) {
  if (!el) return;
  let val = 0;
  const step = target / 60;
  const t = setInterval(() => {
    val += step;
    if (val >= target) { val = target; clearInterval(t); }
    el.textContent = val.toFixed(decimals) + suffix;
  }, 16);
}

// ============================
// SCROLL REVEAL
// ============================
document.querySelectorAll('.section-card, .action-card, .stat-card, .cert-item, .feed-item').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
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
  setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(20px)'; toast.style.transition='all 0.3s'; setTimeout(()=>toast.remove(),300); }, 4000);
}

console.log('%c🌿 FarmerOS Profile loaded', 'color:#22a463;font-size:13px;font-weight:bold;');
