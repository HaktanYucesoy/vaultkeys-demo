// ─── VaultKeys × AdPair Tracking Integration ─────────────────────────────────
// Handles click_id persistence, pixel tracking, and S2S postback simulation.

const VKTracking = (() => {
  // ── Persist click_id & UTM params on arrival ─────────────────────────────
  function init() {
    const params = new URLSearchParams(window.location.search);
    const clickId = params.get('click_id');
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmTerm = params.get('utm_term');
    const subId1 = params.get('subId1') || params.get('sub1');
    const ref = params.get('ref');

    if (clickId) {
      localStorage.setItem(ADPAIR_CONFIG.clickIdKey, clickId);
      localStorage.setItem(ADPAIR_CONFIG.clickIdKey + '_ts', Date.now().toString());
    }

    if (utmSource || utmMedium || utmCampaign) {
      const utm = { utmSource, utmMedium, utmCampaign, utmContent, utmTerm, subId1, ref };
      localStorage.setItem(ADPAIR_CONFIG.utmKey, JSON.stringify(utm));
    }

    // Auto-expire after cookie window
    const ts = localStorage.getItem(ADPAIR_CONFIG.clickIdKey + '_ts');
    if (ts && Date.now() - parseInt(ts) > ADPAIR_CONFIG.cookieWindowMs) {
      localStorage.removeItem(ADPAIR_CONFIG.clickIdKey);
      localStorage.removeItem(ADPAIR_CONFIG.clickIdKey + '_ts');
      localStorage.removeItem(ADPAIR_CONFIG.utmKey);
    }
  }

  function getClickId() {
    return localStorage.getItem(ADPAIR_CONFIG.clickIdKey) || null;
  }

  function getUtm() {
    try {
      return JSON.parse(localStorage.getItem(ADPAIR_CONFIG.utmKey) || '{}');
    } catch {
      return {};
    }
  }

  // ── Generate order ID ─────────────────────────────────────────────────────
  function generateOrderId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VK-${ts}-${rand}`;
  }

  // ── Method A: Pixel Tracking (1×1 image, client-side) ────────────────────
  function firePixel({ clickId, orderId, revenue, currency = 'USD', customerStatus, couponCode }) {
    if (!clickId) {
      console.warn('[VKTracking] Pixel skipped: no click_id');
      return { skipped: true, reason: 'no_click_id' };
    }

    const qs = new URLSearchParams();
    qs.set('click_id', clickId);
    if (orderId) qs.set('order_id', orderId);
    if (revenue !== undefined) qs.set('revenue', String(revenue));
    qs.set('currency', currency);
    if (customerStatus) qs.set('customer_status', customerStatus);
    if (couponCode) qs.set('coupon_code', couponCode);

    const pixelUrl = `${ADPAIR_CONFIG.pixelBase}?${qs.toString()}`;

    const img = new Image();
    img.src = pixelUrl;
    img.width = 1;
    img.height = 1;
    img.style.display = 'none';
    document.body.appendChild(img);

    console.log('[VKTracking] Pixel fired:', pixelUrl);
    return { method: 'pixel', url: pixelUrl, fired: true };
  }

  // ── Method B: S2S Postback via GET (simulates server-side GET call) ───────
  async function fireS2SGet({ clickId, orderId, revenue, currency = 'USD', customerStatus, couponCode, productCategory }) {
    if (!clickId) {
      console.warn('[VKTracking] S2S GET skipped: no click_id');
      return { skipped: true, reason: 'no_click_id' };
    }

    const qs = new URLSearchParams({ click_id: clickId, revenue: String(revenue), currency });
    if (orderId) qs.set('order_id', orderId);
    if (customerStatus) qs.set('customer_status', customerStatus);
    if (couponCode) qs.set('coupon_code', couponCode);
    if (productCategory) qs.set('product_category', productCategory);

    const url = `${ADPAIR_CONFIG.postbackUrl}?${qs.toString()}`;

    console.log('[VKTracking] S2S GET firing:', url);

    const headers = {};
    if (ADPAIR_CONFIG.apiKey) headers['Authorization'] = `Bearer ${ADPAIR_CONFIG.apiKey}`;

    try {
      const res = await fetch(url, { method: 'GET', headers });
      const body = await res.json();
      console.log('[VKTracking] S2S GET response:', body);
      return { method: 's2s_get', url, status: res.status, response: body };
    } catch (err) {
      console.error('[VKTracking] S2S GET error:', err);
      return { method: 's2s_get', url, error: err.message };
    }
  }

  // ── Method C: S2S Postback via POST (simulates server-side POST call) ─────
  async function fireS2SPost({ clickId, orderId, revenue, currency = 'USD', customerStatus, couponCode, productCategory, customerId }) {
    if (!clickId) {
      console.warn('[VKTracking] S2S POST skipped: no click_id');
      return { skipped: true, reason: 'no_click_id' };
    }

    const payload = {
      clickId,
      revenue: parseFloat(revenue),
      currency,
    };
    if (orderId) payload.orderId = orderId;
    if (customerStatus) payload.customerStatus = customerStatus;
    if (couponCode) payload.couponCode = couponCode;
    if (productCategory) payload.productCategory = productCategory;
    if (customerId) payload.customerId = customerId;

    console.log('[VKTracking] S2S POST firing:', ADPAIR_CONFIG.postbackUrl, payload);

    const headers = { 'Content-Type': 'application/json' };
    if (ADPAIR_CONFIG.apiKey) headers['Authorization'] = `Bearer ${ADPAIR_CONFIG.apiKey}`;

    try {
      const res = await fetch(ADPAIR_CONFIG.postbackUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      console.log('[VKTracking] S2S POST response:', body);
      return { method: 's2s_post', payload, status: res.status, response: body };
    } catch (err) {
      console.error('[VKTracking] S2S POST error:', err);
      return { method: 's2s_post', payload, error: err.message };
    }
  }

  // ── Master fire: dispatch based on method param ───────────────────────────
  async function fireConversion(orderData, method = 'pixel') {
    const clickId = getClickId();
    const params = { ...orderData, clickId };

    switch (method) {
      case 'pixel':   return firePixel(params);
      case 's2s_get': return fireS2SGet(params);
      case 's2s_post':return fireS2SPost(params);
      default:        return firePixel(params);
    }
  }

  return { init, getClickId, getUtm, generateOrderId, firePixel, fireS2SGet, fireS2SPost, fireConversion };
})();

// Auto-init on every page load
document.addEventListener('DOMContentLoaded', () => VKTracking.init());
