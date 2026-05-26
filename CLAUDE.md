# VaultKeys — PC Game Key Store Demo

> A production-quality affiliate tracking demo storefront built with vanilla HTML, Tailwind CSS, and the AdPair tracking SDK.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HaktanYucesoy/vaultkeys-demo)

---

## Overview

VaultKeys is a fully functional e-commerce demo for PC game keys. It demonstrates affiliate/performance marketing tracking patterns including pixel firing, server-to-server (S2S) GET, and S2S POST postbacks via the **AdPair** platform.

The project is a pure static site — no build step, no framework, no server required. It runs directly in any browser and deploys to Vercel (or any static host) in seconds.

---

## Project Structure

```
vaultkeys-demo/
├── index.html          # Homepage — hero, featured deals, best sellers
├── games.html          # Browse/search catalog with sidebar filters
├── product.html        # Product detail page (dynamic via ?slug=)
├── cart.html           # Shopping cart with coupon support
├── checkout.html       # Checkout form (demo, no real payment)
├── confirmation.html   # Order confirmed + key display + tracking fire
├── vercel.json         # Vercel deployment config
├── .gitignore
│
└── js/
    ├── config.js       # AdPair configuration & test affiliate codes
    ├── products.js     # Product catalog (PRODUCTS array) & helpers
    ├── cart.js         # Cart state management (localStorage)
    └── tracking.js     # AdPair tracking: pixel, S2S GET, S2S POST
```

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero section, featured deals (≥28% off), best sellers |
| Browse | `/games.html` | Full catalog with category filter, search, sort |
| Product | `/product.html?slug=elden-ring` | Detail page with add-to-cart |
| Cart | `/cart.html` | Cart review, coupon codes, checkout CTA |
| Checkout | `/checkout.html` | Contact + payment form (demo mode) |
| Confirmation | `/confirmation.html?order_id=…` | Success page, fake game keys, tracking fire |

---

## Tech Stack

- **HTML5** — semantic, accessible structure
- **Tailwind CSS v3** (CDN) — utility-first styling
- **Google Fonts** — Syne (display) + DM Sans (body)
- **Vanilla JS** — no framework dependencies
- **localStorage** — cart state, UTM/click_id persistence
- **AdPair JS SDK** — affiliate tracking (custom, see `tracking.js`)

---

## UI / Design Changes

This section documents all design and UX improvements made in the latest revision, guided by the `frontend-design` and `ui-design-system` skill standards.

### Typography

| Before | After |
|--------|-------|
| System/Inter (generic) | **Syne** for headings & display text |
| — | **DM Sans** for body & UI text |
| No font hierarchy | Clear display/body split via `.font-display` class |

### Color & Atmosphere

| Area | Change |
|------|--------|
| Background | `#0A0D14` → `#080B10` (deeper, richer black) |
| Card surface | `#111520` → `#0D1117` |
| Borders | Toned down to `#1C2333` for subtler separation |
| Hero glows | Added multi-layer ambient radials (brand + blue + violet) |
| Hero background | Noise texture overlay + refined grid mask |
| Promo banner | Shimmer animation on brand highlight |

### Components & Interactions

- **Logo** — replaced emoji with custom SVG hexagon icon, consistent across all pages
- **Buttons** — `btn-glow` class adds `box-shadow` brand glow on primary CTAs; scales on hover
- **Game cards** — `game-card` class with smooth `translateY(-3/4px)` lift + subtle border glow on hover
- **Best sellers** — rank badges now use gold/silver/bronze color hierarchy (`#F59E0B / #94A3B8 / #B45309`)
- **Why VaultKeys** — added stats row (500K+ gamers, 2,000+ titles, 4.9★) and social links in footer
- **Cart items** — `item-removing` slide-out animation when deleting a product
- **Checkout submit** — spinner SVG replaces button text during processing
- **Confirmation** — SVG animated checkmark replaces emoji; ambient green glow behind success icon

### New Page: `product.html`

A fully dynamic product detail page was added (was missing from the original codebase):

- Breadcrumb navigation (Home → Category → Title)
- Large cover image with gradient overlay
- Rating badge, tag pills, publisher info
- Animated "Add to Cart" button (shows ✓ confirmation for 1.8s)
- Related games grid (same category, excludes current)

### Page Transitions

All pages share a consistent `pageEnter` / `pageExit` animation — a 400ms fade+slide-up on load and 180ms fade-out on navigation, creating a seamless SPA-like feel without any framework.

---

## Design Skills Used

These two Claude skills were applied when redesigning and generating the UI code. You can install them globally to use the same standards in future projects.

### `frontend-design`

Guides creation of distinctive, production-grade frontend interfaces. Covers typography pairing, color & theme commitment, motion/animation, spatial composition, and background atmosphere. Specifically steers away from generic AI-generated aesthetics (overused font families, purple-on-white palettes, cookie-cutter layouts).

```bash
npx claude-code-templates@latest --skill creative-design/frontend-design
```

What it enforces for this project:
- Bold, intentional font choices (Syne was selected as the distinctive display face)
- Dominant brand color (`#00E5A0`) with sharp accents rather than timid even distribution
- High-impact page-load animations with staggered reveals
- Atmosphere via layered gradients, noise textures, and ambient glow — not flat solid colors
- Every component has a clear conceptual direction and executes it with precision

### `ui-design-system`

Defines consistent design tokens, component patterns, and spacing rules for a cohesive UI system. Ensures that all elements (buttons, cards, badges, inputs, navbars) follow the same visual language rather than being styled individually and inconsistently.

```bash
npx claude-code-templates@latest --skill creative-design/ui-design-system
```

What it enforces for this project:
- Unified surface color scale (`surface.DEFAULT`, `surface.card`, `surface.elevated`, `surface.border`)
- Consistent border-radius scale (inputs/cards: `rounded-xl` / `rounded-2xl`)
- Reusable utility classes (`.btn-glow`, `.game-card`, `.font-display`, `.gradient-text`)
- Typography size hierarchy preserved across all pages
- Spacing rhythm based on Tailwind's default scale (no arbitrary pixel values)

> **Note:** If the `claude-code-templates` package is not yet installed, run the install command first:
>
> ```bash
> npm install -g claude-code-templates
> ```
>
> Then install each skill individually as shown above.

---

## Tracking Integration

### How it works

1. User lands via affiliate link: `?click_id=ABC123&utm_source=dealshub`
2. `tracking.js` persists `click_id` and UTM params in `localStorage` (30-day window)
3. On purchase completion, `fireConversion()` dispatches the chosen method:
   - **Pixel** — 1×1 image pixel (client-side)
   - **S2S GET** — fetch GET to postback URL
   - **S2S POST** — fetch POST with JSON payload

### Test URLs

Append these params to trigger tracking simulation:

```
# DealHub affiliate
/?click_id=TEST123&utm_source=dealshub&utm_medium=cpc&utm_campaign=summer_sale

# Force specific tracking method at checkout
/checkout.html?tracking=pixel
/checkout.html?tracking=s2s_get
/checkout.html?tracking=s2s_post

# Debug panel
/checkout.html?debug=1
```

### Postback payload (S2S POST)

```json
{
  "clickId": "ABC123",
  "orderId": "VK-M0ABC12-XY9Z",
  "revenue": 39.99,
  "currency": "USD",
  "customerStatus": "new",
  "couponCode": "SUMMER25",
  "productCategory": "action"
}
```

---

## Configuration

Open `js/config.js` and update:

```js
const ADPAIR_CONFIG = {
  apiBase: 'https://your-adpair-instance.com/api',
  programId: 'YOUR_PROGRAM_ID_HERE',   // ← fill after creating program in AdPair
  // ... rest stays the same
};
```

---

## Coupon Codes (Demo)

| Code | Description |
|------|-------------|
| `DEALHUB10` | Auto-applied for `utm_source=dealshub` |
| `SAVE10` | General 10% off |
| `SUMMER25` | Summer sale code |
| `VAULTDEAL` | VaultKeys special |

---

## Product Catalog

Products are defined in `js/products.js` as a `PRODUCTS` array. Each product has:

```js
{
  id, slug, title, subtitle,
  category,        // action | rpg | strategy | simulation | indie | shooter | bundle
  price, originalPrice, discount,
  rating, reviews,
  platform, publisher, description,
  tags,            // array of strings
  color,           // Tailwind gradient classes
  badge,           // "BEST SELLER" | "GOTY" | null
  image,           // Steam CDN URL
}
```

To add products, simply push a new object into `PRODUCTS`.

### Catalog Size & Categories

**Current count: 40 products** across 7 categories:

| Category | Count | Notes |
|----------|-------|-------|
| action | 8 | Elden Ring, God of War, RDR2, Sekiro, RE4, DMC5, DOOM Eternal, MHW |
| rpg | 6 | BG3, Cyberpunk, Hogwarts, Witcher 3, Dark Souls III, NieR: Automata |
| strategy | 5 | Civ VI, Total War WHammer III, AoE IV, CK3, XCOM 2 |
| simulation | 5 | Stardew Valley, Cities Skylines II, Planet Zoo, ETS2, Farming Sim 22 |
| indie | 7 | Hollow Knight, Hades II, Celeste, Dead Cells, Terraria, Cuphead, Disco Elysium |
| shooter | 5 | Deep Rock Galactic, Back 4 Blood, Rainbow Six Siege, Payday 2, Insurgency |
| bundle | 4 | Indie Bundle, AAA Bundle, Action Bundle, Shooter Bundle |

### Price Benchmarking

Prices reflect real key-store market rates (benchmarked against dealshub.io/game and similar platforms). Key-store prices are typically **40–80% below Steam MSRP**:

- New/popular titles: 30–50% off MSRP
- Mid-cycle titles: 50–75% off
- Older/catalogue titles: 60–85% off
- Bundles: 47–73% off combined MSRP

### Steam CDN Image Pattern

```
https://cdn.akamai.steamstatic.com/steam/apps/{STEAM_APP_ID}/capsule_616x353.jpg
```

Find the Steam App ID on the game's store page URL: `store.steampowered.com/app/{ID}/`

---

## Deploying to Vercel

### Option 1 — Vercel Dashboard (recommended)

1. Push your code to `https://github.com/HaktanYucesoy/vaultkeys-demo`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `HaktanYucesoy/vaultkeys-demo` repository
4. **Framework Preset:** select `Other` (static site)
5. **Build Command:** leave empty
6. **Output Directory:** leave as `.` (root)
7. Click **Deploy**

That's it. Vercel will detect it's a static site and serve it directly.

### Option 2 — Vercel CLI

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
cd vaultkeys-demo
vercel

# Follow prompts:
# ? Set up and deploy "vaultkeys-demo"? → Y
# ? Which scope? → your account
# ? Link to existing project? → N
# ? What's your project's name? → vaultkeys-demo
# ? In which directory is your code located? → ./
# ? Want to override the settings? → N

# Production deploy
vercel --prod
```

### Option 3 — GitHub Auto-Deploy

1. Connect your GitHub repo on [vercel.com/new](https://vercel.com/new)
2. Every `git push` to `main` will auto-deploy to production
3. Every PR will get a preview URL automatically

### vercel.json (included)

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Local Development

No build step needed. Just open `index.html` in a browser or use any static server:

```bash
# Python
python -m http.server 3000

# Node
npx http-server -p 3000

# VS Code
# Use the "Live Server" extension → right-click index.html → Open with Live Server
```

Then visit: `http://localhost:3000`

---

## Environment Notes

- All data is **mock/demo** — no real products, payments, or keys
- The AdPair postback URL points to a staging environment
- `programId: 'FILL_AFTER_SETUP'` must be replaced before production use
- Cart state persists in `localStorage` — clear with `VKCart.clearCart()` in console

---

## License

MIT — free to use as a starting point for your own affiliate storefront.