# Mimari

## Stack ve gerekçe
- **Vite + React 18 + TypeScript (strict)**: içerik odaklı, tamamen istemci taraflı interaktif uygulama; SSR/SEO ihtiyacı yok.
- **PWA (vite-plugin-pwa)**: çevrimdışı çalışma (yolda tekrar senaryosu) + telefona kurulabilirlik.
- **Tailwind CSS**: tema token'ları tailwind.config'te; koyu "bozkır" teması varsayılan.
- **Zustand**: küçük, boilerplate'siz global state (aktif gün, oturum skorları).
- **Zod**: content/*.json çalışma zamanı doğrulaması + `pnpm validate:content`.
- **Vitest + Testing Library**: skorlama (net = D − Y/4), zayıf-kart mantığı, şema testleri.
- **pnpm**, ESLint + Prettier, GitHub Actions CI (typecheck + test + build).

Neden Next.js değil: SEO'suz, sunucusuz bir çalışma aracı için gereksiz katman. İleride hesap/senkron gerekirse iki yol var: (a) Supabase eklemek (SPA kalır), (b) Next'e taşımak — bileşenler saf React olduğundan taşıma ucuzdur. Karar o gün verilir (YAGNI).

## Klasör yapısı
    ├─ CLAUDE.md
    ├─ docs/                      # mimari, şema, pipeline
    ├─ .claude/skills/gun-isle/   # gün işleme komutu
    ├─ data/transcripts/raw/      # gunNN.txt (tactiq ham çıktısı)
    ├─ data/transcripts/clean/    # script çıktısı (zaman damgasız)
    ├─ scripts/clean-transcript.mjs
    ├─ content/                   # gunNN.json + index.json (uygulamanın okuduğu TEK yer)
    ├─ tools/                     # tarih-tekrar-gun1.html (eski monolit; Gün 1 verisi buradan taşınır)
    └─ src/
       ├─ app/                    # router, layout, tema
       ├─ features/gunler|kodlar|kartlar|tuzak|deneme|eslestir
       ├─ lib/content.ts | storage.ts | skor.ts | metin.ts
       └─ store/

## Temel davranışlar
- Gün seçici: content/index.json'daki günleri listeler; işlenmemiş günler "yakında" görünür.
- Zayıf kartlar gün bazında saklanır: anahtar `zt_gun{n}` (eski monolitle uyumlu).
- Deneme sonunda kopyalanabilir rapor satırı: `Gün N deneme — D:.. Y:.. Net:..`
- Erişilebilirlik: tüm etkileşimler klavyeyle yapılabilir; dokunma hedefleri ≥44px; prefers-reduced-motion desteklenir.
