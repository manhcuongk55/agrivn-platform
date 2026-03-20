/* AgriVN Trade Finance — Interactive Logic */
'use strict';

// ============================
// CALCULATOR
// ============================
const calcForm = document.getElementById('calcForm');
const resultAmount = document.getElementById('resultAmount');
const resultTerm = document.getElementById('resultTerm');
const resultRate = document.getElementById('resultRate');
const resultMonthly = document.getElementById('resultMonthly');
const resultTotal = document.getElementById('resultTotal');
const resultFee = document.getElementById('resultFee');

function formatUSD(num) {
  return '$' + Number(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calculate() {
  const amount = Number(document.getElementById('calcAmount').value) || 0;
  const term = Number(document.getElementById('calcTerm').value) || 6;
  const product = document.getElementById('calcProduct').value;

  // Interest rates based on product
  const rates = {
    'pre-shipment': 8.5,
    'invoice-factoring': 6.2,
    'lc': 3.8,
  };
  const rate = rates[product] || 8.5;
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  const totalRepay = monthlyPayment * term;
  const totalInterest = totalRepay - amount;

  resultAmount.textContent = formatUSD(amount);
  resultTerm.textContent = term + ' months';
  resultRate.textContent = rate + '% APR';
  resultMonthly.textContent = amount > 0 ? formatUSD(Math.round(monthlyPayment)) : '—';
  resultTotal.textContent = amount > 0 ? formatUSD(Math.round(totalRepay)) : '—';
  resultFee.textContent = amount > 0 ? formatUSD(Math.round(totalInterest)) : '—';
}

if (calcForm) {
  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });
  // Live update
  ['calcAmount', 'calcTerm', 'calcProduct'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calculate);
    document.getElementById(id)?.addEventListener('change', calculate);
  });
}

// ============================
// APPLICATION FORM
// ============================
const applyForm = document.getElementById('applyForm');

if (applyForm) {
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const companyName = document.getElementById('appCompany').value.trim();
    const email = document.getElementById('appEmail').value.trim();

    if (!companyName || !email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const btn = applyForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    setTimeout(() => {
      btn.textContent = '✓ Application Submitted!';
      btn.style.background = 'linear-gradient(135deg, #1a5c37, #22a463)';
      showToast(`Application received for ${companyName}! Our team will contact you within 24 hours.`);
      setTimeout(() => {
        btn.textContent = 'Submit Application';
        btn.style.background = '';
        btn.disabled = false;
        applyForm.reset();
      }, 3000);
    }, 1500);
  });
}

// ============================
// PRODUCT CTA
// ============================
document.querySelectorAll('.product-cta').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = document.getElementById('applySection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================
// TOAST
// ============================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #111d15; border: 1px solid ${type === 'error' ? 'rgba(232,85,85,0.4)' : 'rgba(34,164,99,0.4)'};
    border-radius: 10px; padding: 12px 20px; font-size: 0.85rem;
    color: #f0f7f2; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); animation: toastIn 0.3s ease;
    min-width: 280px;
  `;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================
// SCROLL REVEAL
// ============================
document.querySelectorAll('.product-card, .calc-form-card, .calc-result-card, .apply-card, .fin-kpi-card').forEach((el, i) => {
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
    animateCounter(document.getElementById('kpiDeployed'), 340, 'M', '$');
    animateCounter(document.getElementById('kpiClients'), 680, '+');
    animateCounter(document.getElementById('kpiApproval'), 94, '%');
    animateCounter(document.getElementById('kpiAvgDays'), 3, ' days');
  }
}, { threshold: 0.3 });
const kpiStrip = document.querySelector('.fin-kpi-strip');
if (kpiStrip) kpiObs.observe(kpiStrip);

// Init calculator with default values
calculate();

console.log('%c🌿 AgriVN Trade Finance loaded', 'color:#e8a020;font-size:13px;font-weight:bold;');
