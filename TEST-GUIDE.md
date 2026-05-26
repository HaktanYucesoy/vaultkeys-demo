# VaultKeys × AdPair — Uçtan Uca Test Rehberi

> **Demo Marka:** VaultKeys — Dijital Oyun Anahtarı Mağazası  
> **Platform:** AdPair Staging (`https://adpair-staging-app-eyrvb.ondigitalocean.app`)  
> **Test Yöntemi:** Aşağıdaki simüle URL'leri doğrudan tarayıcı adres çubuğuna yapıştır

---

## Sistem Mimarisi

```
[Affiliate Link] ──→ [VaultKeys] ──→ [AdPair Tracking] ──→ [Conversion]
       ↑                  ↑                   ↑
  utm_source          click_id           postback/pixel
  utm_medium       (localStorage)      /conversions/postback
  utm_campaign                         /pixel
  subId1
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
| Rule | Koşul | Komisyon | Açıklama |
|------|-------|----------|---------|
| 1 | category = `action` | 10% | Action oyun bonusu |
| 2 | category = `rpg` | 10% | RPG oyun bonusu |
| 3 | customer_status = `new` | +2% (bonus) | Yeni müşteri bonusu |
| 4 | coupon_code contains `DEAL` | 5% | Kupon sitesi indirgeme |
| 5 | revenue >= 40 | 12% | Yüksek değerli sipariş |
| Default | — | 8% | Diğer tüm durumlar |

### 4. Fraud Koruması
**Admin → Settings → Fraud Protection**
- Min conversion time: **10 seconds**
- Deduplication window: **60 minutes**
- Enable disposable email blocking: ✓

### 5. Postback URL Tanımla
**Admin → Programs → [Program] → Postbacks → Add Postback**
```
https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback?click_id={click_id}&order_id={order_id}&revenue={revenue}&currency={currency}&customer_status={customer_status}&coupon_code={coupon_code}
```
- Event Type: `conversion`
- Status: Active ✓

### 6. Affiliate Hesapları Oluştur
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
> Test için aşağıdaki URL'leri doğrudan tarayıcı adres çubuğuna yapıştır — `[ts]` yerine herhangi bir sayı gir (ör: `001`).

### Gerçek Tracking Akışı (Üretim/Staging)
AdPair'in gerçek affiliate link formatı:
```
https://trk.[brand-subdomain]/go?ref=DEAL001
```
Bu URL'e giden kullanıcı AdPair'in tracking server'ına ulaşır, click_id alır ve markaya yönlendirilir:
```
https://vaultkeys-demo.com/?click_id=clk_abc123...&utm_source=dealshub&...
```

### Simüle Test URL'leri

```
# DealHunter_Pro (DealShub)
index.html?click_id=clk_dealshub_001&ref=DEAL001&utm_source=dealshub&utm_medium=cpc&utm_campaign=summer_sale

# GamingReviewsHQ (Google SEO)
index.html?click_id=clk_google_001&ref=BLOG002&utm_source=google&utm_medium=organic&utm_campaign=review_post

# TechBargains_IG (Instagram)
index.html?click_id=clk_instagram_001&ref=IG003&utm_source=instagram&utm_medium=social&utm_campaign=story_swipe

# SteamDealsBot (Telegram)
index.html?click_id=clk_telegram_001&ref=TG004&utm_source=telegram&utm_medium=bot&utm_campaign=daily_deals&subId1=post_789

# PCGamerYT (YouTube)
index.html?click_id=clk_youtube_001&ref=YT005&utm_source=youtube&utm_medium=video&utm_campaign=review_video&utm_content=desc_link
```

> **Not:** Her test için farklı bir click_id kullan (ör: `clk_instagram_001`, `clk_instagram_002`...) yoksa dedup devreye girer.

---

## Test Senaryoları

---

### TEST-01 — Pixel Tracking, Instagram Kaynağı

**Hedef:** Client-side pixel tracking ile conversion kaydı  
**Source:** Instagram (story swipe-up)  
**Ürün:** Elden Ring ($39.99, category=rpg, new customer)  
**Beklenen komisyon:** %10 (RPG) + %2 (new) = %12

**Adımlar:**
1. Tarayıcıya yapıştır: `index.html?click_id=clk_instagram_001&ref=IG003&utm_source=instagram&utm_medium=social&utm_campaign=story_swipe`
2. DevTools → Application → localStorage → `vk_click_id = clk_instagram_001` olduğunu doğrula
3. Anasayfadan Elden Ring'e git: `product.html?slug=elden-ring`
4. **Add to Cart** → `cart.html` → **Proceed to Checkout**
5. Checkout URL'ine `?debug=1` ekle: `checkout.html?debug=1`
   - Debug banner'da `click_id` görülüyor mu? ✓
   - utm_source = `instagram` görülüyor mu? ✓
6. **Complete Purchase** tıkla (pixel tracking confirmation'da otomatik ateşlenir)

**Doğrulama:**
- **AdPair Dashboard → Conversions:**
  - `status = pending` ✓
  - `source = instagram` ✓
  - `revenue = 39.99` ✓
  - `commission = ~12%` ✓

---

### TEST-02 — S2S Postback GET, Google Organik

**Hedef:** Server-to-server GET postback  
**Source:** Google Organic  
**Ürün:** Cyberpunk 2077 ($29.99, category=rpg)  
**Beklenen komisyon:** %10 (RPG)

**Adımlar:**
1. Tarayıcıya yapıştır: `index.html?click_id=clk_google_001&ref=BLOG002&utm_source=google&utm_medium=organic&utm_campaign=review_post`
2. `product.html?slug=cyberpunk-2077` → Add to Cart
3. Checkout → Complete Purchase (S2S POST otomatik gönderilir)

**Doğrulama:**
- AdPair → Conversions → `source = google`, `utm_medium = organic`
- DevTools → Network → `POST /api/conversions/postback` isteği görülmeli

---

### TEST-03 — Kupon Kodu, DealShub

**Hedef:** Kupon kodunun komisyonu düşürdüğünü doğrula  
**Source:** DealShub (kupon/deals sitesi)  
**Ürün:** Hogwarts Legacy ($49.99)  
**Kupon:** DEALHUB10  
**Beklenen komisyon:** %5 (kupon rule 4)

**Adımlar:**
1. Tarayıcıya yapıştır: `index.html?click_id=clk_dealshub_001&ref=DEAL001&utm_source=dealshub&utm_medium=cpc&utm_campaign=summer_sale`
2. `product.html?slug=hogwarts-legacy` → Add to Cart
3. `cart.html` → Coupon input'a **DEALHUB10** yaz → Apply
   - "Coupon applied" mesajı görülmeli ✓
   - *Not:* dealshub utm_source'u geldiğinde kupon input otomatik doluyor
4. Checkout → Complete Purchase

**Doğrulama:**
- AdPair → Conversions → `commission` ≈ %5 ($2.50)
- Rule 4 tetiklendiğini Commissions alanından kontrol et

---

### TEST-04 — Yüksek Değerli Sipariş, YouTube

**Hedef:** Revenue ≥ $40 komisyon kuralı  
**Source:** YouTube  
**Ürün:** VaultKeys AAA Bundle ($79.99) veya herhangi $40+ ürün  
**Beklenen komisyon:** %12 (rule 5: revenue >= 40)

**Adımlar:**
1. Tarayıcıya yapıştır: `index.html?click_id=clk_youtube_001&ref=YT005&utm_source=youtube&utm_medium=video&utm_campaign=review_video&utm_content=desc_link`
2. `product.html?slug=vaultkeys-aaa-bundle` → Add to Cart
3. Checkout → Complete Purchase

**Doğrulama:**
- AdPair → `commission` ≈ %12 ($9.60)
- DevTools → Network → POST body'de `revenue = 79.99` görülmeli

---

### TEST-05 — Deduplication

**Hedef:** Aynı click_id ile iki conversion → ikincisi reddedilmeli  
**AdPair config:** Dedup window = 60 dakika

**Adımlar:**
1. URL ile click_id oluştur: `index.html?click_id=clk_dedup_001&utm_source=dealshub`
2. Herhangi ürün → Add to Cart → Checkout → Complete Purchase (1. conversion)
3. Sepete tekrar ürün ekle → Checkout → Complete Purchase (aynı click_id, farklı order_id)
4. Alternatif (curl ile):
   ```bash
   # 1. conversion
   curl -X POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback \
     -H "Content-Type: application/json" \
     -d '{"clickId":"clk_dedup_001","orderId":"VK-DEDUP-A","revenue":29.99,"currency":"USD"}'
   # 2. conversion (aynı click_id)
   curl -X POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback \
     -H "Content-Type: application/json" \
     -d '{"clickId":"clk_dedup_001","orderId":"VK-DEDUP-B","revenue":29.99,"currency":"USD"}'
   ```

**Doğrulama:**
- İlk sonuç: `status = 200`, `conversionId` var → pending ✓
- İkinci sonuç: `status = 409` veya `duplicate` hata mesajı ✓
- AdPair → Conversions → yalnızca 1 kayıt görünmeli

---

### TEST-06 — SubID Tracking, Telegram

**Hedef:** SubId1 parametresinin click kaydında saklandığını doğrula  
**Source:** Telegram (bot mesajı)  
**subId1:** post_789

**Adımlar:**
1. Tarayıcıya yapıştır: `index.html?click_id=clk_telegram_001&ref=TG004&utm_source=telegram&utm_medium=bot&utm_campaign=daily_deals&subId1=post_789`
   - URL'de `subId1=post_789` parametresi olduğunu doğrula
2. `product.html?slug=stardew-valley` → Add to Cart → Checkout → Complete Purchase

**Doğrulama:**
- AdPair → Clicks → ilgili click kaydında `sub1 = post_789` görülmeli

---

### TEST-07 — Fraud Detection (Min Conversion Time)

**Hedef:** Click'ten hemen sonraki conversion'ı reject etmeli  
**Config:** Min conversion time = 10 saniye

**Adımlar:**
1. Yeni bir click_id ile doğrudan curl ile conversion ateşle (tarayıcıya bile gitme):
   ```bash
   curl -X POST https://adpair-staging-app-eyrvb.ondigitalocean.app/api/conversions/postback \
     -H "Content-Type: application/json" \
     -d '{"clickId":"clk_fraud_test_001","orderId":"VK-FRAUD-A","revenue":9.99,"currency":"USD"}'
   ```
   Bu click_id için hiç click kaydı yok — anında conversion denemesi fraud sayılmalı.
2. Alternatif: `index.html?click_id=clk_fraud_001` URL'ine git, beklemeden anında checkout → place order yap (< 10 saniye)

**Doğrulama:**
- AdPair → Conversions → `status = rejected` veya hata dönmeli
- Hata mesajı: "Minimum time between click and conversion not met" benzeri
- **Not:** Fraud koruması devre dışıysa bu test geçmez — önce config et

---

### TEST-08 — Returning Customer

**Hedef:** Returning customer'ın yeni müşteri bonusu almadığını doğrula

**Adımlar:**
1. `index.html?click_id=clk_returning_001&utm_source=google` → herhangi ürün → Checkout
2. "I have shopped at VaultKeys before" checkbox'ını **işaretle**
3. Complete Purchase

**Doğrulama:**
- Payload'da `customerStatus = returning` ✓
- Commission: Rule 3 (new customer bonus) uygulanmamalı
- Sadece base rule geçerli (ör: RPG → %10, kupon yoksa)

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
| AdPair endpoint | `GET /pixel` | `GET /conversions/postback` | `POST /conversions/postback` |

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
| Checkout debug banner'da click_id yok | URL'de `click_id` parametresi eksik | Yukarıdaki simüle URL'lerden birini kullan, `checkout.html?debug=1` ile doğrula |
| CORS hatası | API cross-origin | Beklenen — pixel ve GET metotlar çalışır, POST için CORS ayarı gerekebilir |
| `status 401` | Program ID / auth eksik | AdPair'e giriş yap, programı doğrula |
| `status 409` | Deduplication | Beklenen davranış ✓ |
| Commission yanlış | Kural sırası | AdPair → Rules → öncelik sırasını kontrol et |
| Fraud reject edilmedi | Config eksik | Settings → Fraud Protection → min_time = 10s ayarla |

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
│   ├── products.js     ← 15 oyun kataloğu
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
    &customer_status=new&coupon_code=DEALHUB10&product_category=rpg

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
  "productCategory": "rpg"
}

# Beklenen Response
{
  "data": {
    "conversionId": "conv_xyz",
    "commission": 4.80,
    "appliedRuleId": "rule_rpg",
    "isNewCustomer": true,
    "status": "pending"
  }
}
```
