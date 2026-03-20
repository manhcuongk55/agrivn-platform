/* AgriVN Pricing — Interactive Logic */
'use strict';

// ============================
// PRICING DATA
// ============================
const PLANS = {
  free: {
    monthly: 0,
    yearly: 0,
    name: 'Starter',
    icon: '🌱',
    desc: 'Perfect for exploring the marketplace',
  },
  pro: {
    monthly: 299,
    yearly: 239,
    name: 'Professional',
    icon: '🚀',
    desc: 'For active importers & export agents',
  },
  enterprise: {
    monthly: 999,
    yearly: 799,
    name: 'Enterprise',
    icon: '🏢',
    desc: 'Full-stack trade infrastructure',
  }
};

let isYearly = false;

// ============================
// TOGGLE
// ============================
const toggleTrack = document.getElementById('toggleTrack');
const labelMonthly = document.getElementById('labelMonthly');
const labelYearly = document.getElementById('labelYearly');

function updatePricing() {
  // Update toggle UI
  toggleTrack.classList.toggle('yearly', isYearly);
  labelMonthly.classList.toggle('active', !isYearly);
  labelYearly.classList.toggle('active', isYearly);

  // Update price displays
  const proPriceEl = document.getElementById('proPrice');
  const entPriceEl = document.getElementById('entPrice');
  const proNoteEl = document.getElementById('proNote');
  const entNoteEl = document.getElementById('entNote');

  if (isYearly) {
    proPriceEl.innerHTML = `<span class="currency">$</span>${PLANS.pro.yearly}<span class="period">/mo</span>`;
    entPriceEl.innerHTML = `<span class="currency">$</span>${PLANS.enterprise.yearly}<span class="period">/mo</span>`;
    proNoteEl.textContent = `$${PLANS.pro.yearly * 12}/year — Save $${(PLANS.pro.monthly - PLANS.pro.yearly) * 12}/yr`;
    entNoteEl.textContent = `$${PLANS.enterprise.yearly * 12}/year — Save $${(PLANS.enterprise.monthly - PLANS.enterprise.yearly) * 12}/yr`;
  } else {
    proPriceEl.innerHTML = `<span class="currency">$</span>${PLANS.pro.monthly}<span class="period">/mo</span>`;
    entPriceEl.innerHTML = `<span class="currency">$</span>${PLANS.enterprise.monthly}<span class="period">/mo</span>`;
    proNoteEl.textContent = 'Billed monthly, cancel anytime';
    entNoteEl.textContent = 'Billed monthly, custom invoicing';
  }
}

toggleTrack.addEventListener('click', () => {
  isYearly = !isYearly;
  updatePricing();
});
labelMonthly.addEventListener('click', () => { isYearly = false; updatePricing(); });
labelYearly.addEventListener('click', () => { isYearly = true; updatePricing(); });

// Init
updatePricing();

// ============================
// FAQ ACCORDION
// ============================
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Toggle current
    if (!wasOpen) item.classList.add('open');
  });
});

// ============================
// CTA CLICK HANDLERS
// ============================
document.querySelectorAll('.plan-cta').forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.dataset.plan;
    const text = btn.textContent;
    btn.textContent = '✓ Redirecting...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = text;
      btn.disabled = false;
      // In production: redirect to Stripe/payment page
      const msg = plan === 'free'
        ? 'Welcome! Your free account has been created.'
        : `Redirecting to payment for ${PLANS[plan]?.name || plan} plan...`;
      showToast(msg);
    }, 1500);
  });
});

// ============================
// TOAST
// ============================
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✅</span><span>${message}</span>`;
  toast.style.cssText = `
    background: #111d15; border: 1px solid rgba(34,164,99,0.4);
    border-radius: 10px; padding: 12px 20px; font-size: 0.85rem;
    color: #f0f7f2; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); animation: toastIn 0.3s ease;
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================
// SCROLL REVEAL
// ============================
document.querySelectorAll('.plan-card, .faq-item, .comp-table-wrap').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ${i * 0.08}s, transform 0.5s ${i * 0.08}s`;
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(el);
});

console.log('%c🌿 AgriVN Pricing loaded', 'color:#22a463;font-size:13px;font-weight:bold;');
