<p align="center">
  <img src="https://img.shields.io/badge/🌿_AgriVN-B2B_Agricultural_Export_Platform-1a7a4c?style=for-the-badge&labelColor=080e0a" alt="AgriVN" />
</p>

<h1 align="center">AgriVN — Vietnam's B2B Agricultural Export Platform</h1>

<p align="center">
  <strong>Connect global buyers with 1,200+ verified Vietnamese farms.</strong><br/>
  Coffee · Durian · Rice · Tropical Fruits · Cashew · Black Pepper
</p>

<p align="center">
  <a href="https://agrivn-platform.vercel.app">🌐 Live Demo</a> ·
  <a href="https://agrivn-platform.vercel.app/admin.html">📋 Trade Desk</a> ·
  <a href="https://agrivn-platform.vercel.app/erp.html">📊 ERP Dashboard</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ERPNext-Integrated-22a463?style=flat-square" />
  <img src="https://img.shields.io/badge/CRUD-Production_Grade-e8a020?style=flat-square" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## 🔥 The Problem

Vietnam is the **world's #2 coffee exporter**, **#1 cashew exporter**, and a rising durian powerhouse — yet B2B agricultural trade is still done via WhatsApp, email chains, and physical brokers.

> **$49B** in agricultural exports, managed through spreadsheets.

## 💡 The Solution

AgriVN is a **full-stack B2B marketplace** that digitizes the entire agricultural export workflow:

```
🌱 Farm → 📦 Listing → 🔍 Discovery → 💰 Order → 🚢 Logistics → 🏦 Finance
```

## 🏗️ Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AgriVN Platform                       │
├─────────────┬──────────────┬────────────────────────────┤
│  LAYER 1    │   LAYER 2    │        LAYER 3             │
│  Marketplace│  Trade Desk  │    ERP Operations          │
│             │              │                            │
│ • 6 Product │ • Full CRUD  │ • 📊 Dashboard (KPIs)     │
│   Categories│ • Create     │ • 💰 Sales Orders          │
│ • AI Chat   │ • Read       │ • 🚜 Purchase Orders       │
│ • Farm Feed │ • Update     │ • 📦 Inventory             │
│ • Price Data│ • Delete     │ • 🏦 Trade Finance         │
│ • Vietnam   │ • Validation │ •                          │
│   Map       │ • Confirm    │ • ERPNext API Client       │
│             │   Delete     │ • localStorage Fallback    │
├─────────────┴──────────────┴────────────────────────────┤
│              ERPNext REST API Integration               │
│    Items · Sales Orders · Purchase Orders · Stock       │
│          Invoices · Payments · Accounting               │
└─────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
agrivn-platform/
├── index.html          # Marketplace landing page
├── styles.css          # Design system (1,200+ lines)
├── app.js              # Marketplace + AI Chat logic
├── admin.html          # CRUD Trade Desk
├── admin.css           # Admin panel styles
├── admin.js            # CRUD state machine (correct logic)
├── erpnext-api.js      # ERPNext API client + fallback
├── erp.html            # ERP Operations Dashboard
├── erp.css             # ERP-specific styles
├── erp.js              # ERP controller (5 tabs)
├── vercel.json         # Deployment config
└── hero.jpg            # Hero background
```

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/manhcuongk55/agrivn-platform.git
cd agrivn-platform

# Run locally
python3 -m http.server 4200
# Open http://localhost:4200
```

**No build step. No npm install. Zero dependencies.** Pure HTML/CSS/JS.

## 🔌 ERPNext Integration

Connect to any ERPNext instance for live data:

1. Open [ERP Dashboard](https://agrivn-platform.vercel.app/erp.html)
2. Click **"Connect ERPNext"**
3. Enter your ERPNext URL + credentials
4. All CRUD operations sync with ERPNext

**Offline mode:** Full functionality with localStorage — no ERPNext required for demo.

### ERPNext Doctype Mapping

| ERPNext Doctype | AgriVN Feature |
|---|---|
| `Item` | Trade Listings (Products) |
| `Sales Order` | Buyer Trade Orders |
| `Purchase Order` | Farm Sourcing Orders |
| `Stock Ledger Entry` | Inventory Tracking |
| `Sales Invoice` | Trade Finance |
| `Payment Entry` | Payment Tracking |

## ✅ CRUD Blueprint (Production-Grade)

Every data operation follows this exact flow:

```
CREATE → submit form → call API → update state → re-render list
READ   → fetch API → set state → render UI
UPDATE → load data into form → edit → call API → update state → re-render
DELETE → click delete → confirm → call API → remove from state → re-render
```

**No shortcuts. No skipped steps.**

- ✅ Form validation with field-level errors
- ✅ Loading states during API calls
- ✅ Empty states when no data
- ✅ Delete confirmation dialog
- ✅ Toast notifications for feedback
- ✅ Keyboard shortcuts (Escape to close)
- ✅ Data populated into form on Edit (not blank)
- ✅ State updated from API response (not local guess)

## 🔥 Viral Growth Engines

| Engine | Mechanic | Inspired By |
|---|---|---|
| 📹 **Farm Stories** | Live farm streams → watch harvest → order directly | TikTok / Reels |
| 🤖 **AI Sourcing** | Chat with AI → get matched farms → share results | ChatGPT / Perplexity |
| 📊 **Price Transparency** | Public price dashboard → share on LinkedIn/Zalo | Bloomberg Terminal |

## 💰 Revenue Model

| Stream | Mechanism | ERPNext Module |
|---|---|---|
| **Logistics** | Commission on cold chain shipping | Sales Order → Delivery Note |
| **Financing** | Interest on pre-shipment finance, LC fees | Sales Invoice → Payment Entry |
| **Sourcing** | Matching fee + premium intelligence subscription | Purchase Order |

## 🎯 Market Opportunity

| Metric | Value |
|---|---|
| Vietnam agri exports | **$49B/year** |
| Coffee (world #2) | 1.8M MT/year |
| Cashew (world #1) | 350K MT/year |
| Rice (world #3) | 7.2M MT/year |
| Addressable B2B trade | ~$12B digitizable |

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS — zero framework, instant load
- **Charts:** Canvas API (no Chart.js dependency)
- **State:** Centralized JS state object with render functions
- **API:** ERPNext REST API with `fetch()` + async/await
- **Persistence:** localStorage fallback engine
- **Deploy:** Vercel (static, edge CDN)
- **Design:** Dark glassmorphism, Plus Jakarta Sans, CSS animations

## 📄 License

MIT — free to use, modify, and sell.

---

<p align="center">
  <strong>Built for Vietnamese agricultural excellence 🇻🇳</strong><br/>
  <sub>From Dak Lak coffee hills to Mekong durian orchards</sub>
</p>
