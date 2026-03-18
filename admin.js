/* ===================================
   AgriVN Trade Desk — CRUD Logic
   
   BLUEPRINT (from user's spec):
   
   CREATE → submit form → call API → update state → re-render
   READ   → fetch API → set state → render UI
   UPDATE → load data into form → edit → call API → update state → re-render
   DELETE → click delete → call API → remove from state → re-render
   
   EVERY step is implemented. No shortcuts.
=================================== */
'use strict';

// ============================================================
// STATE — Single source of truth
// ============================================================
const STATE = {
  listings: [],           // Array of listing objects
  editingId: null,        // ID of record being edited, null = creating
  deleteTargetId: null,   // ID of record pending delete confirmation
  viewTargetId: null,     // ID of record being viewed
  searchQuery: '',
  filterCategory: '',
  isLoading: true,
  nextId: 1,              // Auto-increment ID counter
};

// Category emoji map
const CATEGORY_EMOJI = {
  coffee: '☕', durian: '🍈', rice: '🌾',
  fruit: '🥭', cashew: '🫘', pepper: '🌶️',
};

// ============================================================
// FAKE API — Simulates real API with delay + error handling
// localStorage persistence so data survives page reload
// ============================================================
const API = {
  _key: 'agrivn_listings',

  _delay(ms = 300) {
    return new Promise(r => setTimeout(r, ms + Math.random() * 200));
  },

  async fetchAll() {
    await this._delay(600);
    const raw = localStorage.getItem(this._key);
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed data for first load
    const seed = [
      { id: 1, name: 'Premium Robusta G1', category: 'coffee', region: 'Dak Lak, Vietnam', price: 2340, quantity: 240, minOrder: 5, cert: 'UTZ, Rainforest', seller: 'Dak Lak Coffex' },
      { id: 2, name: 'Monthong Durian IQF', category: 'durian', region: 'Tien Giang, Vietnam', price: 4200, quantity: 80, minOrder: 2, cert: 'GlobalG.A.P', seller: 'Mekong Agri Export' },
      { id: 3, name: 'ST25 Jasmine Rice', category: 'rice', region: 'Soc Trang, Mekong Delta', price: 720, quantity: 1200, minOrder: 20, cert: 'Organic, USDA', seller: 'Delta Rice Corp' },
      { id: 4, name: 'Cat Hoa Loc Mango', category: 'fruit', region: 'Dong Thap, Vietnam', price: 890, quantity: 65, minOrder: 3, cert: 'VietGAP', seller: 'Mekong Fresh' },
    ];
    localStorage.setItem(this._key, JSON.stringify(seed));
    return seed;
  },

  async create(data) {
    await this._delay();
    const listings = JSON.parse(localStorage.getItem(this._key) || '[]');
    const maxId = listings.reduce((max, l) => Math.max(max, l.id), 0);
    const newItem = { ...data, id: maxId + 1 };
    listings.push(newItem);
    localStorage.setItem(this._key, JSON.stringify(listings));
    return newItem; // Return the created item with its new ID
  },

  async update(id, data) {
    await this._delay();
    const listings = JSON.parse(localStorage.getItem(this._key) || '[]');
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Listing #${id} not found`);
    listings[idx] = { ...listings[idx], ...data, id }; // Preserve ID!
    localStorage.setItem(this._key, JSON.stringify(listings));
    return listings[idx]; // Return the updated item
  },

  async delete(id) {
    await this._delay();
    let listings = JSON.parse(localStorage.getItem(this._key) || '[]');
    const idx = listings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Listing #${id} not found`);
    const deleted = listings[idx];
    listings = listings.filter(l => l.id !== id);
    localStorage.setItem(this._key, JSON.stringify(listings));
    return deleted; // Return the deleted item
  },
};

// ============================================================
// DOM REFERENCES
// ============================================================
const DOM = {
  // Form
  formPanel: document.getElementById('formPanel'),
  formTitle: document.getElementById('formTitle'),
  form: document.getElementById('listingForm'),
  editId: document.getElementById('editId'),
  fName: document.getElementById('fName'),
  fCategory: document.getElementById('fCategory'),
  fRegion: document.getElementById('fRegion'),
  fPrice: document.getElementById('fPrice'),
  fQuantity: document.getElementById('fQuantity'),
  fMinOrder: document.getElementById('fMinOrder'),
  fCert: document.getElementById('fCert'),
  fSeller: document.getElementById('fSeller'),
  btnSubmit: document.getElementById('btnSubmit'),
  btnSubmitText: document.querySelector('.btn-submit-text'),
  btnSubmitLoading: document.querySelector('.btn-submit-loading'),
  // Table
  tableLoading: document.getElementById('tableLoading'),
  tableEmpty: document.getElementById('tableEmpty'),
  tableWrap: document.getElementById('tableWrap'),
  tableBody: document.getElementById('tableBody'),
  tableFooter: document.getElementById('tableFooter'),
  tableCount: document.getElementById('tableCount'),
  searchInput: document.getElementById('searchInput'),
  filterCategory: document.getElementById('filterCategory'),
  // Stats
  statTotal: document.getElementById('statTotal'),
  statCoffee: document.getElementById('statCoffee'),
  statDurian: document.getElementById('statDurian'),
  statRice: document.getElementById('statRice'),
  statFruit: document.getElementById('statFruit'),
  // View modal
  viewOverlay: document.getElementById('viewOverlay'),
  viewContent: document.getElementById('viewContent'),
  // Confirm dialog
  confirmOverlay: document.getElementById('confirmOverlay'),
  confirmName: document.getElementById('confirmName'),
  // Toast
  toastContainer: document.getElementById('toastContainer'),
};

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// RENDER — Pure rendering from STATE, no side effects
// ============================================================
function render() {
  renderStats();
  renderTable();
}

function renderStats() {
  const all = STATE.listings;
  DOM.statTotal.textContent = all.length;
  DOM.statCoffee.textContent = all.filter(l => l.category === 'coffee').length;
  DOM.statDurian.textContent = all.filter(l => l.category === 'durian').length;
  DOM.statRice.textContent = all.filter(l => l.category === 'rice').length;
  DOM.statFruit.textContent = all.filter(l => l.category === 'fruit').length;
}

function getFilteredListings() {
  return STATE.listings.filter(l => {
    const matchSearch = STATE.searchQuery === '' ||
      l.name.toLowerCase().includes(STATE.searchQuery) ||
      l.region.toLowerCase().includes(STATE.searchQuery) ||
      l.seller.toLowerCase().includes(STATE.searchQuery) ||
      (l.cert || '').toLowerCase().includes(STATE.searchQuery);
    const matchCategory = STATE.filterCategory === '' || l.category === STATE.filterCategory;
    return matchSearch && matchCategory;
  });
}

function renderTable() {
  const filtered = getFilteredListings();

  // Toggle UI states
  DOM.tableLoading.style.display = STATE.isLoading ? 'flex' : 'none';
  DOM.tableEmpty.style.display = !STATE.isLoading && STATE.listings.length === 0 ? 'block' : 'none';
  DOM.tableWrap.style.display = !STATE.isLoading && STATE.listings.length > 0 ? 'block' : 'none';
  DOM.tableFooter.style.display = !STATE.isLoading && filtered.length > 0 ? 'flex' : 'none';
  DOM.tableCount.textContent = `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`;

  if (STATE.isLoading || STATE.listings.length === 0) return;

  // Build rows
  DOM.tableBody.innerHTML = filtered.map(l => `
    <tr data-id="${l.id}">
      <td class="cell-product">${CATEGORY_EMOJI[l.category] || ''} ${escHtml(l.name)}</td>
      <td><span class="cell-category">${l.category}</span></td>
      <td class="cell-region">${escHtml(l.region)}</td>
      <td class="cell-price">$${l.price.toLocaleString()}/MT</td>
      <td>${l.quantity.toLocaleString()} MT</td>
      <td class="cell-seller">${escHtml(l.seller)}</td>
      <td>
        <div class="cell-actions">
          <button class="act-btn view" title="View" data-action="view" data-id="${l.id}">👁</button>
          <button class="act-btn edit" title="Edit" data-action="edit" data-id="${l.id}">✏️</button>
          <button class="act-btn delete" title="Delete" data-action="delete" data-id="${l.id}">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// READ — fetch API → set state → render UI
// ============================================================
async function loadListings() {
  STATE.isLoading = true;
  render();
  try {
    const data = await API.fetchAll();
    // SET STATE from API response
    STATE.listings = data;
    STATE.nextId = data.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    STATE.isLoading = false;
    // RENDER UI from state
    render();
  } catch (err) {
    STATE.isLoading = false;
    render();
    showToast('Failed to load listings: ' + err.message, 'error');
  }
}

// ============================================================
// FORM — Open / Close / Reset / Populate
// ============================================================
function openFormForCreate() {
  // Reset state
  STATE.editingId = null;
  // Reset form inputs
  DOM.form.reset();
  DOM.editId.value = '';
  // Update UI labels
  DOM.formTitle.textContent = 'Create New Listing';
  DOM.btnSubmitText.textContent = 'Create Listing';
  DOM.btnSubmit.classList.remove('editing');
  // Clear all errors
  clearAllErrors();
  // Show panel
  DOM.formPanel.classList.add('open');
  // Focus first field
  setTimeout(() => DOM.fName.focus(), 100);
}

function openFormForEdit(id) {
  // STEP 1: Find the record in state
  const record = STATE.listings.find(l => l.id === id);
  if (!record) {
    showToast('Listing not found', 'error');
    return;
  }
  // STEP 2: Set editing state
  STATE.editingId = id;
  DOM.editId.value = id;
  // STEP 3: POPULATE form with existing data
  DOM.fName.value = record.name;
  DOM.fCategory.value = record.category;
  DOM.fRegion.value = record.region;
  DOM.fPrice.value = record.price;
  DOM.fQuantity.value = record.quantity;
  DOM.fMinOrder.value = record.minOrder || '';
  DOM.fCert.value = record.cert || '';
  DOM.fSeller.value = record.seller;
  // STEP 4: Update UI labels to "editing" mode
  DOM.formTitle.textContent = `Edit: ${record.name}`;
  DOM.btnSubmitText.textContent = 'Update Listing';
  DOM.btnSubmit.classList.add('editing');
  // Clear errors
  clearAllErrors();
  // Show panel
  DOM.formPanel.classList.add('open');
  // Focus name
  setTimeout(() => DOM.fName.focus(), 100);
}

function closeForm() {
  DOM.formPanel.classList.remove('open');
  // ALWAYS reset state when closing
  STATE.editingId = null;
  DOM.editId.value = '';
  DOM.form.reset();
  clearAllErrors();
  // Reset button labels
  DOM.formTitle.textContent = 'Create New Listing';
  DOM.btnSubmitText.textContent = 'Create Listing';
  DOM.btnSubmit.classList.remove('editing');
}

// ============================================================
// VALIDATION
// ============================================================
function validate() {
  clearAllErrors();
  let valid = true;
  if (!DOM.fName.value.trim()) { setError('fName', 'errName', 'Product name is required'); valid = false; }
  if (!DOM.fCategory.value) { setError('fCategory', 'errCategory', 'Select a category'); valid = false; }
  if (!DOM.fRegion.value.trim()) { setError('fRegion', 'errRegion', 'Region is required'); valid = false; }
  if (!DOM.fPrice.value || Number(DOM.fPrice.value) <= 0) { setError('fPrice', 'errPrice', 'Valid price required'); valid = false; }
  if (!DOM.fQuantity.value || Number(DOM.fQuantity.value) <= 0) { setError('fQuantity', 'errQuantity', 'Valid quantity required'); valid = false; }
  if (!DOM.fSeller.value.trim()) { setError('fSeller', 'errSeller', 'Seller name is required'); valid = false; }
  return valid;
}

function setError(fieldId, errorId, msg) {
  document.getElementById(fieldId).classList.add('error');
  document.getElementById(errorId).textContent = msg;
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('input.error, select.error').forEach(el => el.classList.remove('error'));
}

// ============================================================
// CREATE — submit form → call API → update state → re-render
// ============================================================
async function handleCreate(formData) {
  setFormLoading(true);
  try {
    // STEP 1: Call API
    const created = await API.create(formData);
    // STEP 2: Update state with API response (use the returned object!)
    STATE.listings.push(created);
    // STEP 3: Re-render the list from state
    render();
    // STEP 4: Reset form (close it, clear inputs)
    closeForm();
    // STEP 5: Show success feedback
    showToast(`"${created.name}" created successfully`);
  } catch (err) {
    showToast('Failed to create: ' + err.message, 'error');
  } finally {
    setFormLoading(false);
  }
}

// ============================================================
// UPDATE — form already populated → call API → update state → re-render
// ============================================================
async function handleUpdate(id, formData) {
  setFormLoading(true);
  try {
    // STEP 1: Call API with the ID
    const updated = await API.update(id, formData);
    // STEP 2: Replace the record in state (not push, REPLACE)
    const idx = STATE.listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      STATE.listings[idx] = updated;
    }
    // STEP 3: Re-render
    render();
    // STEP 4: Close and reset form
    closeForm();
    // STEP 5: Feedback
    showToast(`"${updated.name}" updated successfully`);
  } catch (err) {
    showToast('Failed to update: ' + err.message, 'error');
  } finally {
    setFormLoading(false);
  }
}

// ============================================================
// DELETE — click → confirm → call API → remove from state → re-render
// ============================================================
function requestDelete(id) {
  const record = STATE.listings.find(l => l.id === id);
  if (!record) return;
  // STEP 1: Store target ID
  STATE.deleteTargetId = id;
  // STEP 2: Show confirm dialog with record name
  DOM.confirmName.textContent = record.name;
  DOM.confirmOverlay.classList.add('open');
}

async function confirmDelete() {
  const id = STATE.deleteTargetId;
  if (!id) return;
  try {
    // STEP 1: Call API
    const deleted = await API.delete(id);
    // STEP 2: Remove from state
    STATE.listings = STATE.listings.filter(l => l.id !== id);
    // STEP 3: Re-render
    render();
    // STEP 4: Close modals
    closeConfirm();
    closeView(); // Also close view modal if it was showing this item
    // STEP 5: If we were editing this item, close the form too
    if (STATE.editingId === id) {
      closeForm();
    }
    // STEP 6: Feedback
    showToast(`"${deleted.name}" deleted`, 'warning');
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

function closeConfirm() {
  DOM.confirmOverlay.classList.remove('open');
  STATE.deleteTargetId = null;
}

// ============================================================
// VIEW — Show detail modal
// ============================================================
function openView(id) {
  const record = STATE.listings.find(l => l.id === id);
  if (!record) return;
  STATE.viewTargetId = id;

  DOM.viewContent.innerHTML = `
    <h2>${CATEGORY_EMOJI[record.category] || ''} ${escHtml(record.name)}</h2>
    <div class="view-row"><span class="view-label">Category</span><span class="view-val">${record.category}</span></div>
    <div class="view-row"><span class="view-label">Region</span><span class="view-val">${escHtml(record.region)}</span></div>
    <div class="view-row"><span class="view-label">Price</span><span class="view-val" style="color:#22a463">$${record.price.toLocaleString()}/MT</span></div>
    <div class="view-row"><span class="view-label">Available</span><span class="view-val">${record.quantity.toLocaleString()} MT</span></div>
    <div class="view-row"><span class="view-label">Min Order</span><span class="view-val">${record.minOrder || '—'} MT</span></div>
    <div class="view-row"><span class="view-label">Certification</span><span class="view-val">${escHtml(record.cert || '—')}</span></div>
    <div class="view-row"><span class="view-label">Seller</span><span class="view-val">${escHtml(record.seller)}</span></div>
    <div class="view-row"><span class="view-label">ID</span><span class="view-val">#${record.id}</span></div>
    <div class="view-actions">
      <button class="view-edit-btn" id="viewEditBtn">✏️ Edit</button>
      <button class="view-delete-btn" id="viewDeleteBtn">🗑 Delete</button>
    </div>
  `;

  DOM.viewOverlay.classList.add('open');

  // Wire up view modal action buttons (fresh each time)
  document.getElementById('viewEditBtn').addEventListener('click', () => {
    closeView();
    openFormForEdit(id);
  });
  document.getElementById('viewDeleteBtn').addEventListener('click', () => {
    closeView();
    requestDelete(id);
  });
}

function closeView() {
  DOM.viewOverlay.classList.remove('open');
  STATE.viewTargetId = null;
}

// ============================================================
// FORM LOADING STATE
// ============================================================
function setFormLoading(loading) {
  DOM.btnSubmit.disabled = loading;
  DOM.btnSubmitText.style.display = loading ? 'none' : 'inline';
  DOM.btnSubmitLoading.style.display = loading ? 'inline' : 'none';
}

// ============================================================
// FORM SUBMIT HANDLER — Routes to CREATE or UPDATE
// ============================================================
function getFormData() {
  return {
    name: DOM.fName.value.trim(),
    category: DOM.fCategory.value,
    region: DOM.fRegion.value.trim(),
    price: Number(DOM.fPrice.value),
    quantity: Number(DOM.fQuantity.value),
    minOrder: Number(DOM.fMinOrder.value) || null,
    cert: DOM.fCert.value.trim(),
    seller: DOM.fSeller.value.trim(),
  };
}

DOM.form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Validate
  if (!validate()) return;

  const data = getFormData();

  if (STATE.editingId) {
    // UPDATE flow: we have an editing ID → call update
    handleUpdate(STATE.editingId, data);
  } else {
    // CREATE flow: no editing ID → call create
    handleCreate(data);
  }
});

// ============================================================
// EVENT LISTENERS — Wire everything up
// ============================================================

// Create buttons
document.getElementById('btnCreate').addEventListener('click', openFormForCreate);
document.getElementById('btnCreateEmpty')?.addEventListener('click', openFormForCreate);

// Form close/cancel
document.getElementById('formClose').addEventListener('click', closeForm);
document.getElementById('btnCancel').addEventListener('click', closeForm);

// Table actions (delegated)
DOM.tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  if (action === 'view') openView(id);
  if (action === 'edit') openFormForEdit(id);
  if (action === 'delete') requestDelete(id);
});

// Search
DOM.searchInput.addEventListener('input', (e) => {
  STATE.searchQuery = e.target.value.toLowerCase();
  renderTable();
});

// Filter
DOM.filterCategory.addEventListener('change', (e) => {
  STATE.filterCategory = e.target.value;
  renderTable();
});

// View modal close
document.getElementById('viewClose').addEventListener('click', closeView);
DOM.viewOverlay.addEventListener('click', (e) => { if (e.target === DOM.viewOverlay) closeView(); });

// Confirm dialog
document.getElementById('btnConfirmDelete').addEventListener('click', confirmDelete);
document.getElementById('btnConfirmCancel').addEventListener('click', closeConfirm);
DOM.confirmOverlay.addEventListener('click', (e) => { if (e.target === DOM.confirmOverlay) closeConfirm(); });

// Keyboard: Escape closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (DOM.confirmOverlay.classList.contains('open')) closeConfirm();
    else if (DOM.viewOverlay.classList.contains('open')) closeView();
    else if (DOM.formPanel.classList.contains('open')) closeForm();
  }
});

// ============================================================
// INIT — Start by reading data
// ============================================================
loadListings();

console.log('%c🌿 AgriVN Trade Desk — CRUD Admin loaded', 'color:#22a463;font-size:13px;font-weight:bold;');
console.log(`%c
  CRUD Blueprint:
  CREATE → submit form → call API → update state → re-render list
  READ   → fetch API → set state → render UI
  UPDATE → load data into form → edit → call API → update state → re-render
  DELETE → click delete → call API → remove from state → re-render
`, 'color:#8bab96;font-size:11px;');
