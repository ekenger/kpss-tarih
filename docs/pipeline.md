# Gün İşleme Pipeline'ı

## Günlük akış (yeni video bittiğinde)
1. Tactiq çıktısını `data/transcripts/raw/gunNN.txt` olarak kaydet (NN = 01..30, iki haneli).
2. `node scripts/clean-transcript.mjs NN` → clean/ dosyası oluşur (~%30 küçülür).
3. Claude Code'da: `/clear` → `/model` (içerik modeli) → `/effort` yüksek → `/gun-isle NN`
4. Skill sonunda `pnpm validate:content` çalışmış olur; `pnpm dev` ile göz kontrolü yap.
5. Commit: `content: gunNN eklendi`. Ardından `/clear`.

## Okuma stratejisi (skill içinde uygulanır)
- Clean dosya ~20.000 karakterlik dilimlerle SIRAYLA okunur (offset/limit).
- Her dilimden ham not çıkarılır; JSON EN SONDA tek seferde kurulur (dilim başına yazmak tutarsızlık üretir).

## Model / effort önerisi
| İş | Model | Effort |
|---|---|---|
| /gun-isle içerik üretimi | Ulaşılabilen en güçlü (Opus sınıfı) | Yüksek |
| Uygulama iskeleti, feature kodu | Sonnet | Varsayılan |
| Küçük düzeltme / refactor | Sonnet | Düşük |

Gerekçe: içerik = ürün; kötü bir çeldirici sınavda net kaybettirir. Kod tarafı standart SPA işidir, Sonnet fazlasıyla yeter. Maliyeti `/cost` ile izle; uzayan oturumda mümkünse `/compact` yerine `/clear` tercih et.

## Belirsizlik prosedürü
- İsim/tarih transkriptte bozuksa ve doğrusu kesin bilinmiyorsa: karta "(kontrol et)" etiketiyle yaz, denemeye koyma, meta.duzeltmeler'e not düş.
- Hocanın verdiği bilgi yaygın kaynaklarla çelişiyorsa: hocanın versiyonu esas alınır, karta tek satırlık "bazı kaynaklarda ..." notu eklenir.
