// ─── VaultKeys × AdPair Configuration ────────────────────────────────────────
const ADPAIR_CONFIG = {
  // AdPair staging API base
  apiBase: 'https://adpair-staging-app-eyrvb.ondigitalocean.app/api',

  // Pixel base (strips /api from end)
  get pixelBase() {
    return this.apiBase.replace(/\/api\/?$/, '') + '/pixel';
  },

  // S2S postback endpoint
  get postbackUrl() {
    return this.apiBase + '/conversions/postback';
  },

  // VaultKeys program ID on AdPair (fill after creating program in AdPair)
  programId: 'FILL_AFTER_SETUP',

  // Cookie / localStorage key for click_id persistence
  clickIdKey: 'vk_click_id',
  utmKey: 'vk_utm',

  // Cookie window: 30 days in ms
  cookieWindowMs: 30 * 24 * 60 * 60 * 1000,
};

// ─── Test Affiliate Codes (for quick URL building) ────────────────────────────
const TEST_AFFILIATES = {
  dealshub: {
    ref: 'DEAL001',
    utm_source: 'dealshub',
    utm_medium: 'cpc',
    utm_campaign: 'summer_sale',
    label: 'DealHunter_Pro — DealShub.io',
  },
  google: {
    ref: 'BLOG002',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'review_post',
    label: 'GamingReviewsHQ — SEO Blog',
  },
  instagram: {
    ref: 'IG003',
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: 'story_swipe',
    label: 'TechBargains_IG — Instagram',
  },
  telegram: {
    ref: 'TG004',
    utm_source: 'telegram',
    utm_medium: 'bot',
    utm_campaign: 'daily_deals',
    subId1: 'post_789',
    label: 'SteamDealsBot — Telegram',
  },
  youtube: {
    ref: 'YT005',
    utm_source: 'youtube',
    utm_medium: 'video',
    utm_campaign: 'review_video',
    utm_content: 'desc_link',
    label: 'PCGamerYT — YouTube',
  },
};
