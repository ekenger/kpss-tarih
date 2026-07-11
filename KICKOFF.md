# Kurulum ve İlk Oturum

## Ön koşullar
- Node.js 18+ (öneri: 20 LTS), git, pnpm (`npm i -g pnpm`)
- Claude Code: `npm install -g @anthropic-ai/claude-code` → proje klasöründe `claude` yazıp hesabınla giriş yap.
  Güncel doküman: https://docs.claude.com/en/docs/claude-code/overview

## Adımlar
1. Bu starter klasörünü proje kökü yap: `git init && git add -A && git commit -m "starter"`
2. Transkriptler: Gün 2-4 zaten `data/transcripts/raw/` içinde. Yeni günler geldikçe `gunNN.txt` olarak buraya koy.
3. `node scripts/clean-transcript.mjs all`
4. `claude` başlat → `/model` ile Sonnet seç → aşağıdaki KICKOFF PROMPT'u yapıştır. Plan onayından sonra uygulasın.
5. İskelet bitip commit'lenince: `/clear` → `/model` en güçlü model → `/effort` yüksek → `/gun-isle 2` (sonra 3, sonra 4; her gün arasında `/clear`).

## KICKOFF PROMPT (kopyala-yapıştır)
Önce CLAUDE.md, docs/mimari.md ve docs/icerik-sema.md dosyalarını oku. Plan moduna geç, şu işin planını çıkar ve onayımdan sonra uygula:

1) docs/mimari.md'deki stack ve klasör yapısıyla uygulama iskeletini kur (Vite + React + TS strict + Tailwind + PWA + Zustand + Zod + Vitest, pnpm, ESLint/Prettier, GitHub Actions CI).
2) content/gunNN.json dosyalarını render eden 6 ekranı yap: gün seçici + kodlar (dokun-aç, Z/+ rozetli) + kartlar (çevir, bildim/tekrar, gün bazlı zayıf-kart takibi) + tuzak (anında geri bildirim, seri sayacı, yanlışları tekrar) + deneme (5 şık, anında açıklama, net = D − Y/4, sonunda kopyalanabilir "Gün N deneme — D:.. Y:.. Net:.." satırı, yanlışları tekrar çözme) + eşleştir (set seçici, çift bulma).
3) tools/tarih-tekrar-gun1.html içindeki script bölümündeki veri dizilerini (KODLAR, KARTLAR, TUZAK, DENEME, ESETS) docs/icerik-sema.md şemasına çevirerek content/gun01.json'a taşı; meta bloğunu ekle (gun:1, baslik:"İslamiyet Öncesi Türk Tarihi"); validate'ten geçir. HTML'in kalanına ihtiyaç yok.
4) src/lib/skor.ts ve zayıf-kart mantığı ile Zod şeması için Vitest testleri yaz; `pnpm validate:content` script'ini ekle.

Kabul kriterleri: `pnpm build` temiz; testler yeşil; gun01 altı ekranda da çalışıyor; PWA kurulabilir; Lighthouse erişilebilirlik ≥ 90.
Kısıtlar: data/transcripts/** okuma. Ders içeriğini bileşenlere gömme. Her mantıklı adımda küçük commit at.
