# KPSS Tarih Kampı — Çalışma Uygulaması

Zeki Hoca'nın 30 günlük tarih kampı transkriptlerinden gün gün interaktif çalışma modülleri (kod defteri, kartlar, tuzak avı, deneme, eşleştirme) üreten React uygulaması.

## Mimari özeti (detay: docs/mimari.md)
- Vite + React 18 + TypeScript (strict) + Tailwind. SPA + PWA (offline çalışır).
- State: Zustand · Şema doğrulama: Zod · Test: Vitest · Paket: pnpm.
- İçerik tek doğruluk kaynağı: `content/gunNN.json`. Ders içeriği ASLA bileşenlere gömülmez.
- Kalıcı veri (zayıf kartlar, skorlar): `src/lib/storage.ts` arayüzü üzerinden localStorage; ileride API'ye takılabilir.

## Komutlar
- `pnpm dev` / `pnpm build` / `pnpm test` / `pnpm lint`
- `node scripts/clean-transcript.mjs <n|all>` → raw transkripti temizler
- `pnpm validate:content` → content/*.json Zod şema kontrolü

## TOKEN KURALLARI — kritik
1. `data/transcripts/**` ASLA kendiliğinden okunmaz; sadece /gun-isle çalışırken, sadece ilgili günün `clean/` dosyası, ~20k karakterlik dilimlerle okunur.
2. `content/*.json` düzenlenirken dosyanın tamamı okunmaz; şema docs/icerik-sema.md'den bilinir, yalnız ilgili blok okunur/yazılır.
3. Grep/Glob `data/` ve `content/` klasörlerinde çalıştırılmaz.
4. Bir günün işi bitince kullanıcıya `/clear` hatırlatılır.
5. Uygulama koduna dokunurken transkriptlere hiç dokunulmaz; içerik üretirken uygulama koduna hiç dokunulmaz.

## İçerik şeması ve kalite çıtası
docs/icerik-sema.md — 5 modül + meta bloğu, hedef adetler, 7 kalite kuralı. Kaynak etiketi: `"z"` hocanın şifresi, `"e"` eklenen kanca.

## Kod sözleşmeleri
- Feature klasörleri: `src/features/{gunler,kodlar,kartlar,tuzak,deneme,eslestir}`
- Bileşenler saf; veri erişimi `src/lib/content.ts` üzerinden (gün başına lazy import).
- Türkçe UI metinleri `src/lib/metin.ts` içinde toplanır.
- Commit'ler küçük ve tek amaçlı; her feature değişikliğinde ilgili test güncellenir.

## İçerik hakları
Transkriptler üçüncü şahsın (Ekspres Tarih) ders anlatımından türetilmiştir. Kişisel çalışma amaçlıdır; yayına/ticarete çıkarmadan önce hak sahibinden izin şarttır.
