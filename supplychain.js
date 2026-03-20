/* AgriVN Supply Chain Connect — Logic */
'use strict';

// ============================
// MATCHING DATA
// ============================
const FACTORIES = [
  {
    name: 'Đắk Lắk Coffee Processing',
    loc: 'Buôn Ma Thuột, Đắk Lắk',
    type: 'Xưởng chế biến cà phê',
    icon: '☕',
    caps: ['Sấy khô', 'Rang xay', 'Đóng gói xuất khẩu', 'Phân loại hạt'],
    capacity: '500 MT/tháng',
    workers: 120,
    certs: ['ISO 22000', 'HACCP'],
    matching: ['Robusta', 'Arabica', 'Cà phê'],
    score: 96,
  },
  {
    name: 'Mekong Fruit Factory',
    loc: 'Tiền Giang, Mekong Delta',
    type: 'Xưởng sơ chế trái cây',
    icon: '🍈',
    caps: ['IQF Freezing', 'Puree', 'Sấy dẻo', 'Đóng gói vacuum'],
    capacity: '300 MT/tháng',
    workers: 85,
    certs: ['GlobalG.A.P', 'BRC'],
    matching: ['Sầu riêng', 'Xoài', 'Thanh long', 'Trái cây'],
    score: 92,
  },
  {
    name: 'An Giang Rice Mill',
    loc: 'Long Xuyên, An Giang',
    type: 'Nhà máy xay xát gạo',
    icon: '🌾',
    caps: ['Xay xát', 'Đánh bóng', 'Phân loại', 'Đóng bao 50kg'],
    capacity: '2,000 MT/tháng',
    workers: 200,
    certs: ['ISO 9001', 'USDA Organic'],
    matching: ['Gạo', 'Jasmine', 'ST25', 'Nếp'],
    score: 94,
  },
  {
    name: 'Bình Phước Cashew Plant',
    loc: 'Đồng Xoài, Bình Phước',
    type: 'Nhà máy chế biến hạt điều',
    icon: '🫘',
    caps: ['Bóc vỏ', 'Sấy', 'Phân loại W240/W320', 'Vacuum đóng gói'],
    capacity: '400 MT/tháng',
    workers: 180,
    certs: ['FSSC 22000', 'BRC'],
    matching: ['Điều', 'Hạt điều', 'Cashew'],
    score: 91,
  },
  {
    name: 'Gia Lai Pepper Factory',
    loc: 'Pleiku, Gia Lai',
    type: 'Xưởng chế biến hồ tiêu',
    icon: '🌶️',
    caps: ['Phơi sấy', 'Phân loại', 'Bột tiêu', 'Đóng gói'],
    capacity: '150 MT/tháng',
    workers: 60,
    certs: ['ISO 22000'],
    matching: ['Tiêu đen', 'Tiêu trắng', 'Pepper', 'Hồ tiêu'],
    score: 88,
  },
  {
    name: 'Đồng Tháp Dragon Fruit Hub',
    loc: 'Cao Lãnh, Đồng Tháp',
    type: 'Trung tâm sơ chế thanh long',
    icon: '🐉',
    caps: ['Sơ chế', 'Chiếu xạ', 'Đóng thùng carton', 'Cold storage'],
    capacity: '250 MT/tháng',
    workers: 70,
    certs: ['VietGAP', 'GlobalG.A.P'],
    matching: ['Thanh long', 'Dragon fruit'],
    score: 89,
  },
];

// ============================
// MATCHING LOGIC
// ============================
const matchForm = document.getElementById('matchForm');
const matchResult = document.getElementById('matchResult');
const matchList = document.getElementById('matchList');

function findMatches(material, region, volume) {
  const matLower = material.toLowerCase();
  return FACTORIES
    .map(f => {
      let score = f.score;
      // Material match boost
      const materialMatch = f.matching.some(m => matLower.includes(m.toLowerCase()) || m.toLowerCase().includes(matLower));
      if (materialMatch) score += 4;
      // Region proximity boost
      if (region && f.loc.toLowerCase().includes(region.toLowerCase())) score += 3;
      return { ...f, finalScore: Math.min(score, 99) };
    })
    .filter(f => f.finalScore > 85)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 4);
}

if (matchForm) {
  matchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const material = document.getElementById('matchMaterial').value;
    const region = document.getElementById('matchRegion').value;
    const volume = document.getElementById('matchVolume').value;

    if (!material) {
      showToast('Vui lòng chọn loại nguyên liệu', 'error');
      return;
    }

    const btn = matchForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Đang tìm kiếm...';

    setTimeout(() => {
      const matches = findMatches(material, region, volume);
      renderMatches(matches, material);
      btn.textContent = '🔍 Tìm xưởng gia công';
      btn.disabled = false;
    }, 1200);
  });
}

function renderMatches(matches, material) {
  if (matches.length === 0) {
    matchList.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted)">Không tìm thấy xưởng phù hợp. Vui lòng thử nguyên liệu khác.</div>';
  } else {
    matchList.innerHTML = matches.map(f => `
      <div class="match-item">
        <div class="match-item-icon">${f.icon}</div>
        <div class="match-item-info">
          <div class="match-item-name">${f.name}</div>
          <div class="match-item-detail">📍 ${f.loc} — ${f.type}</div>
          <div class="match-item-tags">
            ${f.caps.slice(0, 3).map(c => `<span class="match-item-tag">${c}</span>`).join('')}
            <span class="match-item-tag">⚡ ${f.capacity}</span>
          </div>
        </div>
        <div class="match-item-right">
          <div class="match-item-score">${f.finalScore}%</div>
          <div class="match-item-score-label">Match</div>
          <button class="match-item-btn" data-name="${f.name}">Kết nối →</button>
        </div>
      </div>
    `).join('');
  }
  matchResult.classList.add('show');
  matchResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Wire connect buttons
  matchList.querySelectorAll('.match-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓ Đã gửi!';
      btn.style.background = '#22a463';
      showToast(`Yêu cầu kết nối với ${btn.dataset.name} đã được gửi! Đội ngũ AgriVN sẽ liên hệ trong 24h.`);
    });
  });
}

// ============================
// FARMER/FACTORY CARD CTAs
// ============================
document.querySelectorAll('.farmer-cta, .factory-cta').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = document.getElementById('matchSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================
// TOAST
// ============================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌' };
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
    toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================
// SCROLL REVEAL
// ============================
document.querySelectorAll('.flow-node, .farmer-card, .factory-card, .match-card, .rev-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ${i * 0.06}s, transform 0.5s ${i * 0.06}s`;
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); }
  }, { threshold: 0.1 });
  obs.observe(el);
});

console.log('%c🌿 AgriVN Supply Chain Connect loaded', 'color:#e87830;font-size:13px;font-weight:bold;');
