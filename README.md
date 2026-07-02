# 👁️ ThreadStalk

Threads için viral analiz aracı (site dili: İngilizce) — iki özellik:

1. **Who's Stalking You?** (`/stalkers/[handle]`) — son 90 günün herkese açık
   etkileşimlerini (mention ×3, alıntı ×2, yanıt ×1, son 30 gün ×1.5) skorlar,
   en yüksek 24 hesabı threadscircle tarzı bir "etkileşim çemberi" olarak
   gösterir (merkez: kullanıcı, iç halka 8, dış halka 16). Arka plan rengi
   seçilebilir. Uydurma isim göstermez; kartta zorunlu dürüstlük ibaresi vardır.
2. **Threads Personality Test** (`/personality/[handle]`) — son paylaşımları
   Claude'a (model: `claude-haiku-4-5`, test başına ~0,4 cent) gönderir;
   postların dilinde 10 eğlenceli arketipten birini + açıklama + 3 parafraze
   "kanıt" döner.

## Stack

- Next.js 14 (App Router, SSR) + TypeScript + Tailwind CSS
- Veri: [ScrapeCreators](https://scrapecreators.com) Threads API
- LLM: Anthropic Claude (`@anthropic-ai/sdk`)
- Cache: Supabase Postgres (24 saat, opsiyonel — yoksa in-memory)
- Kart görseli: html2canvas (PNG export) + `next/og` (sosyal önizleme)
- Avatar proxy: `/api/img` (Instagram CDN CORS vermediği için PNG export'a gerekli)

## Kurulum

```bash
npm install
cp .env.example .env.local   # anahtarları doldur
npm run dev
```

API anahtarı olmadan UI geliştirmek için `.env.local` içinde `MOCK_DATA=true`
yap — tüm sayfalar sahte veriyle çalışır.

## Supabase cache tablosu

Supabase projesi açtıktan sonra SQL editöründe çalıştır:

```sql
create table if not exists result_cache (
  key text primary key,
  value jsonb not null,
  expires_at timestamptz not null
);
```

`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` tanımlı değilse uygulama
in-memory cache ile çalışır (dev için yeterli; serverless'ta kalıcı değildir).

## Vercel'e deploy

1. Repo'yu GitHub'a pushla, Vercel'de "Import Project" ile seç.
2. Environment Variables bölümüne şunları ekle:
   - `SCRAPECREATORS_API_KEY` (zorunlu)
   - `ANTHROPIC_API_KEY` (kişilik testi için zorunlu)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (önerilir)
   - `NEXT_PUBLIC_SITE_URL` = `https://alan-adin.com`
   - `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_RESULT`,
     `NEXT_PUBLIC_ADSENSE_SLOT_LANDING` (AdSense onayından sonra)
3. Deploy — otomatik HTTPS + her sonucun kendi indexlenebilir URL'i.

## AdSense notları

- Onay başvurusundan önce sitede gizlilik politikası (`/privacy`),
  hakkımızda (`/about`) ve iletişim (`/contact`) sayfaları hazır.
- `NEXT_PUBLIC_ADSENSE_CLIENT` boş bırakıldığı sürece hiçbir reklam kodu
  yüklenmez; onay gelince env değişkenini doldurman yeterli.
- Kendi reklamlarına tıklama / tıklatma — hesap banı sebebidir.

## Dosya haritası

```
src/lib/threads.ts      ScrapeCreators istemcisi (429/timeout/retry + mock)
src/lib/score.ts        Stalker skorlama (puanlar + 30 gün ağırlığı)
src/lib/stalkers.ts     Stalker analiz orkestrasyonu + cache
src/lib/personality.ts  Claude entegrasyonu + cache
src/lib/cache.ts        Supabase / in-memory 24s cache
src/components/Circle.tsx    Etkileşim çemberi görselleştirmesi
src/components/ColorCard.tsx Arka plan rengi seçilebilen kart kabuğu
src/app/...             Sayfalar, OG görseli, avatar proxy, robots, sitemap
```
