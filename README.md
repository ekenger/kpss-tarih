# KPSS Tarih Kamp

KPSS tarih konularını **gün gün tekrar** etmek için geliştirilmiş bir çalışma
uygulaması (PWA). Her günün içeriği altı farklı çalışma modunda sunulur.

## Çalışma modları

- **Kodlar** — dokun-aç kod/ipucu kartları (Z / + rozetli)
- **Kartlar** — çevir, "bildim / tekrar" işaretle, gün bazlı zayıf-kart takibi
- **Tuzak** — anında geri bildirimli tuzak soruları, seri sayacı, yanlışları tekrar
- **Deneme** — 5 şıklı test, anında açıklama, net = D − Y/4, kopyalanabilir sonuç satırı
- **Eşleştir** — set seçici ile çift bulma
- **Gün seçici** — içeriği güne göre gezinme

## Teknoloji

Vite + React + TypeScript (strict) + Tailwind + Zustand + Zod + Vitest, PWA
(kurulabilir, çevrimdışı). Paket yöneticisi: pnpm.

## Geliştirme

```bash
pnpm install
pnpm dev              # yerel geliştirme sunucusu
pnpm build            # tsc + vite build
pnpm test             # Vitest
pnpm validate:content # content/gunNN.json şema doğrulaması
```

İçerik `content/gunNN.json` dosyalarında tutulur; şema `docs/icerik-sema.md`
içinde tanımlıdır. Ders içeriği bileşenlere gömülmez, veri olarak yüklenir.
