# VaultKeys × AdPair — Uçtan Uca Test Rehberi

> **Demo Marka:** VaultKeys — Dijital Oyun Anahtarı Mağazası  
> **Canlı Site:** `https://vaultkeys-rho.vercel.app`  
> **Platform:** AdPair Staging (`https://adpair-staging-app-eyrvb.ondigitalocean.app`)  
> **Test Yöntemi:** Aşağıdaki URL'leri doğrudan tarayıcı adres çubuğuna yapıştır

---

## ⚡ GERÇEK TEST — Hızlı Başlangıç (2 Dakika)

Simüle edilmiş `click_id` yerine **AdPair'in kendi tracking sisteminden** gerçek bir `click_id` alarak uçtan uca test et.

### Mevcut Gerçek Veriler

| Alan | Değer |
|------|-------|
| Affiliate | Gary Williams (approved) |
| Tracking Code | `8R6APMw8` |
| Tracking URL | `https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8` |

### Adım Adım Gerçek Test

**1. Affiliate linkine tıkla** (yeni bir sekme aç):
```
https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app
```
> AdPair bu isteği alır → click kaydeder → seni `vaultkeys-rho.vercel.app/?click_id=GERÇEK_ID` adresine yönlendirir.

**2. `click_id` kontrol et:**
- Adres çubuğunda `?click_id=` parametresi görünmeli
- DevTools → Application → localStorage → `vk_click_id` = aynı ID ✓

**3. Ürün seç ve satın al:**
```
https://vaultkeys-rho.vercel.app/product.html?slug=elden-ring
```
→ Add to Cart → Checkout → Complete Purchase

**4. Conversion doğrula:**
- AdPair → **Brand hesabı** → Conversions → yeni kayıt görünmeli
- AdPair → **Network** → Gary Williams → Clicks/Conversions sütunları güncellenmeli

---

## Sistem Mimarisi

```
[AdPair /t/8R6APMw8] ──302──→ [VaultKeys ?click_id=abc] ──→ [localStorage]
                                        ↓
                              [Checkout → Confirm]
                                        ↓
                     [POST /api/conversions/postback {clickId: "abc"}]
                                        ↓
                              [AdPair Conversion Kaydı]
                                        ↓
                         [Gary Williams komisyon alır ✓]
```

---

## Ön Hazırlık: AdPair'de VaultKeys Kurulumu

### 1. Brand Hesabı Oluştur
- URL: `https://adpair-staging-app-eyrvb.ondigitalocean.app`
- Email: `brand@vaultkeys.gg`
- Company: VaultKeys

### 2. Program Oluştur
**Admin → Programs → Create Program**
| Alan | Değer |
|------|-------|
| Program Name | VaultKeys Affiliate Program |
| Commission Type | Revenue Share (%) |
| Default Commission | 8 |
| Cookie Window | 30 days |

### 3. Komisyon Kuralları (Sırayla Ekle)

> **Önemli:** AdPair kuralları yukarıdan aşağıya değerlendirilir — **ilk eşleşen kural kazanır**, geri kalanlar uygulanmaz.  
> Admin → Programs → [Program] → Commission Rules → **+ Add rule**

| Sıra | Kural Adı | When (Koşul) | Değer / Kod | Pay (Komisyon) | Açıklama |
|------|-----------|-------------|-------------|----------------|---------|
| 1 | Action Category | **Product category** | `action` | Percentage — `10` % | Action oyun bonusu |
| 2 | RPG Category | **Product category** | `rpg` | Percentage — `10` % | RPG oyun bonusu |
| 3 | New Customer Bonus | **New customer** | — | Percentage — `10` % | Yeni müşteri özel oranı |
| 4 | Coupon Sites | **Coupon code used** | `DEALHUB10` | Percentage — `5` % | Kupon sitesi indirgeme |
| 5 | High Value Order | **Minimum revenue** | `40` | Percentage — `12` % | Yüksek değerli sipariş |
| Default | Default fallback | **Default (always matches)** | — | Percentage — `8` % | Diğer tüm durumlar |

> **"First match wins" etkisi:**  
> - Elden Ring (action) + new customer → Kural 1 eşleşir → **%10** (Kural 3 çalışmaz)  
> - Cyberpunk (rpg) → Kural 2 eşleşir → **%10**  
> - Hogwarts Legacy (rpg) + DEALHUB10 kupon → Kural 2 (rpg) önce eşleşir → **%10** ⚠️  
>   Kupon kuralının çalışması için **Kupon kuralını RPG/Action kurallarından önce** sırala, ya da sadece "Default" kaynaklı dönüşümlerde kupon testi yap  
> - $79.99 bundle (category=bundle) → Kural 5 eşleşir → **%12**

### 4. Tracking Ayarları
**Admin → Settings → Tracking** (tab)

| Alan | Değer | Açıklama |
|------|-------|---------|
| Default cookie window (days) | `30` | **Değiştirme** — VaultKeys localStorage 30 günlük TTL ile birebir eşleşiyor |
| Conversion dedup window (minutes) | `5` | **Değiştirme** — TEST-05'te aynı click_id ile 5 dakika içinde iki conversion gönderilirse ikincisi 409 döner |
| Attribution model | **Last Click** | **Değiştirme** — birden fazla affiliate linki varsa son tıklayan affiliate credit alır |
| Tracking domain | boş | Testler için gerekli değil — özel subdomain isteyenler için CNAME kurulumu gerektirir |
| Postback signing token | boş bırak | Testler için "No token set" olsun — token eklenince VaultKeys `config.js`'e de `X-Postback-Token` header eklenmesi gerekir |

> **S2S Postback URL** (bu sayfanın alt kısmındaki koyu alanda)  
> `https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback?click_id={CLICK_ID}&order_id={ORDER_ID}&revenue={REVENUE}&...`  
> Bu URL'e VaultKeys `tracking.js` doğrudan POST/GET atıyor — başka bir şey yapman gerekmez.  
> Scroll edip tam URL'yi gör — parametreler eksik görünüyorsa Adım 5'teki Postback URL ile karşılaştır.

### 5. Fraud Koruması
**Admin → Settings → Fraud** (tab)

**Normal testler için (TEST-01…06, TEST-08):**
| Alan | Değer | Açıklama |
|------|-------|---------|
| Enable fraud protection | **OFF** | Master toggle — kapalıyken conversion'lar reddedilmez |
| Block disposable email domains | **OFF** | Test affiliate emailları `.demo` uzantılı — açık olursa bloklanır |
| Min time click → conversion | `10` | Hazırda beklesin — TEST-07'de devreye girer |
| Dedup window | `60` | Hazırda beklesin |
| Blocked countries / IPs | boş | Test sırasında engelleme gerekmez |

**TEST-07 öncesinde (geçici olarak):**
- Enable fraud protection → **ON** → **Save fraud settings**
- TEST-07 tamamlandıktan sonra tekrar **OFF** yap — diğer testler etkilenmesin

### 6. Postback URL Tanımla
**Admin → Programs → [Program] → Postbacks → Add Postback**
```
https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback?click_id={click_id}&order_id={order_id}&revenue={revenue}&currency={currency}&customer_status={customer_status}&coupon_code={coupon_code}&product_category={product_category}
```
- Event Type: `conversion`
- Status: Active ✓

### 7. Affiliate Hesapları Oluştur
5 ayrı affiliate hesabı kaydet ve VaultKeys programına başvurt/onaylandır:

| # | Email | Rol |
|---|-------|-----|
| 1 | `dealhunter@dealshub.io` | DealHunter_Pro |
| 2 | `contact@gamingreviewshq.com` | GamingReviewsHQ |
| 3 | `techbargains@ig.demo` | TechBargains_IG |
| 4 | `steamdealsbot@telegram.demo` | SteamDealsBot |
| 5 | `pcgamer@youtube.demo` | PCGamerYT |

---

## Test URL'leri (Affiliate Linkleri)

> `click_id` gerçekte AdPair'in tracking redirect'i tarafından oluşturulur.  
> Test için aşağıdaki URL'leri doğrudan tarayıcı adres çubuğuna yapıştır — her test için farklı bir numara kullan (ör: `001`, `002`...) yoksa dedup devreye girer.

### Gerçek Tracking Akışı (Üretim/Staging)
AdPair'in gerçek affiliate link formatları:

**1. Redirect Modu** — Kullanıcı linke tıklar, AdPair cookie set eder ve markaya 302 redirect yapar:
```
GET https://adpair-staging-app-eyrvb.ondigitalocean.app/t/{tracking_code}
    ?url=https://vaultkeys-rho.vercel.app
    &sub1=campaign_name
```
Bu URL'e giden kullanıcı otomatik olarak şu adrese yönlendirilir:
```
https://vaultkeys-rho.vercel.app/?click_id=clk_abc123...
```

**2. API Modu / JS SDK** — Sayfa yönlendirmesi olmadan JSON response döner (JS entegrasyonu için):
```
GET https://adpair-staging-app-eyrvb.ondigitalocean.app/t/{tracking_code}/resolve
    ?url=https://vaultkeys-rho.vercel.app
    &sub1=campaign_name
```
Response: `{ "clickId": "clk_abc123...", "redirectUrl": "https://vaultkeys-rho.vercel.app" }`

**3. Slug Tabanlı Redirect** — Önceden tanımlanmış slug ile kısa link:
```
GET https://adpair-staging-app-eyrvb.ondigitalocean.app/go/{slug}
```

> **Not:** `tracking_code`, AdPair Admin → Programs → Affiliates ekranından affiliate başvurusu onaylandığında otomatik oluşturulur.

### Simüle Test URL'leri

> Gerçek AdPair tracking yerine, doğrudan `click_id` parametresiyle VaultKeys'e giden simülasyon URL'leri.  
> Her test için farklı bir ID kullan (dedup penceresi devreye girmesin).

```
# DealHunter_Pro (DealShub) — simüle
https://vaultkeys-rho.vercel.app/?click_id=clk_dealshub_001&utm_source=dealshub&utm_medium=cpc&utm_campaign=summer_sale

# GamingReviewsHQ (Google SEO) — simüle
https://vaultkeys-rho.vercel.app/?click_id=clk_google_001&utm_source=google&utm_medium=organic&utm_campaign=review_post

# TechBargains_IG (Instagram) — simüle
https://vaultkeys-rho.vercel.app/?click_id=clk_instagram_001&utm_source=instagram&utm_medium=social&utm_campaign=story_swipe

# SteamDealsBot (Telegram) — simüle (sub1 dahil)
https://vaultkeys-rho.vercel.app/?click_id=clk_telegram_001&utm_source=telegram&utm_medium=bot&utm_campaign=daily_deals&sub1=post_789

# PCGamerYT (YouTube) — simüle
https://vaultkeys-rho.vercel.app/?click_id=clk_youtube_001&utm_source=youtube&utm_medium=video&utm_campaign=review_video&utm_content=desc_link
```

### Gerçek AdPair Tracking Link (Gary Williams)

```
# Temel — sub parametresiz
https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app

# sub1 ile (kampanya/kaynak etiketleme)
https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app&sub1=summer_sale

# sub1 + sub2 ile
https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app&sub1=instagram&sub2=story_post
```

> Bu URL'ler AdPair'de **gerçek click kaydı** oluşturur ve Gary Williams'ın stats tablosuna yansır.

---

## Test Senaryoları

---

### TEST-01 — Gerçek Click + Pixel Tracking (Temel Uçtan Uca)

**Hedef:** AdPair'den gerçek `click_id` alarak client-side pixel ile conversion kaydı  
**Affiliate:** Gary Williams (`8R6APMw8`)  
**Ürün:** Elden Ring ($39.99, category=action)  
**Beklenen komisyon:** %10 (Kural 1 — Action category)

**Adımlar:**
1. Tarayıcıya yapıştır — AdPair tracking link'i (GERÇEK click kaydı):
   ```
   https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app
   ```
   > AdPair 302 redirect yapar → VaultKeys'e `?click_id=<gerçek_id>` ile döner
2. Adres çubuğunu kontrol et — `click_id=` parametresi görünmeli ✓
3. DevTools → Application → localStorage → `vk_click_id` = gerçek ID ✓
4. Elden Ring ürün sayfasına git:
   ```
   https://vaultkeys-rho.vercel.app/product.html?slug=elden-ring
   ```
5. **Add to Cart** → `cart.html` → **Proceed to Checkout**
6. Checkout debug URL (pixel yöntemi):
   ```
   https://vaultkeys-rho.vercel.app/checkout.html?debug=1&tracking=pixel
   ```
   - Debug banner'da `click_id` görülüyor mu? ✓
7. **Complete Purchase** → confirmation sayfasında pixel otomatik ateşlenir

**Doğrulama:**
- **AdPair Brand → Conversions:** yeni kayıt, `revenue = 39.99`, `commission ≈ $4.00 (%10)` ✓
- **AdPair Network → Gary Williams:** Clicks: 1, Conversions: 1 ✓
- DevTools → Network → `GET /pixel?click_id=...` isteği görülmeli

---

### TEST-02 — S2S Postback GET (Gerçek click_id ile)

**Hedef:** Server-to-server GET postback, gerçek click kaydıyla  
**Affiliate:** Gary Williams (`8R6APMw8`)  
**Ürün:** Cyberpunk 2077 ($29.99, category=rpg)  
**Beklenen komisyon:** %10 (RPG)

**Adımlar:**
1. Tracking linkine git (yeni bir gerçek click_id alır — öncekinden farklı olacak):
   ```
   https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app&sub1=google_organic
   ```
2. Ürün sayfasına git:
   ```
   https://vaultkeys-rho.vercel.app/product.html?slug=cyberpunk-2077
   ```
   → **Add to Cart**
3. Checkout'a git (GET yöntemi zorlanır):
   ```
   https://vaultkeys-rho.vercel.app/checkout.html?tracking=s2s_get
   ```
4. **Complete Purchase**

**Doğrulama:**
- AdPair → Conversions → `revenue = 29.99`, `commission ≈ $3.00 (%10 RPG)` ✓
- DevTools → Network → `GET /api/conversions/postback?click_id=...&revenue=29.99&...` isteği görülmeli

---

### TEST-03 — Kupon Kodu, DealShub

**Hedef:** Kupon kodunun komisyonu düşürdüğünü doğrula  
**Source:** DealShub (kupon/deals sitesi)  
**Ürün:** Stardew Valley ($4.99, category=simulation) — RPG/Action dışı bir ürün seç!  
**Kupon:** DEALHUB10  
**Beklenen komisyon:** %5 (Kural 4 — "Coupon code used: DEALHUB10")

> **Neden simulation ürünü?** "First match wins" kuralı nedeniyle Hogwarts (rpg) seçersen  
> Kural 2 (RPG → %10) önce eşleşir ve kupon kuralı hiç değerlendirilmez.  
> Simulation/indie/shooter/bundle kategorisi → Kural 1-3 eşleşmez → Kural 4 devreye girer.

**Adımlar:**
1. Tarayıcıya yapıştır:
   ```
   https://vaultkeys-rho.vercel.app/?click_id=clk_dealshub_001&ref=DEAL001&utm_source=dealshub&utm_medium=cpc&utm_campaign=summer_sale
   ```
2. Ürün sayfasına git (simulation kategorisi — RPG/Action değil):
   ```
   https://vaultkeys-rho.vercel.app/product?slug=stardew-valley
   ```
   → **Add to Cart**
3. Sepete git:
   ```
   https://vaultkeys-rho.vercel.app/cart
   ```
   → Coupon input'a **DEALHUB10** yaz → **Apply**
   - "Coupon applied" mesajı görülmeli ✓
   - *Not:* `utm_source=dealshub` geldiğinde kupon input otomatik `DEALHUB10` ile dolabilir
4. **Proceed to Checkout** → **Complete Purchase**

**Doğrulama:**
- AdPair → Conversions → `commission` ≈ %5 ($0.25) ✓
- Kural 4 (Coupon code used: DEALHUB10) tetiklendiğini Commissions alanından kontrol et

---

### TEST-04 — Yüksek Değerli Sipariş, YouTube

**Hedef:** Revenue ≥ $40 komisyon kuralı  
**Source:** YouTube  
**Ürün:** VaultKeys AAA Bundle ($79.99)  
**Beklenen komisyon:** %12 (rule 5: revenue >= 40)

**Adımlar:**
1. Tarayıcıya yapıştır:
   ```
   https://vaultkeys-rho.vercel.app/?click_id=clk_youtube_001&ref=YT005&utm_source=youtube&utm_medium=video&utm_campaign=review_video&utm_content=desc_link
   ```
2. Ürün sayfasına git:
   ```
   https://vaultkeys-rho.vercel.app/product?slug=vaultkeys-aaa-bundle
   ```
   → **Add to Cart**
3. Checkout → **Complete Purchase** (default S2S POST kullanılır)

**Doğrulama:**
- AdPair → `commission` ≈ %12 ($9.60) ✓
- DevTools → Network → POST body'de `"revenue": 79.99` görülmeli

---

### TEST-05 — Deduplication (Gerçek click_id ile)

**Hedef:** Aynı click_id ile iki conversion → ikincisi reddedilmeli  
**AdPair config:** Conversion dedup window = **5 dakika** (Admin → Settings → Tracking → Conversion dedup window)  
> Fraud Protection toggle'ına gerek yok — dedup Tracking seviyesinde çalışır, fraud toggle'ından bağımsızdır.

**Adımlar:**

**Yöntem A — Tarayıcı ile:**
1. Tracking link'e git (1 click_id al):
   ```
   https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app
   ```
2. Herhangi ürün → Add to Cart → Checkout → **Complete Purchase** (1. conversion)
3. Aynı sekme — localStorage temizleme, yeni URL açma → Checkout → **Complete Purchase** (aynı click_id, farklı order_id)

**Yöntem B — curl ile (hızlı):**
```bash
# Önce bir click oluştur (gerçek click_id al)
# /resolve endpoint'i click_id döndürür, redirect yapmaz
curl "https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8/resolve?url=https://vaultkeys-rho.vercel.app"
# Response: {"clickId": "abc123...", "redirectUrl": "..."}

# 1. conversion — clickId değerini yukarıdaki response'dan al
curl -X POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback \
  -H "Content-Type: application/json" \
  -d '{"clickId":"<yukaridan_al>","orderId":"VK-DEDUP-A","revenue":29.99,"currency":"USD"}'

# 2. conversion (aynı clickId, 5 dakika içinde)
curl -X POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback \
  -H "Content-Type: application/json" \
  -d '{"clickId":"<ayni_id>","orderId":"VK-DEDUP-B","revenue":29.99,"currency":"USD"}'
```

**Doğrulama:**
- İlk sonuç: `status = 200`, `conversionId` var → pending ✓
- İkinci sonuç: `status = 409` veya `duplicate` hata mesajı ✓
- AdPair → Conversions → yalnızca 1 kayıt görünmeli

---

### TEST-06 — SubID Tracking (Gerçek sub1 ile)

**Hedef:** `sub1` parametresinin AdPair click kaydında saklandığını doğrula  
**sub1:** `telegram_post_789`

**Adımlar:**
1. Tracking link'e sub1 ile git:
   ```
   https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app&sub1=telegram_post_789
   ```
   - DevTools → Application → localStorage → `vk_click_id` kaydedildi mi? ✓
2. Ürün sayfasına git:
   ```
   https://vaultkeys-rho.vercel.app/product.html?slug=stardew-valley
   ```
   → **Add to Cart** → Checkout → **Complete Purchase**

**Doğrulama:**
- AdPair Brand → Clicks → ilgili click kaydında `sub1 = telegram_post_789` görülmeli ✓

---

### TEST-07 — Fraud Detection (Min Conversion Time)

**Hedef:** Click'ten hemen sonraki conversion'ı reject etmeli  
**Config:** Min conversion time = 10 saniye

> **Ön koşul — Fraud Protection'ı Aç:**  
> Admin → Settings → **Fraud** tab → "Enable fraud protection" toggle → **ON** → **Save fraud settings**  
> Testten sonra tekrar **OFF** yaparak diğer testlerin etkilenmesini önle.

**Adımlar:**
1. Yeni bir click_id ile doğrudan curl ile conversion ateşle (tarayıcıya bile gitme):
   ```bash
   curl -X POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback \
     -H "Content-Type: application/json" \
     -d '{"clickId":"clk_fraud_test_001","orderId":"VK-FRAUD-A","revenue":9.99,"currency":"USD"}'
   ```
   Bu click_id için hiç click kaydı yok — anında conversion denemesi fraud sayılmalı.
2. Alternatif (tarayıcıda):
   ```
   https://vaultkeys-rho.vercel.app/?click_id=clk_fraud_001
   ```
   URL'ine git, 10 saniye beklemeden anında checkout → **Complete Purchase** yap

**Doğrulama:**
- AdPair → Conversions → `status = rejected` veya hata dönmeli ✓
- Hata mesajı: "Minimum time between click and conversion not met" benzeri
- **Not:** Fraud koruması devre dışıysa bu test geçmez — önce Ön Hazırlık adım 4'teki config'i uygula

---

### TEST-08 — Returning Customer (Gerçek click_id ile)

**Hedef:** Returning customer'ın yeni müşteri bonusu almadığını doğrula

**Adımlar:**
1. Tracking link'e git:
   ```
   https://adpair-staging-app-eyrvb.ondigitalocean.app/t/8R6APMw8?url=https://vaultkeys-rho.vercel.app
   ```
   → Herhangi ürün → **Add to Cart** → Checkout
2. Checkout formunda **"I have shopped at VaultKeys before"** checkbox'ını işaretle
3. **Complete Purchase**

**Doğrulama:**
- POST payload'da `"customerStatus": "returning"` ✓
- Kural 3 (New customer) eşleşmez → bir üst eşleşen kural uygulanır  
  - Ürün action/rpg ise → %10, simulation/indie ise → Default %8

---

## Tracking Metotları Karşılaştırma

| Özellik | Pixel (img) | S2S GET | S2S POST |
|---------|-------------|---------|---------|
| Sunucu tipi | Client | Server | Server |
| Browser gerekli? | Evet | Hayır | Hayır |
| Ad-blocker etkisi | Kesilebilir | Yok | Yok |
| Güvenlik | Düşük | Orta | Yüksek |
| Payload boyutu | Sınırlı (URL) | Orta (URL) | Büyük (JSON) |
| Önerilen kullanım | Legacy entegrasyon | Basit postback | Üretim S2S |
| AdPair endpoint | `GET /pixel` | `GET /api/conversions/postback` | `POST /api/conversions/postback` |
| Checkout URL parametresi | `?tracking=pixel` | `?tracking=s2s_get` | `?tracking=s2s_post` (default) |

---

## Tracking Method Zorla Seçmek

`tracking.js`'in varsayılan yöntemi `s2s_post`'tur. Belirli bir yöntem test etmek için:

```
# Pixel tracking
https://vaultkeys-rho.vercel.app/checkout.html?tracking=pixel

# S2S GET
https://vaultkeys-rho.vercel.app/checkout.html?tracking=s2s_get

# S2S POST (zaten varsayılan)
https://vaultkeys-rho.vercel.app/checkout.html?tracking=s2s_post

# Debug panel + yöntem seçimi
https://vaultkeys-rho.vercel.app/checkout.html?debug=1&tracking=pixel
```

---

## Conversion Lifecycle Doğrulama

```
pending → approved → locked → paid
```

1. Test-01 conversion → AdPair Admin → Conversions → **Approve**
2. Hold period geçtikten sonra → `locked`
3. Payout initiate → `paid`
4. **Affiliate Dashboard** → Earnings → ödeme görülmeli

---

## Analytics Dashboard Kontrol Listesi

| Endpoint | Ne Kontrol Edilmeli |
|----------|-------------------|
| `/dashboard/brand/sources` | 5 farklı UTM source (dealshub, google, instagram, telegram, youtube) ayrı revenue |
| `/dashboard/brand/clicks/breakdown` | Click sayısı, device breakdown |
| `/dashboard/brand/funnel` | Click → Conversion rate per source |
| `/dashboard/brand/attribution` | Affiliate başına EPC, ROAS |

---

## Sık Karşılaşılan Sorunlar

| Sorun | Neden | Çözüm |
|-------|-------|-------|
| Checkout debug banner'da click_id yok | URL'de `click_id` parametresi eksik | Yukarıdaki test URL'lerinden birini kullan, `/checkout?debug=1` ile doğrula |
| CORS hatası | API cross-origin | Beklenen — pixel ve GET metotlar çalışır, POST için CORS ayarı gerekebilir |
| `status 401` | Program ID / auth eksik | AdPair'e giriş yap, programı doğrula |
| `status 409` | Deduplication | Beklenen davranış ✓ |
| Commission yanlış | Kural sırası | AdPair → Rules → öncelik sırasını kontrol et |
| Fraud reject edilmedi | Config eksik | Settings → Fraud Protection → min_time = 10s ayarla |
| Tracking yöntemi yanlış | localStorage'da eski `vk_test_tracking` kaldı | DevTools → Application → localStorage → `vk_test_tracking` sil |

---

## Dosya Yapısı

```
vaultkeys-demo/
├── index.html          ← Anasayfa (featured games, categories)
├── games.html          ← Tüm oyunlar (filtreli, sıralanabilir)
├── product.html        ← Ürün detay + sepete ekle
├── cart.html           ← Sepet + kupon kodu
├── checkout.html       ← Ödeme + tracking method seçimi
├── confirmation.html   ← Sipariş onay + tracking sessizce ateşlenir
├── js/
│   ├── config.js       ← AdPair API URL'leri, affiliate test verileri
│   ├── products.js     ← 40 oyun kataloğu (7 kategori)
│   ├── cart.js         ← Sepet yönetimi
│   └── tracking.js     ← Pixel / S2S GET / S2S POST entegrasyonu
└── TEST-GUIDE.md       ← Bu dosya
```

---

## AdPair API Endpoint Özeti

```bash
# Pixel (GET)
GET https://adpair-staging-app-eyrvb.ondigitalocean.app/pixel
    ?click_id=clk_abc&order_id=VK-001&revenue=39.99&currency=USD
    &customer_status=new&coupon_code=DEALHUB10

# S2S Postback GET
GET https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback
    ?click_id=clk_abc&revenue=39.99&order_id=VK-001&currency=USD
    &customer_status=new&coupon_code=DEALHUB10&product_category=action

# S2S Postback POST
POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback
Content-Type: application/json

{
  "clickId": "clk_abc",
  "orderId": "VK-001",
  "revenue": 39.99,
  "currency": "USD",
  "customerStatus": "new",
  "couponCode": "DEALHUB10",
  "productCategory": "action"
}

# Beklenen Response
{
  "data": {
    "conversionId": "conv_xyz",
    "commission": 4.80,
    "appliedRuleId": "rule_action",
    "isNewCustomer": true,
    "status": "pending"
  }
}
```

---

## localStorage Referansı (Debug İçin)

| Key | İçerik | Örnek Değer |
|-----|--------|-------------|
| `vk_click_id` | Aktif click ID | `clk_instagram_001` |
| `vk_click_id_ts` | Click timestamp (ms) | `1716720000000` |
| `vk_utm` | UTM parametreleri (JSON) | `{"utm_source":"instagram","utm_medium":"social",...}` |
| `vk_cart` | Sepet ürünleri (JSON array) | `[{"id":1,"slug":"elden-ring",...}]` |
| `vk_coupon` | Uygulanan kupon kodu | `DEALHUB10` |
| `vk_last_order` | Son sipariş verisi | `{"orderId":"VK-ABC-XY","revenue":39.99,...}` |
| `vk_test_tracking` | Tracking method override | `pixel` / `s2s_get` / `s2s_post` |
