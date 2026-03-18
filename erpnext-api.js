/* ===================================
   AgriVN × ERPNext — API Client
   
   Connects AgriVN frontend to ERPNext backend.
   Handles authentication, CRUD for all doctypes, and
   business logic mapping.
   
   Usage:
     const erp = new ERPNextClient('https://your-erpnext.com');
     await erp.login('user@email.com', 'password');
     const items = await erp.getItems();
     
   Falls back to localStorage when ERPNext is not reachable.
=================================== */
'use strict';

class ERPNextClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.isConnected = false;
    this.user = null;
    // Try to restore from config
    const saved = localStorage.getItem('erpnext_config');
    if (saved) {
      const cfg = JSON.parse(saved);
      this.baseUrl = cfg.baseUrl || '';
      this.isConnected = false; // Will verify on next call
    }
  }

  // ============================================================
  // AUTH
  // ============================================================
  async login(usr, pwd) {
    try {
      const res = await this._fetch('/api/method/login', 'POST', { usr, pwd });
      this.isConnected = true;
      this.user = res.full_name || usr;
      this._saveConfig();
      return { success: true, user: this.user };
    } catch (err) {
      this.isConnected = false;
      return { success: false, error: err.message };
    }
  }

  async logout() {
    try {
      await this._fetch('/api/method/logout', 'POST');
    } catch (_) {}
    this.isConnected = false;
    this.user = null;
    localStorage.removeItem('erpnext_config');
  }

  async checkConnection() {
    if (!this.baseUrl) return false;
    try {
      await this._fetch('/api/method/frappe.auth.get_logged_user', 'GET');
      this.isConnected = true;
      return true;
    } catch (_) {
      this.isConnected = false;
      return false;
    }
  }

  // ============================================================
  // GENERIC FRAPPE REST API
  // ============================================================
  async getList(doctype, { fields = ['*'], filters = [], limit = 100, orderBy = 'modified desc' } = {}) {
    const params = new URLSearchParams({
      fields: JSON.stringify(fields),
      filters: JSON.stringify(filters),
      limit_page_length: limit,
      order_by: orderBy,
    });
    const res = await this._fetch(`/api/resource/${doctype}?${params}`);
    return res.data || [];
  }

  async getDoc(doctype, name) {
    const res = await this._fetch(`/api/resource/${doctype}/${encodeURIComponent(name)}`);
    return res.data;
  }

  async createDoc(doctype, data) {
    const res = await this._fetch(`/api/resource/${doctype}`, 'POST', data);
    return res.data;
  }

  async updateDoc(doctype, name, data) {
    const res = await this._fetch(`/api/resource/${doctype}/${encodeURIComponent(name)}`, 'PUT', data);
    return res.data;
  }

  async deleteDoc(doctype, name) {
    await this._fetch(`/api/resource/${doctype}/${encodeURIComponent(name)}`, 'DELETE');
    return { name, deleted: true };
  }

  async callMethod(method, args = {}) {
    const res = await this._fetch(`/api/method/${method}`, 'POST', args);
    return res.message || res;
  }

  // ============================================================
  // BUSINESS LOGIC: ITEMS (AgriVN Listings)
  //
  // ERPNext Item doctype → AgriVN Listing
  // Mapping:
  //   item_name → name
  //   item_group → category
  //   custom_region → region
  //   standard_rate → price
  //   custom_available_qty → quantity
  //   custom_min_order → minOrder
  //   custom_certification → cert
  //   custom_seller → seller
  // ============================================================
  async getItems(filters = []) {
    if (!this.isConnected) return this._fallback('getItems', filters);
    const items = await this.getList('Item', {
      fields: ['name', 'item_name', 'item_group', 'standard_rate',
               'custom_region', 'custom_available_qty', 'custom_min_order',
               'custom_certification', 'custom_seller', 'modified'],
      filters: [['item_group', 'in', ['Coffee', 'Durian', 'Rice', 'Fruit', 'Cashew', 'Pepper']], ...filters],
      limit: 200,
    });
    return items.map(this._itemToListing);
  }

  async createItem(listing) {
    if (!this.isConnected) return this._fallback('createItem', listing);
    const doc = this._listingToItem(listing);
    const created = await this.createDoc('Item', doc);
    return this._itemToListing(created);
  }

  async updateItem(name, listing) {
    if (!this.isConnected) return this._fallback('updateItem', name, listing);
    const doc = this._listingToItem(listing);
    const updated = await this.updateDoc('Item', name, doc);
    return this._itemToListing(updated);
  }

  async deleteItem(name) {
    if (!this.isConnected) return this._fallback('deleteItem', name);
    return this.deleteDoc('Item', name);
  }

  _itemToListing(item) {
    return {
      id: item.name,
      name: item.item_name || item.name,
      category: (item.item_group || '').toLowerCase(),
      region: item.custom_region || '',
      price: Number(item.standard_rate) || 0,
      quantity: Number(item.custom_available_qty) || 0,
      minOrder: Number(item.custom_min_order) || null,
      cert: item.custom_certification || '',
      seller: item.custom_seller || '',
      modified: item.modified,
    };
  }

  _listingToItem(listing) {
    const groupMap = {
      coffee: 'Coffee', durian: 'Durian', rice: 'Rice',
      fruit: 'Fruit', cashew: 'Cashew', pepper: 'Pepper',
    };
    return {
      item_name: listing.name,
      item_group: groupMap[listing.category] || listing.category,
      standard_rate: listing.price,
      custom_region: listing.region,
      custom_available_qty: listing.quantity,
      custom_min_order: listing.minOrder,
      custom_certification: listing.cert,
      custom_seller: listing.seller,
    };
  }

  // ============================================================
  // BUSINESS LOGIC: SALES ORDERS (Trade Orders from Buyers)
  //
  // Flow: Buyer requests quote → Sales Order created → confirmed → shipped
  // ============================================================
  async getSalesOrders(filters = []) {
    if (!this.isConnected) return this._fallback('getSalesOrders', filters);
    return this.getList('Sales Order', {
      fields: ['name', 'customer_name', 'transaction_date', 'grand_total',
               'status', 'delivery_date', 'custom_trade_reference'],
      filters,
      orderBy: 'transaction_date desc',
    });
  }

  async createSalesOrder(order) {
    if (!this.isConnected) return this._fallback('createSalesOrder', order);
    return this.createDoc('Sales Order', {
      customer: order.customer,
      transaction_date: order.date || new Date().toISOString().split('T')[0],
      delivery_date: order.deliveryDate,
      custom_trade_reference: order.tradeRef || '',
      items: order.items.map(item => ({
        item_code: item.itemCode,
        qty: item.qty,
        rate: item.rate,
        delivery_date: order.deliveryDate,
      })),
    });
  }

  async updateSalesOrderStatus(name, status) {
    if (!this.isConnected) return this._fallback('updateSalesOrderStatus', name, status);
    return this.callMethod('frappe.client.set_value', {
      doctype: 'Sales Order',
      name: name,
      fieldname: 'status',
      value: status,
    });
  }

  // ============================================================
  // BUSINESS LOGIC: PURCHASE ORDERS (Sourcing from Farms)
  //
  // Flow: AgriVN sources from farm → PO to farm → goods received → quality check
  // ============================================================
  async getPurchaseOrders(filters = []) {
    if (!this.isConnected) return this._fallback('getPurchaseOrders', filters);
    return this.getList('Purchase Order', {
      fields: ['name', 'supplier_name', 'transaction_date', 'grand_total',
               'status', 'custom_farm_region', 'custom_quality_grade'],
      filters,
      orderBy: 'transaction_date desc',
    });
  }

  async createPurchaseOrder(po) {
    if (!this.isConnected) return this._fallback('createPurchaseOrder', po);
    return this.createDoc('Purchase Order', {
      supplier: po.supplier,
      transaction_date: po.date || new Date().toISOString().split('T')[0],
      custom_farm_region: po.farmRegion || '',
      custom_quality_grade: po.qualityGrade || '',
      items: po.items.map(item => ({
        item_code: item.itemCode,
        qty: item.qty,
        rate: item.rate,
        schedule_date: po.scheduleDate,
      })),
    });
  }

  // ============================================================
  // BUSINESS LOGIC: STOCK / INVENTORY
  //
  // Track warehouse levels for each agri product
  // ============================================================
  async getStockBalance(filters = []) {
    if (!this.isConnected) return this._fallback('getStockBalance', filters);
    return this.callMethod('erpnext.stock.utils.get_stock_balance_for', {
      filters: JSON.stringify(filters),
    });
  }

  async getStockLedger(item = '', warehouse = '', limit = 50) {
    if (!this.isConnected) return this._fallback('getStockLedger', item, warehouse);
    const filters = [];
    if (item) filters.push(['item_code', '=', item]);
    if (warehouse) filters.push(['warehouse', '=', warehouse]);
    return this.getList('Stock Ledger Entry', {
      fields: ['name', 'item_code', 'warehouse', 'actual_qty', 'qty_after_transaction', 'posting_date'],
      filters,
      limit,
      orderBy: 'posting_date desc',
    });
  }

  // ============================================================
  // BUSINESS LOGIC: ACCOUNTING / TRADE FINANCE
  //
  // Track payments, invoices, outstanding amounts
  // ============================================================
  async getSalesInvoices(filters = []) {
    if (!this.isConnected) return this._fallback('getSalesInvoices', filters);
    return this.getList('Sales Invoice', {
      fields: ['name', 'customer_name', 'posting_date', 'grand_total',
               'outstanding_amount', 'status'],
      filters,
      orderBy: 'posting_date desc',
    });
  }

  async getPaymentEntries(filters = []) {
    if (!this.isConnected) return this._fallback('getPaymentEntries', filters);
    return this.getList('Payment Entry', {
      fields: ['name', 'party_name', 'posting_date', 'paid_amount',
               'payment_type', 'status'],
      filters,
      orderBy: 'posting_date desc',
    });
  }

  async getAccountsReceivable() {
    if (!this.isConnected) return this._fallback('getAccountsReceivable');
    return this.callMethod('erpnext.accounts.utils.get_balance_on', {
      account_type: 'Receivable',
    });
  }

  // ============================================================
  // BUSINESS LOGIC: REPORTS & DASHBOARD
  // ============================================================
  async getDashboardStats() {
    if (!this.isConnected) return this._fallback('getDashboardStats');
    try {
      const [items, so, po, si] = await Promise.all([
        this.getList('Item', { filters: [['item_group', 'in', ['Coffee','Durian','Rice','Fruit','Cashew','Pepper']]], fields: ['name'] }),
        this.getList('Sales Order', { filters: [['status', '!=', 'Cancelled']], fields: ['name', 'grand_total', 'status'] }),
        this.getList('Purchase Order', { filters: [['status', '!=', 'Cancelled']], fields: ['name', 'grand_total', 'status'] }),
        this.getList('Sales Invoice', { filters: [['status', '!=', 'Cancelled']], fields: ['name', 'outstanding_amount'] }),
      ]);
      return {
        totalItems: items.length,
        totalSalesOrders: so.length,
        salesOrderValue: so.reduce((s, o) => s + (Number(o.grand_total) || 0), 0),
        pendingSO: so.filter(o => o.status === 'Draft' || o.status === 'To Deliver and Bill').length,
        totalPurchaseOrders: po.length,
        purchaseOrderValue: po.reduce((s, o) => s + (Number(o.grand_total) || 0), 0),
        outstandingReceivable: si.reduce((s, i) => s + (Number(i.outstanding_amount) || 0), 0),
      };
    } catch (err) {
      return this._fallback('getDashboardStats');
    }
  }

  // ============================================================
  // FALLBACK — localStorage when ERPNext not connected
  // ============================================================
  _fallback(method, ...args) {
    console.log(`[ERPNext] Offline mode — ${method}() using localStorage`);
    const FALLBACK = new ERPNextFallback();
    return FALLBACK[method](...args);
  }

  _saveConfig() {
    localStorage.setItem('erpnext_config', JSON.stringify({
      baseUrl: this.baseUrl,
      user: this.user,
    }));
  }

  // ============================================================
  // HTTP FETCH WRAPPER
  // ============================================================
  async _fetch(path, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'include',
    };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${this.baseUrl}${path}`, opts);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || errData._server_messages || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

// ============================================================
// FALLBACK ENGINE — Full localStorage implementation
// Mirrors ERPNext API but stored locally
// ============================================================
class ERPNextFallback {
  constructor() {
    this._ensureSeed();
  }

  _key(type) { return `agrivn_erp_${type}`; }
  _get(type) { return JSON.parse(localStorage.getItem(this._key(type)) || '[]'); }
  _set(type, data) { localStorage.setItem(this._key(type), JSON.stringify(data)); }

  _ensureSeed() {
    if (localStorage.getItem(this._key('items_seeded'))) return;
    // Seed items
    const items = [
      { id: 'ITEM-001', name: 'Premium Robusta G1', category: 'coffee', region: 'Dak Lak, Vietnam', price: 2340, quantity: 240, minOrder: 5, cert: 'UTZ, Rainforest', seller: 'Dak Lak Coffex', modified: '2026-03-15' },
      { id: 'ITEM-002', name: 'Monthong Durian IQF', category: 'durian', region: 'Tien Giang, Vietnam', price: 4200, quantity: 80, minOrder: 2, cert: 'GlobalG.A.P', seller: 'Mekong Agri Export', modified: '2026-03-14' },
      { id: 'ITEM-003', name: 'ST25 Jasmine Rice', category: 'rice', region: 'Soc Trang, Mekong Delta', price: 720, quantity: 1200, minOrder: 20, cert: 'Organic, USDA', seller: 'Delta Rice Corp', modified: '2026-03-12' },
      { id: 'ITEM-004', name: 'Cat Hoa Loc Mango', category: 'fruit', region: 'Dong Thap, Vietnam', price: 890, quantity: 65, minOrder: 3, cert: 'VietGAP', seller: 'Mekong Fresh', modified: '2026-03-10' },
      { id: 'ITEM-005', name: 'W320 Cashew Kernels', category: 'cashew', region: 'Binh Phuoc, Vietnam', price: 7800, quantity: 45, minOrder: 1, cert: 'FSSC 22000', seller: 'Viet Cashew Co', modified: '2026-03-08' },
    ];
    this._set('items', items);
    // Seed sales orders
    const so = [
      { id: 'SO-001', customer: 'Shanghai Import Co.', date: '2026-03-15', total: 468000, status: 'Confirmed', deliveryDate: '2026-04-15', items: [{itemCode:'ITEM-001', name:'Robusta G1', qty:200, rate:2340}] },
      { id: 'SO-002', customer: 'Berlin Organic Traders', date: '2026-03-14', total: 144000, status: 'Draft', deliveryDate: '2026-05-01', items: [{itemCode:'ITEM-003', name:'ST25 Rice', qty:200, rate:720}] },
      { id: 'SO-003', customer: 'Tokyo Fresh Foods', date: '2026-03-12', total: 84000, status: 'Shipped', deliveryDate: '2026-03-25', items: [{itemCode:'ITEM-002', name:'Durian IQF', qty:20, rate:4200}] },
      { id: 'SO-004', customer: 'Sydney Agri Imports', date: '2026-03-10', total: 57850, status: 'Confirmed', deliveryDate: '2026-04-20', items: [{itemCode:'ITEM-004', name:'Mango', qty:65, rate:890}] },
    ];
    this._set('salesOrders', so);
    // Seed purchase orders
    const po = [
      { id: 'PO-001', supplier: 'Dak Lak Coffex Farm', date: '2026-03-14', total: 561600, status: 'Received', farmRegion: 'Dak Lak', qualityGrade: 'Grade A', items: [{itemCode:'ITEM-001', name:'Robusta G1', qty:240, rate:2340}] },
      { id: 'PO-002', supplier: 'Mekong Premium Farms', date: '2026-03-13', total: 336000, status: 'Ordered', farmRegion: 'Tien Giang', qualityGrade: 'Grade A+', items: [{itemCode:'ITEM-002', name:'Durian IQF', qty:80, rate:4200}] },
      { id: 'PO-003', supplier: 'Delta Rice Cooperative', date: '2026-03-10', total: 864000, status: 'Received', farmRegion: 'Soc Trang', qualityGrade: 'Grade A', items: [{itemCode:'ITEM-003', name:'ST25 Rice', qty:1200, rate:720}] },
    ];
    this._set('purchaseOrders', po);
    // Seed invoices
    const inv = [
      { id: 'INV-001', customer: 'Shanghai Import Co.', date: '2026-03-15', total: 468000, outstanding: 468000, status: 'Unpaid' },
      { id: 'INV-002', customer: 'Tokyo Fresh Foods', date: '2026-03-12', total: 84000, outstanding: 0, status: 'Paid' },
      { id: 'INV-003', customer: 'Sydney Agri Imports', date: '2026-03-10', total: 57850, outstanding: 57850, status: 'Unpaid' },
    ];
    this._set('invoices', inv);
    localStorage.setItem(this._key('items_seeded'), '1');
  }

  // Items
  async getItems() { return this._get('items'); }
  async createItem(data) {
    const items = this._get('items');
    const id = 'ITEM-' + String(items.length + 1).padStart(3, '0');
    const item = { ...data, id, modified: new Date().toISOString().split('T')[0] };
    items.push(item);
    this._set('items', items);
    return item;
  }
  async updateItem(id, data) {
    const items = this._get('items');
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Not found');
    items[idx] = { ...items[idx], ...data, id, modified: new Date().toISOString().split('T')[0] };
    this._set('items', items);
    return items[idx];
  }
  async deleteItem(id) {
    let items = this._get('items');
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Not found');
    items = items.filter(i => i.id !== id);
    this._set('items', items);
    return { name: id, deleted: true };
  }

  // Sales Orders
  async getSalesOrders() { return this._get('salesOrders'); }
  async createSalesOrder(data) {
    const orders = this._get('salesOrders');
    const id = 'SO-' + String(orders.length + 1).padStart(3, '0');
    const order = { ...data, id, status: 'Draft', total: data.items.reduce((s,i) => s + i.qty * i.rate, 0) };
    orders.push(order);
    this._set('salesOrders', orders);
    return order;
  }
  async updateSalesOrderStatus(id, status) {
    const orders = this._get('salesOrders');
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Not found');
    orders[idx].status = status;
    this._set('salesOrders', orders);
    return orders[idx];
  }

  // Purchase Orders
  async getPurchaseOrders() { return this._get('purchaseOrders'); }
  async createPurchaseOrder(data) {
    const orders = this._get('purchaseOrders');
    const id = 'PO-' + String(orders.length + 1).padStart(3, '0');
    const order = { ...data, id, status: 'Ordered', total: data.items.reduce((s,i) => s + i.qty * i.rate, 0) };
    orders.push(order);
    this._set('purchaseOrders', orders);
    return order;
  }

  // Stock (derived from items)
  async getStockBalance() {
    return this._get('items').map(i => ({
      item_code: i.id,
      item_name: i.name,
      warehouse: 'HCMC Warehouse',
      actual_qty: i.quantity,
    }));
  }
  async getStockLedger() { return []; }

  // Invoices
  async getSalesInvoices() { return this._get('invoices'); }
  async getPaymentEntries() { return []; }
  async getAccountsReceivable() {
    const inv = this._get('invoices');
    return inv.reduce((s, i) => s + (i.outstanding || 0), 0);
  }

  // Dashboard
  async getDashboardStats() {
    const items = this._get('items');
    const so = this._get('salesOrders');
    const po = this._get('purchaseOrders');
    const inv = this._get('invoices');
    return {
      totalItems: items.length,
      totalSalesOrders: so.length,
      salesOrderValue: so.reduce((s, o) => s + (o.total || 0), 0),
      pendingSO: so.filter(o => o.status === 'Draft' || o.status === 'Confirmed').length,
      totalPurchaseOrders: po.length,
      purchaseOrderValue: po.reduce((s, o) => s + (o.total || 0), 0),
      outstandingReceivable: inv.reduce((s, i) => s + (i.outstanding || 0), 0),
    };
  }
}

// ============================================================
// EXPORT — Global singleton
// ============================================================
window.ERPNextClient = ERPNextClient;
window.erpnext = new ERPNextClient();

console.log('%c🌿 ERPNext API Client loaded', 'color:#22a463;font-size:12px;font-weight:bold;');
console.log(`%c  Mode: ${window.erpnext.isConnected ? 'LIVE → ' + window.erpnext.baseUrl : 'OFFLINE → localStorage fallback'}`, 'color:#8bab96;font-size:11px;');
