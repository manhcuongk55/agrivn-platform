/* ===================================
   AgriVN ERP — Dashboard Controller
   
   Uses ERPNext API client (erpnext-api.js)
   All 5 tabs: Dashboard, Sales Orders, Purchase Orders, Inventory, Finance
   Full CRUD on Sales Orders & Purchase Orders
=================================== */
'use strict';

const erp = window.erpnext;

// ============================================================
// STATE
// ============================================================
const ERP_STATE = {
  activeTab: 'dashboard',
  dashStats: null,
  salesOrders: [],
  purchaseOrders: [],
  stock: [],
  invoices: [],
  items: [],   // For dropdowns
};

// ============================================================
// DOM CACHE
// ============================================================
const $ = id => document.getElementById(id);

// ============================================================
// TOAST (reuse from admin.css)
// ============================================================
function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||''}</span><span>${msg}</span>`;
  $('toastContainer').appendChild(el);
  setTimeout(() => { el.classList.add('toast-exit'); setTimeout(() => el.remove(), 300); }, 3000);
}

// ============================================================
// TAB SWITCHING
// ============================================================
document.querySelectorAll('.enav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.enav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const name = tab.dataset.tab;
    ERP_STATE.activeTab = name;
    document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
    const panelMap = { dashboard: 'panelDashboard', sales: 'panelSales', purchase: 'panelPurchase', inventory: 'panelInventory', finance: 'panelFinance' };
    $(panelMap[name])?.classList.add('active');
    loadTabData(name);
  });
});

// ============================================================
// DATA LOADING
// ============================================================
async function loadTabData(tab) {
  switch (tab) {
    case 'dashboard': await loadDashboard(); break;
    case 'sales': await loadSalesOrders(); break;
    case 'purchase': await loadPurchaseOrders(); break;
    case 'inventory': await loadInventory(); break;
    case 'finance': await loadFinance(); break;
  }
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
  $('dashDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  try {
    const stats = await erp.getDashboardStats();
    ERP_STATE.dashStats = stats;
    $('kpiItems').textContent = stats.totalItems;
    $('kpiSO').textContent = stats.totalSalesOrders;
    $('kpiSOValue').textContent = '$' + stats.salesOrderValue.toLocaleString();
    $('kpiPO').textContent = stats.totalPurchaseOrders;
    $('kpiPOValue').textContent = '$' + stats.purchaseOrderValue.toLocaleString();
    $('kpiAR').textContent = '$' + stats.outstandingReceivable.toLocaleString();
    $('kpiPending').textContent = stats.pendingSO;
  } catch (err) {
    toast('Failed to load dashboard: ' + err.message, 'error');
  }

  // Load recent SO
  try {
    const so = await erp.getSalesOrders();
    ERP_STATE.salesOrders = so;
    $('dashSOTable').innerHTML = so.length ? `
      <table class="data-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${so.slice(0, 5).map(o => `
          <tr>
            <td style="font-weight:600">${esc(o.id || o.name)}</td>
            <td>${esc(o.customer || o.customer_name)}</td>
            <td class="cell-price">$${(o.total || o.grand_total || 0).toLocaleString()}</td>
            <td>${statusBadge(o.status)}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    ` : '<div style="padding:32px;text-align:center;color:var(--text-muted)">No sales orders yet</div>';
  } catch (_) {}

  // Load recent PO
  try {
    const po = await erp.getPurchaseOrders();
    ERP_STATE.purchaseOrders = po;
    $('dashPOTable').innerHTML = po.length ? `
      <table class="data-table">
        <thead><tr><th>PO</th><th>Supplier</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${po.slice(0, 5).map(o => `
          <tr>
            <td style="font-weight:600">${esc(o.id || o.name)}</td>
            <td>${esc(o.supplier || o.supplier_name)}</td>
            <td class="cell-price">$${(o.total || o.grand_total || 0).toLocaleString()}</td>
            <td>${statusBadge(o.status)}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    ` : '<div style="padding:32px;text-align:center;color:var(--text-muted)">No purchase orders yet</div>';
  } catch (_) {}
}

// ============================================================
// SALES ORDERS — Full CRUD
// ============================================================
async function loadSalesOrders() {
  try {
    // READ: fetch → state → render
    const data = await erp.getSalesOrders();
    ERP_STATE.salesOrders = data;
    renderSalesOrders();
  } catch (err) {
    toast('Failed to load sales orders', 'error');
  }
}

function renderSalesOrders() {
  const so = ERP_STATE.salesOrders;
  $('soTableBody').innerHTML = so.map(o => `
    <tr>
      <td style="font-weight:700">${esc(o.id || o.name)}</td>
      <td>${esc(o.customer || o.customer_name)}</td>
      <td>${o.date || o.transaction_date || '—'}</td>
      <td class="cell-price">$${(o.total || o.grand_total || 0).toLocaleString()}</td>
      <td>${o.deliveryDate || o.delivery_date || '—'}</td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <div class="cell-actions">
          ${o.status === 'Draft' ? `<button class="so-action-btn" onclick="confirmSO('${o.id || o.name}')">✓ Confirm</button>` : ''}
          ${o.status === 'Confirmed' ? `<button class="so-action-btn" onclick="shipSO('${o.id || o.name}')">🚢 Ship</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// CREATE Sales Order
$('btnNewSO')?.addEventListener('click', async () => {
  // Load items for dropdown
  if (!ERP_STATE.items.length) {
    ERP_STATE.items = await erp.getItems();
  }
  $('soItemSelect').innerHTML = '<option value="">Select product...</option>' +
    ERP_STATE.items.map(i => `<option value="${i.id}" data-price="${i.price}">${i.name} ($${i.price}/MT)</option>`).join('');
  $('soDate').value = new Date().toISOString().split('T')[0];
  $('soFormOverlay').classList.add('open');
});

$('soForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const customer = $('soCustomer').value.trim();
  const itemCode = $('soItemSelect').value;
  const qty = Number($('soItemQty').value);
  const rate = Number($('soItemRate').value);
  if (!customer || !itemCode || !qty || !rate) { toast('Fill all required fields', 'error'); return; }
  const itemName = $('soItemSelect').options[$('soItemSelect').selectedIndex].text.split(' ($')[0];
  try {
    // CREATE: submit → API → state → re-render
    const created = await erp.createSalesOrder({
      customer,
      date: $('soDate').value,
      deliveryDate: $('soDelivery').value,
      items: [{ itemCode, name: itemName, qty, rate }],
    });
    ERP_STATE.salesOrders.push(created);
    renderSalesOrders();
    $('soFormOverlay').classList.remove('open');
    $('soForm').reset();
    toast(`Sales Order created for ${customer}`);
    loadDashboard(); // refresh KPIs
  } catch (err) {
    toast('Failed to create SO: ' + err.message, 'error');
  }
});

// UPDATE Sales Order status
window.confirmSO = async (id) => {
  try {
    await erp.updateSalesOrderStatus(id, 'Confirmed');
    const idx = ERP_STATE.salesOrders.findIndex(o => (o.id || o.name) === id);
    if (idx !== -1) ERP_STATE.salesOrders[idx].status = 'Confirmed';
    renderSalesOrders();
    toast(`Order ${id} confirmed`);
  } catch (err) { toast('Failed: ' + err.message, 'error'); }
};

window.shipSO = async (id) => {
  try {
    await erp.updateSalesOrderStatus(id, 'Shipped');
    const idx = ERP_STATE.salesOrders.findIndex(o => (o.id || o.name) === id);
    if (idx !== -1) ERP_STATE.salesOrders[idx].status = 'Shipped';
    renderSalesOrders();
    toast(`Order ${id} shipped 🚢`);
  } catch (err) { toast('Failed: ' + err.message, 'error'); }
};

$('soFormClose')?.addEventListener('click', () => $('soFormOverlay').classList.remove('open'));
$('soFormCancel')?.addEventListener('click', () => $('soFormOverlay').classList.remove('open'));

// Item select auto-fill rate
$('soItemSelect')?.addEventListener('change', (e) => {
  const opt = e.target.selectedOptions[0];
  if (opt?.dataset.price) $('soItemRate').value = opt.dataset.price;
});

// ============================================================
// PURCHASE ORDERS — Full CRUD
// ============================================================
async function loadPurchaseOrders() {
  try {
    const data = await erp.getPurchaseOrders();
    ERP_STATE.purchaseOrders = data;
    renderPurchaseOrders();
  } catch (err) {
    toast('Failed to load purchase orders', 'error');
  }
}

function renderPurchaseOrders() {
  const po = ERP_STATE.purchaseOrders;
  $('poTableBody').innerHTML = po.map(o => `
    <tr>
      <td style="font-weight:700">${esc(o.id || o.name)}</td>
      <td>${esc(o.supplier || o.supplier_name)}</td>
      <td>${o.date || o.transaction_date || '—'}</td>
      <td class="cell-price">$${(o.total || o.grand_total || 0).toLocaleString()}</td>
      <td>${esc(o.farmRegion || o.custom_farm_region || '—')}</td>
      <td>${esc(o.qualityGrade || o.custom_quality_grade || '—')}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>
  `).join('');
}

$('btnNewPO')?.addEventListener('click', async () => {
  if (!ERP_STATE.items.length) ERP_STATE.items = await erp.getItems();
  $('poItemSelect').innerHTML = '<option value="">Select product...</option>' +
    ERP_STATE.items.map(i => `<option value="${i.id}" data-price="${i.price}">${i.name} ($${i.price}/MT)</option>`).join('');
  $('poDate').value = new Date().toISOString().split('T')[0];
  $('poFormOverlay').classList.add('open');
});

$('poForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const supplier = $('poSupplier').value.trim();
  const itemCode = $('poItemSelect').value;
  const qty = Number($('poItemQty').value);
  const rate = Number($('poItemRate').value);
  if (!supplier || !itemCode || !qty || !rate) { toast('Fill all required fields', 'error'); return; }
  const itemName = $('poItemSelect').options[$('poItemSelect').selectedIndex].text.split(' ($')[0];
  try {
    const created = await erp.createPurchaseOrder({
      supplier,
      date: $('poDate').value,
      scheduleDate: $('poSchedule').value,
      farmRegion: $('poRegion').value,
      qualityGrade: $('poGrade').value,
      items: [{ itemCode, name: itemName, qty, rate }],
    });
    ERP_STATE.purchaseOrders.push(created);
    renderPurchaseOrders();
    $('poFormOverlay').classList.remove('open');
    $('poForm').reset();
    toast(`Purchase Order created for ${supplier}`);
    loadDashboard();
  } catch (err) {
    toast('Failed to create PO: ' + err.message, 'error');
  }
});

$('poFormClose')?.addEventListener('click', () => $('poFormOverlay').classList.remove('open'));
$('poFormCancel')?.addEventListener('click', () => $('poFormOverlay').classList.remove('open'));
$('poItemSelect')?.addEventListener('change', (e) => {
  const opt = e.target.selectedOptions[0];
  if (opt?.dataset.price) $('poItemRate').value = opt.dataset.price;
});

// ============================================================
// INVENTORY
// ============================================================
async function loadInventory() {
  try {
    const stock = await erp.getStockBalance();
    ERP_STATE.stock = stock;
    const maxQty = Math.max(...stock.map(s => s.actual_qty || 0), 1);
    $('stockTableBody').innerHTML = stock.map(s => {
      const qty = s.actual_qty || 0;
      const pct = Math.round((qty / maxQty) * 100);
      const level = pct > 50 ? 'high' : pct > 20 ? 'medium' : 'low';
      return `
        <tr>
          <td style="font-weight:600">${esc(s.item_code)}</td>
          <td>${esc(s.item_name || s.item_code)}</td>
          <td>${esc(s.warehouse || 'Main')}</td>
          <td>
            <div class="stock-bar-wrap">
              <div style="font-weight:700;margin-bottom:4px">${qty.toLocaleString()} MT</div>
              <div class="stock-bar"><div class="stock-fill ${level}" style="width:${pct}%"></div></div>
            </div>
          </td>
          <td>${statusBadge(level === 'low' ? 'Low Stock' : level === 'medium' ? 'Medium' : 'In Stock')}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    toast('Failed to load inventory', 'error');
  }
}

// ============================================================
// FINANCE
// ============================================================
async function loadFinance() {
  try {
    const invoices = await erp.getSalesInvoices();
    ERP_STATE.invoices = invoices;
    const totalInv = invoices.reduce((s, i) => s + (i.total || i.grand_total || 0), 0);
    const totalOut = invoices.reduce((s, i) => s + (i.outstanding || i.outstanding_amount || 0), 0);
    const totalPaid = totalInv - totalOut;
    $('finTotal').textContent = '$' + totalInv.toLocaleString();
    $('finPaid').textContent = '$' + totalPaid.toLocaleString();
    $('finOutstanding').textContent = '$' + totalOut.toLocaleString();
    $('invoiceTableBody').innerHTML = invoices.map(i => `
      <tr>
        <td style="font-weight:600">${esc(i.id || i.name)}</td>
        <td>${esc(i.customer || i.customer_name)}</td>
        <td>${i.date || i.posting_date || '—'}</td>
        <td class="cell-price">$${(i.total || i.grand_total || 0).toLocaleString()}</td>
        <td style="color:${(i.outstanding || i.outstanding_amount || 0) > 0 ? 'var(--danger)' : 'var(--brand-green-light)'}">
          $${(i.outstanding || i.outstanding_amount || 0).toLocaleString()}
        </td>
        <td>${statusBadge(i.status)}</td>
      </tr>
    `).join('');
  } catch (err) {
    toast('Failed to load finance data', 'error');
  }
}

// ============================================================
// HELPERS
// ============================================================
function statusBadge(status) {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-');
  const classMap = {
    'draft': 'status-draft', 'confirmed': 'status-confirmed',
    'shipped': 'status-shipped', 'received': 'status-received',
    'ordered': 'status-ordered', 'paid': 'status-paid',
    'unpaid': 'status-unpaid', 'cancelled': 'status-cancelled',
    'in-stock': 'status-confirmed', 'medium': 'status-ordered',
    'low-stock': 'status-unpaid',
  };
  return `<span class="status-badge ${classMap[s] || 'status-draft'}">${status}</span>`;
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// ERPNext CONNECTION
// ============================================================
$('erpConnectBtn')?.addEventListener('click', () => {
  $('connectOverlay').classList.add('open');
});
$('connectClose')?.addEventListener('click', () => $('connectOverlay').classList.remove('open'));
$('connectCancel')?.addEventListener('click', () => {
  $('connectOverlay').classList.remove('open');
  toast('Running in Offline mode — all features functional', 'warning');
});

$('connectForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = $('erpUrl').value.trim();
  const user = $('erpUser').value.trim();
  const pass = $('erpPass').value;
  if (!url) { toast('Enter ERPNext URL', 'error'); return; }
  erp.baseUrl = url.replace(/\/$/, '');
  const result = await erp.login(user, pass);
  if (result.success) {
    $('connectOverlay').classList.remove('open');
    updateConnectionUI(true);
    toast('Connected to ERPNext! 🎉');
    loadDashboard();
  } else {
    toast('Connection failed: ' + result.error, 'error');
  }
});

function updateConnectionUI(connected) {
  const dot = document.querySelector('.erp-dot');
  const text = document.querySelector('.erp-conn-text');
  if (connected) {
    dot.className = 'erp-dot online';
    text.textContent = 'Connected';
  } else {
    dot.className = 'erp-dot offline';
    text.textContent = 'Offline Mode';
  }
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('soFormOverlay')?.classList.remove('open');
    $('poFormOverlay')?.classList.remove('open');
    $('connectOverlay')?.classList.remove('open');
  }
});

// Close modals on overlay click
['soFormOverlay', 'poFormOverlay', 'connectOverlay'].forEach(id => {
  $(id)?.addEventListener('click', (e) => {
    if (e.target.id === id) $(id).classList.remove('open');
  });
});

// ============================================================
// INIT
// ============================================================
(async function init() {
  updateConnectionUI(erp.isConnected);
  await loadDashboard();
})();

console.log('%c🌿 AgriVN ERP Dashboard loaded — Powered by ERPNext', 'color:#22a463;font-size:13px;font-weight:bold;');
