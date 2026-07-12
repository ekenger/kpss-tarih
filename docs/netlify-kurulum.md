# Netlify ile Yayına Alma — Adım Adım

Bu proje bir Vite SPA. Netlify'e **GitHub üzerinden** bağladığımızda, her
`git push` sonrası Netlify otomatik build alıp siteyi günceller. Yani **her günü
işleyip pushladığında site kendiliğinden senkron olur** — ekstra bir şey yapman
gerekmez.

> ⚠️ **Telif notu:** Transkriptler üçüncü şahsın (Ekspres Tarih) ders
> anlatımından türetilmiş. Bu yüzden:
> - GitHub reposu **private** olacak.
> - Ham transkriptler `.gitignore` ile repodan dışlandı (`data/transcripts/`).
>   Bunlar zaten build'de kullanılmıyor; siteye yalnız `content/*.json` gidiyor.
> - Siteyi kişisel çalışman için kullan; herkese açık paylaşmadan önce hak
>   sahibinden izin al.

---

## Hazırlık (bu repoda zaten yapıldı)

Aşağıdaki dosyalar eklendi, sen tekrar oluşturmana gerek yok:

- `netlify.toml` — build komutu (`pnpm build`), yayın klasörü (`dist`), Node 20,
  SPA yönlendirmesi.
- `public/_redirects` — SPA fallback (tüm yollar `index.html`'e düşer).
- `.gitignore` — `data/transcripts/` ve `.netlify/` dışlandı.

---

## Bölüm 1 — GitHub'a repo bağla (bir kereye mahsus)

Şu an bu klasörün bir git remote'u yok. Önce GitHub'da **private** bir repo açıp
bağlayacağız.

### 1.1 GitHub'da boş repo aç
1. https://github.com/new adresine git.
2. **Repository name:** `kpss-tarih-kamp` (istediğin isim).
3. **Private** seç. (Telif için önemli.)
4. README/gitignore/license **ekleme** — boş bırak (bizde zaten var).
5. **Create repository**.

### 1.2 Yerelden pushla
GitHub sana repo URL'sini verir. Terminalde (bu klasörde):

```bash
# Henüz commit'lenmemiş yeni dosyaları da ekle
git add -A
git commit -m "chore: netlify config + gun02..gun17 içerik"

# GitHub reposunu remote olarak ekle (URL'yi kendi reponla değiştir)
git remote add origin https://github.com/KULLANICI-ADIN/kpss-tarih-kamp.git

# master dalını pushla
git push -u origin master
```

> İlk push'ta GitHub kullanıcı adı/şifre yerine **Personal Access Token** ister.
> Alternatif: GitHub Desktop uygulaması ile "Add local repository" → "Publish"
> yaparak tek tıkla halledebilirsin (token uğraşı olmaz).

---

## Bölüm 2 — Netlify'e bağla (bir kereye mahsus)

1. https://app.netlify.com → **Sign up** (GitHub hesabınla giriş yapman en
   kolayı).
2. **Add new site → Import an existing project**.
3. **Deploy with GitHub** → yetki ver → `kpss-tarih-kamp` reposunu seç.
4. Build ayarları otomatik `netlify.toml`'dan okunur; yine de kontrol et:
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist`
5. **Deploy site** de. İlk build ~1-2 dakika sürer.
6. Bitince sana `https://rastgele-isim.netlify.app` gibi bir adres verir.
   İstersen **Site configuration → Change site name** ile
   `kpss-tarih-kamp.netlify.app` yaparsın.

Artık site canlı. 🎉

---

## Bölüm 3 — Otomatik senkron: her günü işledikçe

Bağlantı kurulduktan sonra iş akışın şu:

```bash
# 1. Günü işle (transkriptten içerik üret)
/gun-isle 18

# 2. İçeriği doğrula
pnpm validate:content

# 3. Değişiklikleri commit'le
git add content/gun18.json content/index.json
git commit -m "içerik: gun18"

# 4. Pushla → Netlify otomatik build alır ve siteyi günceller
git push
```

Push'tan ~1-2 dakika sonra site güncellenir. Netlify panelinde **Deploys**
sekmesinden ilerlemeyi canlı izleyebilirsin. Yeşil "Published" görünce yayında.

> **Neden otomatik?** Netlify repoyu izler; `master` dalına her push geldiğinde
> `pnpm build` çalıştırıp `dist/` çıktısını yayınlar. Senin ekstra komut
> çalıştırmana gerek yok — sadece `git push`.

### Küçük ipucu: tek satırda
Her gün aynı 3 komutu yazmamak için:

```bash
git add content/ && git commit -m "içerik: gun18" && git push
```

---

## Bölüm 4 (opsiyonel) — GitHub'sız hızlı deploy: Netlify CLI

GitHub'a hiç bağlamadan, elle deploy etmek istersen:

```bash
# CLI'yi bir kez kur
npm install -g netlify-cli

# Giriş yap (tarayıcı açılır)
netlify login

# Bu klasörü bir Netlify site'ına bağla (ilk sefer)
netlify init      # veya mevcut siteye: netlify link

# Yayına al
pnpm build
netlify deploy --prod
```

Ama bu **manuel** — her gün `netlify deploy --prod` demen gerekir. Otomatik
senkron istediğin için **Bölüm 1-3'teki GitHub yolu tavsiye edilir.**

---

## Sorun Giderme

| Belirti | Çözüm |
|---|---|
| Build "pnpm not found" | `netlify.toml` var mı kontrol et; `pnpm-lock.yaml` repoda mı? İkisi de pushlanmış olmalı. |
| Build TypeScript hatası | Yerelde `pnpm build` çalıştır, hatayı düzelt, tekrar pushla. Netlify yereldeki ile aynı komutu koşar. |
| Sayfa yenileyince 404 | `public/_redirects` ve `netlify.toml`'daki redirect kuralı repoda mı? SPA fallback bunlar sağlıyor. |
| Node sürüm hatası | `netlify.toml → NODE_VERSION` değerini yükselt (örn. `"22"`). |
| İçerik güncellenmedi | Netlify **Deploys** sekmesinde son deploy "Published" mı? Değilse log'a bak. Tarayıcıda hard refresh (Ctrl+Shift+R) — PWA cache olabilir. |
| Deploy tetiklenmedi | Push gerçekten `master`'a mı gitti? `git log origin/master` ile kontrol et. |

---

## Özet akış şeması

```
Gün işle → validate → git commit → git push
                                       │
                                       ▼
                             Netlify otomatik build
                                       │
                                       ▼
                         kpss-tarih-kamp.netlify.app güncellenir
```
