<p align="center">
  <img src="https://img.shields.io/badge/🌿_AgriVN-Farmer_to_Global_Consumer_Platform-1a7a4c?style=for-the-badge&labelColor=080e0a" alt="AgriVN" />
</p>

<h1 align="center">AgriVN — Vietnam's Agricultural Trade Platform</h1>

<p align="center">
  <strong>From Vietnamese Farm Gate → Processing → Global Consumer. One Platform.</strong><br/>
  Coffee · Durian · Rice · Cashew · Dragon Fruit · Black Pepper
</p>

<p align="center">
  <a href="https://agrivn-platform.vercel.app">🌐 Live Demo</a> ·
  <a href="https://agrivn-platform.vercel.app/farmer.html">🌾 FarmerOS</a> ·
  <a href="https://agrivn-platform.vercel.app/fulfillment.html">🌍 Global Fulfillment</a> ·
  <a href="https://agrivn-platform.vercel.app/supplychain.html">🔗 Supply Chain</a> ·
  <a href="https://agrivn-platform.vercel.app/pitch-deck.html">📊 Pitch Deck</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ERPNext-Integrated-22a463?style=flat-square" />
  <img src="https://img.shields.io/badge/Amazon_FBA-Ready-FF9900?style=flat-square" />
  <img src="https://img.shields.io/badge/Channels-B2B_·_DTC_·_Amazon-7c5cbf?style=flat-square" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## 🔥 The Problem

Vietnam is the **world's #2 coffee exporter**, **#1 cashew exporter**, and a rising durian powerhouse — yet the entire $49B agricultural export chain runs on WhatsApp chats, physical brokers with 3–5 cut margins, and zero transparency from farm to shelf.

**Vietnamese farmers get 15–25% of the final retail price. AgriVN gives them 60–80%.**

## 💡 The Solution

AgriVN is a **full-stack agricultural trade OS** that digitizes the entire value chain:

```
👨‍🌾 Farmer (Verified)
       ↓
🌾 FarmerOS Trust Profile   → Public trust page, live feed, direct orders
       ↓
🏭 Supply Chain Connect     → AI matching to local processing factories
       ↓
📦 Global Fulfillment Hub
   ├─ 📦 Amazon FBA          → US/EU/JP Prime shelves
   ├─ 🏪 DTC Storefront      → Branded Shopify store, AgriVN-fulfilled
   └─ 🏢 B2B Bulk Export     → Container-load to verified importers
       ↓
🌍 48 Countries
```

---

## 🏗️ Platform — 9 Modules

| Module | Page | Purpose |
|--------|------|---------|
| 🌐 **Marketplace** | `index.html` | B2B price discovery, live listings, AI chat sourcing |
| 🌾 **FarmerOS Profile** | `farmer.html` | Public trust profile: certs, lab tests, live feed, direct orders |
| 🌍 **Global Fulfillment** | `fulfillment.html` | Farm → Amazon FBA / DTC / B2B pipeline |
| 🔗 **Supply Chain Connect** | `supplychain.html` | AI matching: Farmer ↔ Processing Factory |
| 💰 **Trade Finance** | `finance.html` | Pre-shipment finance, invoice factoring, LC |
| 🚢 **Logistics** | `logistics.html` | 8 shipping routes, container quotes, GPS tracking |
| 💳 **Pricing** | `pricing.html` | SaaS tiers: Free / Pro $299 / Enterprise $999 |
| 📋 **Trade Desk** | `admin.html` | Full CRUD for trade listings |
| 📊 **ERP Dashboard** | `erp.html` | ERPNext integration: Sales, Purchase, Inventory, Finance |

---

## 📁 File Structure

```
agrivn-platform/
├── index.html            # B2B Marketplace
├── farmer.html           # FarmerOS Trust Profile
├── fulfillment.html      # Global Fulfillment Hub
├── supplychain.html      # Farmer → Factory Matching
├── pricing.html          # SaaS Subscription Tiers
├── finance.html          # Trade Finance Calculator + Application
├── logistics.html        # Shipping Quotes + Tracking
├── pitch-deck.html       # Investor Pitch Deck
├── admin.html            # CRUD Trade Desk
├── erp.html              # ERPNext Operations Dashboard
├── styles.css            # Main design system
├── farmer.css/js         # FarmerOS styles + logic
├── fulfillment.css/js    # Fulfillment hub styles + logic
├── supplychain.css/js    # Supply chain matching
├── pricing.css/js        # Pricing toggle + FAQ
├── finance.css/js        # Loan calculator + forms
├── logistics.css/js      # Route calculator + booking
├── admin.css/js          # CRUD state machine
├── erp.css/js            # ERP dashboard
├── erpnext-api.js        # ERPNext REST API client
├── app.js                # Marketplace + AI chat logic
└── vercel.json           # Vercel deployment config
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/manhcuongk55/agrivn-platform.git
cd agrivn-platform
npx serve . -l 4200
# Open http://localhost:4200
```

**No build step. No npm install. Zero dependencies.** Pure HTML/CSS/JS.

---

## 🌾 FarmerOS — Building Farmer Trust

Every verified farmer gets a public trust profile showing:

- ✅ **AgriVN Verified** badge (physical farm visit + lab test)
- 🏅 Certifications: UTZ, USDA Organic, VietGAP, ISO 22000, Fairtrade
- 🔴 **LIVE farm feed** — harvest diary, moisture readings, shipment updates
- 🔬 Lab test results from SGS / Eurofins / Bureau Veritas (published)
- 📦 Produce table with FOB prices + direct order with escrow
- 📍 GPS-mapped farm plot with soil type and elevation

---

## 🌍 Global Fulfillment — 3 Sales Channels

| Channel | Flow | Timeline | Platform Fee |
|---------|------|----------|-------------|
| **Amazon FBA** | Farm → Pack → Amazon warehouse (US/EU/JP) → Prime delivery | 45-60 days setup | 15% Amazon + 3% AgriVN |
| **DTC Storefront** | Farm → Pack → AgriVN HCM warehouse → Consumer door | 14 days setup | 3% platform |
| **B2B Bulk Export** | Farm → Container → Verified importer (48 countries) | 5-day matching | 5% broker fee |

**8-point trust wall:** Lab tests · Live farm cam · QR traceability per bag · GPS mapping · Buyer reviews · Certifications · Escrow payments · Sample program

---

## 💰 Revenue Model

| Stream | Mechanism | Margin |
|--------|-----------|--------|
| **Matching Fee** | 3–5% per farmer ↔ factory connection | High volume |
| **Logistics Commission** | 2–4% on all cold chain shipping | Recurring |
| **Trade Finance** | 6–8.5% APR on pre-shipment/factoring/LC | Highest margin |
| **SaaS Subscription** | $299/mo Pro · $999/mo Enterprise | Predictable MRR |
| **Fulfillment Service** | Per-unit fee on Amazon FBA prep + DTC orders | Scalable |

**Total addressable opportunity:** ~$12B of Vietnam's $49B agri exports is B2B-digitizable.

---

## 🔌 ERPNext Integration

Connect to any ERPNext instance for live operational data:

| ERPNext Doctype | AgriVN Feature |
|---|---|
| `Item` | Trade Listings |
| `Sales Order` | Buyer Trade Orders |
| `Purchase Order` | Farm Sourcing |
| `Stock Ledger Entry` | Inventory |
| `Sales Invoice` | Trade Finance |
| `Payment Entry` | Escrow & Payments |

**Offline mode:** Full functionality with localStorage — no ERPNext required for demo.

---

## 🎯 Market Opportunity

| Metric | Value |
|--------|-------|
| Vietnam agri exports | **$49B/year** |
| Coffee (world #2) | 1.8M MT/year |
| Cashew (world #1) | 350K MT/year |
| Rice (world #3) | 7.2M MT/year |
| Active farmers | 10M+ households |
| Addressable B2B trade | ~$12B digitizable |

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS — zero framework, instant load
- **Design:** Dark glassmorphism · Plus Jakarta Sans · CSS animations · Canvas charts
- **State:** Centralized JS state object + render functions
- **API:** ERPNext REST API via `fetch()` + async/await
- **Persistence:** localStorage fallback engine
- **Deploy:** Vercel (static edge CDN, zero-config)

---

## 📄 License

MIT — free to use, modify, and build upon.

---

<p align="center">
  <strong>Built for Vietnamese agricultural excellence 🇻🇳</strong><br/>
  <sub>From Dak Lak coffee hills → Mekong durian orchards → World</sub>
</p>
