/**
 * AgriVN — OpenClaw Skills Module
 * Connects OpenClaw AI agent to AgriVN actors via Zalo, Telegram, WhatsApp
 *
 * OpenClaw docs: https://docs.openclaw.ai
 * Install: npx openclaw onboard
 *
 * Actors:
 *   - farmer    : Vietnamese farmer listing produce, receiving orders, updating stock
 *   - buyer     : Global importer/buyer searching, quoting, tracking shipments
 *   - logistics : Booking, live tracking, container status
 *   - admin     : Trade Desk / ERP notifications, order management
 */

'use strict';

// ============================
// CONFIG — set via .env or openclaw config
// ============================
const AGRIVN_CONFIG = {
  apiBase: process.env.AGRIVN_API_BASE || 'http://localhost:4200',
  erpBase: process.env.ERPNEXT_URL || '',
  erpToken: process.env.ERPNEXT_API_KEY || '',
  currency: 'USD',
};

// ============================
// ACTOR REGISTRY
// ============================
const ACTORS = {
  farmer: {
    name: 'Farmer Agent 🌾',
    lang: 'vi',
    systemPrompt: `
Bạn là AgriVN Farmer Assistant — trợ lý AI cho người nông dân Việt Nam.
Nhiệm vụ của bạn:
- Giúp nông dân đăng sản phẩm (lúa, cà phê, sầu riêng, hạt điều, tiêu...)
- Nhận và xác nhận đơn đặt hàng từ người mua
- Cập nhật tình trạng hàng hóa (in stock, seasonal, sold out)
- Kết nối với xưởng gia công gần nhất phù hợp với nguyên liệu
- Tạo báo giá FOB cho người mua
- Gửi thông báo khi có đơn hàng mới

Luôn trả lời bằng tiếng Việt. Đơn giản, rõ ràng, thân thiện.
Khi không hiểu, hỏi lại. Không bịa đặt giá.
    `.trim(),
    tools: ['agrivn_list_produce', 'agrivn_update_stock', 'agrivn_receive_order',
            'agrivn_find_factory', 'agrivn_create_quote', 'agrivn_get_certifications'],
  },

  buyer: {
    name: 'Buyer Agent 🌍',
    lang: 'en',
    systemPrompt: `
You are AgriVN Buyer Assistant — an AI agent helping global importers source Vietnamese agricultural products.
Your capabilities:
- Search available produce by type, origin, volume, and certification
- Generate FOB price quotes for specific quantities and destinations
- Check farm trust scores, certifications, and lab test results
- Initiate sample requests (500g–2kg) before container commitment
- Book logistics (8 routes: HCMC/Hai Phong → Shanghai/Hamburg/LA/Tokyo/Busan/Sydney)
- Track shipments in real time
- Connect to trade finance (pre-shipment loans, invoice factoring)

Always respond in English. Be precise with pricing and timelines.
Always mention: FOB price, minimum order, transit time, available certifications.
    `.trim(),
    tools: ['agrivn_search_produce', 'agrivn_get_quote', 'agrivn_check_farm_profile',
            'agrivn_request_sample', 'agrivn_book_logistics', 'agrivn_track_shipment',
            'agrivn_apply_finance'],
  },

  logistics: {
    name: 'Logistics Agent 🚢',
    lang: 'en',
    systemPrompt: `
You are AgriVN Logistics Agent — handling container bookings, cold chain coordination, and shipment tracking.
Capabilities:
- Calculate shipping quotes for 8 routes (HCMC/Hai Phong → 6 global ports)
- Book 20'/40' Dry and Reefer containers
- Generate customs documents checklist (CO, Phytosanitary, Packing List, Invoice)
- Provide real-time shipment tracking by booking ID
- Alert on exceptions: delays, temperature alarms, port holds
- Coordinate farm pickup (truck dispatch, cold chain handoff)
    `.trim(),
    tools: ['agrivn_quote_shipping', 'agrivn_book_container', 'agrivn_track_shipment',
            'agrivn_customs_checklist', 'agrivn_cold_chain_alert'],
  },

  admin: {
    name: 'Trade Desk Agent 📋',
    lang: 'en',
    systemPrompt: `
You are AgriVN Trade Desk — the internal admin agent.
Capabilities:
- Summarize daily orders, GMV, new farmers onboarded
- Alert on pending approvals (farm verification, finance applications)
- Push ERP sync status (ERPNext Sales Orders, Inventory)
- Generate weekly revenue reports across all streams
- Escalate issues: payment failures, shipment exceptions, quality disputes
    `.trim(),
    tools: ['agrivn_daily_summary', 'agrivn_pending_approvals', 'agrivn_erp_sync_status',
            'agrivn_revenue_report', 'agrivn_escalate_issue'],
  },
};

// ============================
// TOOL DEFINITIONS (OpenClaw Skills format)
// ============================
const AGRIVN_SKILLS = {
  name: 'agrivn',
  version: '1.0.0',
  description: 'AgriVN agricultural trade platform — farmer, buyer, logistics, and admin tools',
  actor_configs: ACTORS,
  tools: [
    {
      name: 'agrivn_search_produce',
      description: 'Search available Vietnamese agricultural produce by type, region, certification, and volume',
      parameters: {
        type: 'object',
        properties: {
          product_type: { type: 'string', description: 'e.g. Coffee Robusta, Durian, Rice ST25, Cashew' },
          min_volume_mt: { type: 'number', description: 'Minimum volume in metric tons' },
          certification: { type: 'string', description: 'e.g. UTZ, USDA Organic, VietGAP, ISO 22000' },
          region: { type: 'string', description: 'e.g. Dak Lak, Tien Giang, An Giang' },
        },
        required: ['product_type'],
      },
      handler: async ({ product_type, min_volume_mt, certification, region }) => {
        // In production: call AgriVN API / ERPNext Item list
        const mockResults = [
          { farm: 'HTX Cà Phê Buôn Ma Thuột', product: product_type, volume: 240, price_usd_kg: 2.80, cert: 'UTZ, ISO 22000', trust_score: 96 },
          { farm: 'Nông Trại Cấp Premium Đắk Lắk', product: product_type, volume: 80, price_usd_kg: 3.10, cert: 'USDA Organic', trust_score: 92 },
        ];
        return { results: mockResults, count: mockResults.length, currency: 'USD/kg FOB HCMC' };
      },
    },

    {
      name: 'agrivn_get_quote',
      description: 'Get a shipping + FOB quote for an order',
      parameters: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          volume_mt: { type: 'number' },
          destination: { type: 'string', description: 'e.g. Shanghai, Hamburg, Long Beach' },
          container_type: { type: 'string', enum: ['20dry', '40dry', '20reefer', '40reefer'] },
        },
        required: ['product', 'volume_mt', 'destination'],
      },
      handler: async ({ product, volume_mt, destination, container_type = '20dry' }) => {
        const BASE_PRICES = { Shanghai: 2800, Hamburg: 4200, 'Long Beach': 5500, Tokyo: 3200, Busan: 3000, Sydney: 4800 };
        const base = BASE_PRICES[destination] || 3500;
        const containers = Math.ceil(volume_mt / 22);
        const ocean_freight = base * containers;
        const customs = ocean_freight * 0.05;
        const insurance = ocean_freight * 0.02;
        return {
          product, volume_mt, destination, container_type, containers,
          ocean_freight_usd: ocean_freight,
          customs_usd: customs,
          insurance_usd: insurance,
          total_usd: ocean_freight + customs + insurance,
          transit_days: destination === 'Shanghai' ? '5-7' : destination === 'Hamburg' ? '28-30' : '22-25',
          note: 'FOB Cat Lai Port, HCMC. Excludes port surcharges.',
        };
      },
    },

    {
      name: 'agrivn_track_shipment',
      description: 'Track a shipment by AgriVN booking ID or container number',
      parameters: {
        type: 'object',
        properties: {
          booking_id: { type: 'string', description: 'AgriVN booking ID, e.g. AGV-2026-0847' },
        },
        required: ['booking_id'],
      },
      handler: async ({ booking_id }) => {
        // In production: call logistics API / ERPNext Delivery Note
        return {
          booking_id,
          status: 'IN_TRANSIT',
          current_location: 'South China Sea — 15.4°N, 112.8°E',
          vessel: 'M/V Ever Green',
          departed: '2026-03-14',
          eta: '2026-03-19',
          origin: 'Cat Lai Port, HCMC',
          destination: 'Yangshan, Shanghai',
          container: 'AGVU-2468135',
          temperature_c: '12.4°C',
          last_update: new Date().toISOString(),
        };
      },
    },

    {
      name: 'agrivn_check_farm_profile',
      description: 'Get trust profile and certifications for a farm',
      parameters: {
        type: 'object',
        properties: {
          farm_name: { type: 'string' },
        },
        required: ['farm_name'],
      },
      handler: async ({ farm_name }) => {
        return {
          farm_name,
          trust_score: 96,
          verified: true,
          last_inspection: '2026-03-01',
          certifications: ['UTZ Certified', 'ISO 22000', 'USDA Organic', 'VietGAP', 'Fairtrade'],
          lab_test_url: `${AGRIVN_CONFIG.apiBase}/lab-reports/${encodeURIComponent(farm_name)}.pdf`,
          location: 'Cư M\'gar District, Đắk Lắk',
          gps: '12.6°N 108.1°E',
          annual_yield_mt: 240,
          buyers_count: 38,
          rating: 4.9,
          live_feed_url: `${AGRIVN_CONFIG.apiBase}/farmer.html`,
        };
      },
    },

    {
      name: 'agrivn_find_factory',
      description: 'Find the best processing factory for a given raw material and region',
      parameters: {
        type: 'object',
        properties: {
          material: { type: 'string', description: 'e.g. Robusta nhân, Sầu riêng tươi, Lúa ST25' },
          region: { type: 'string', description: 'Province, e.g. Đắk Lắk, Tiền Giang' },
          volume_mt: { type: 'number' },
        },
        required: ['material'],
      },
      handler: async ({ material, region, volume_mt }) => {
        const FACTORIES = [
          { name: 'Đắk Lắk Coffee Processing', match: ['Robusta', 'Arabica', 'cà phê'], score: 96, capacity_mt: 500, location: 'Buôn Ma Thuột', certs: ['ISO 22000', 'HACCP'] },
          { name: 'Mekong Fruit Factory', match: ['Sầu riêng', 'Xoài', 'Thanh long'], score: 92, capacity_mt: 300, location: 'Tiền Giang', certs: ['GlobalG.A.P', 'BRC'] },
          { name: 'An Giang Rice Mill', match: ['Lúa', 'Gạo', 'ST25', 'Jasmine'], score: 94, capacity_mt: 2000, location: 'An Giang', certs: ['ISO 9001', 'USDA Organic'] },
        ];
        const matLower = material.toLowerCase();
        const matches = FACTORIES.filter(f => f.match.some(m => matLower.includes(m.toLowerCase()) || m.toLowerCase().includes(matLower)));
        return { matches: matches.length ? matches : FACTORIES.slice(0, 2), note: 'Sorted by match score' };
      },
    },

    {
      name: 'agrivn_receive_order',
      description: 'Confirm receipt of a new order from a buyer (farmer-side)',
      parameters: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          volume_mt: { type: 'number' },
          buyer_name: { type: 'string' },
          destination: { type: 'string' },
          price_usd_kg: { type: 'number' },
        },
        required: ['product', 'volume_mt', 'buyer_name'],
      },
      handler: async (params) => {
        const order_id = `AGV-ORD-${Date.now().toString(36).toUpperCase()}`;
        // In production: POST to ERPNext Sales Order
        return {
          order_id,
          status: 'CONFIRMED',
          message: `✅ Đơn hàng ${order_id} đã được xác nhận! ${params.volume_mt} MT ${params.product} cho ${params.buyer_name}. Đội ngũ AgriVN sẽ liên hệ trong 4 giờ để sắp xếp thu hoạch và vận chuyển.`,
          ...params,
        };
      },
    },

    {
      name: 'agrivn_daily_summary',
      description: 'Get the daily trade summary for the admin dashboard',
      parameters: { type: 'object', properties: {}, required: [] },
      handler: async () => {
        return {
          date: new Date().toLocaleDateString('vi-VN'),
          orders_today: 7,
          gmv_usd: 142800,
          new_farmers: 3,
          pending_verifications: 2,
          active_shipments: 12,
          finance_disbursed_usd: 85000,
          top_product: 'Robusta G1 Coffee',
          alerts: ['⚠️ Shipment AGV-0821 temperature alarm — 14.2°C (max 12°C)', '📋 HTX Sầu riêng Cai Lậy verification pending'],
        };
      },
    },

    {
      name: 'agrivn_quote_shipping',
      description: 'Get a detailed shipping cost quote',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string', enum: ['HCMC', 'Hai Phong'] },
          destination: { type: 'string' },
          container_type: { type: 'string' },
          qty: { type: 'number', description: 'Number of containers' },
        },
        required: ['origin', 'destination'],
      },
      handler: async ({ origin, destination, container_type = '20dry', qty = 1 }) => {
        const ROUTE_BASE = { Shanghai: 2800, Hamburg: 4200, 'Long Beach': 5500, Tokyo: 3200, Busan: 3000, Sydney: 4800, Rotterdam: 4100 };
        const REEFER_PREMIUM = container_type.includes('reefer') ? 2200 : 0;
        const base = (ROUTE_BASE[destination] || 3500) + REEFER_PREMIUM;
        return {
          origin, destination, container_type, qty,
          ocean_freight_usd: base * qty,
          customs_handling_usd: (base * qty) * 0.05,
          insurance_usd: (base * qty) * 0.02,
          total_usd: (base * qty) * 1.07,
          transit_days: destination === 'Shanghai' ? '5-7' : destination === 'Tokyo' ? '6-8' : '25-32',
        };
      },
    },

    {
      name: 'agrivn_apply_finance',
      description: 'Apply for trade finance (pre-shipment loan or invoice factoring)',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['pre_shipment', 'invoice_factoring', 'letter_of_credit'] },
          amount_usd: { type: 'number' },
          company_name: { type: 'string' },
          product: { type: 'string' },
        },
        required: ['type', 'amount_usd', 'company_name'],
      },
      handler: async ({ type, amount_usd, company_name, product }) => {
        const RATES = { pre_shipment: 0.085, invoice_factoring: 0.062, letter_of_credit: 0.038 };
        const apr = RATES[type];
        const monthly = (amount_usd * apr) / 12;
        const ref = `FIN-${Date.now().toString(36).toUpperCase()}`;
        return {
          ref,
          type,
          amount_usd,
          apr_pct: apr * 100,
          monthly_payment_usd: monthly.toFixed(2),
          status: 'APPLICATION_RECEIVED',
          message: `💳 Finance application ${ref} received for ${company_name}. Amount: $${amount_usd.toLocaleString()} at ${(apr * 100).toFixed(1)}% APR. Review in 24–48 hours.`,
        };
      },
    },
  ],
};

// ============================
// OPENCLAW GATEWAY INTEGRATION
// ============================

/**
 * Register AgriVN skills with the OpenClaw local gateway.
 * Run this after starting OpenClaw: npx openclaw onboard
 *
 * Example channel setup (Zalo for farmers, Telegram for buyers):
 *   openclaw channel add zalo --actor farmer
 *   openclaw channel add telegram --actor buyer
 *   openclaw channel add slack --actor admin
 */
async function registerWithOpenClaw(gatewayWsUrl = 'ws://127.0.0.1:18789') {
  const payload = {
    type: 'register_skills',
    skills: AGRIVN_SKILLS,
    actor_configs: ACTORS,
  };

  try {
    // Dynamic WebSocket — only runs in Node.js environment
    const { WebSocket } = await import('ws').catch(() => ({ WebSocket: null }));
    if (!WebSocket) {
      console.warn('[AgriVN OpenClaw] ws module not found. Run: npm install ws');
      return;
    }
    const ws = new WebSocket(gatewayWsUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify(payload));
      console.log('[AgriVN OpenClaw] ✅ Skills registered with OpenClaw gateway');
      console.log('[AgriVN OpenClaw] Actors:', Object.keys(ACTORS).join(', '));
    });
    ws.on('error', (err) => {
      console.warn('[AgriVN OpenClaw] ⚠️ Could not connect to gateway:', err.message);
      console.warn('[AgriVN OpenClaw] Start OpenClaw first: npx openclaw onboard');
    });
  } catch (e) {
    console.warn('[AgriVN OpenClaw] Gateway registration skipped (browser context)');
  }
}

// ============================
// OPENCLAW SKILL CONFIG FILE (export for openclaw config)
// ============================
const OPENCLAW_SKILL_CONFIG = {
  // Save this as: ~/.openclaw/skills/agrivn.yaml
  // or reference via openclaw config:
  //   skills:
  //     - path: ./openclaw-skills.js
  //     - name: agrivn

  actors: {
    farmer: {
      description: 'Vietnamese farmer — Zalo channel, Vietnamese language, order management',
      channels: ['zalo', 'zalo_personal', 'telegram'],
      language: 'vi',
      system_prompt: ACTORS.farmer.systemPrompt,
    },
    buyer: {
      description: 'Global buyer — WhatsApp/Telegram/Slack, English, sourcing & logistics',
      channels: ['telegram', 'whatsapp', 'slack'],
      language: 'en',
      system_prompt: ACTORS.buyer.systemPrompt,
    },
    logistics: {
      description: 'Logistics coordinator — booking, tracking, container alerts',
      channels: ['telegram', 'slack'],
      language: 'en',
      system_prompt: ACTORS.logistics.systemPrompt,
    },
    admin: {
      description: 'Trade Desk admin — daily summaries, ERP sync, escalation alerts',
      channels: ['slack', 'discord'],
      language: 'en',
      system_prompt: ACTORS.admin.systemPrompt,
    },
  },
};

// Auto-register when run as Node.js module
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('openclaw-skills')) {
  registerWithOpenClaw();
}

// Export for Node.js / OpenClaw
if (typeof module !== 'undefined') {
  module.exports = { AGRIVN_SKILLS, ACTORS, OPENCLAW_SKILL_CONFIG, registerWithOpenClaw };
}

// Export for browser context
if (typeof window !== 'undefined') {
  window.AgriVNOpenClaw = { AGRIVN_SKILLS, ACTORS, OPENCLAW_SKILL_CONFIG };
}
