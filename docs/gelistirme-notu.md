# Geliştirme Notu — Çok-Gözlü Değerlendirme (2026-07-17)

Sistemin olgun bir sürümüne altı ayrı uzman gözünden bakıldı. Amaç övgü değil,
her birinin **koda dayalı** somut bir kusura parmak basması ve sonunda ortak bir
tezde buluşması. Bu not, o buluşmayı ve yol haritasını kayıt altına alır.

## Uzman bakışları

- **🧠 Öğrenme bilimci (SRS).** Leitner temiz: `Kartlar` ve `Tuzak` cevabı
  `derecelendir` ile belleğe yazıyor. Ama en güçlü ölçme aracı — **deneme —
  belleğe hiç dokunmuyordu**. Karışık deneme bitince yalnız `denemeKaydet` +
  `seriGuncelle` çağrılıyordu; yanlış yapılan soru ilgili maddeyi 1. kutuya
  düşürmüyordu. Test etkisi (retrieval practice) boşa gidiyordu.
- **🎯 KPSS öğretmeni.** Hazırlık skoru konuyu sınav ağırlığıyla tartıyor
  (`hazirlik.ts`), ama karışık deneme bu zekayı kullanmıyordu: havuzdan **saf
  rastgele 20 soru** (`karistir(havuz).slice(0,20)`) çekiyordu. Zaten hesaplı
  duran öncelik sırası görmezden geliniyordu.
- **🎓 Öğrenci.** Karışık deneme sonunda yanlışın hangi konu olduğuna
  gidilemiyordu (gün-içi Tuzak/Deneme'de "yanlışları çöz" varken). Seri bir
  boşlukta doğrudan 1'e sıfırlanıyor — ceza motive etmiyor. Cihaz değişince /
  geçmiş temizlenince 30 günlük her şey gidiyor (yedek yok).
- **🎨 Ürün/UX.** "En çok net kazandıran" listesi + hazırlık halkası hem
  `Bugun` hem `Ilerleme`'de neredeyse aynı JSX ile iki kez duruyor → tek
  bileşene çıkmalı.
- **🏗️ Mimar (kalıcılık).** `ilerleme.ts` tek `zt_v2` anahtarında tiplenmiş,
  `try/catch` sessiz desen sağlam. Ama tümü localStorage, tek cihaz, **yedeksiz**
  — bir "geçmişi temizle" uzaklıkta kaybolur.
- **♿ Erişilebilirlik.** Kart çevirme klavye+ARIA ile erişilebilir, hedefler
  48px. Zayıf nokta: İlerleme ısı haritası ustalığı **yalnız renkle** kodluyor
  (renk körü ayırt edemez).

## Ortak tez — "Döngü sızdırıyor"

İki iyi motor var — **SRS belleği** ve **ağırlıklı hazırlık modeli** — ama tam
kapalı bir döngüye bağlı değildi:

> Ölç → belleğe yaz → önceliği güncelle → sıradaki çalışmayı ona göre servis et → tekrar ölç.

Halkalar kopuktu: gün-içi çalışma belleğe yazıyor ✅, **deneme ölçümü belleğe
yazmıyor** ❌, **öncelik bilgisi denemeye geri dönmüyor** ❌.

## Yol haritası

1. **Denemeyi döngüye bağla — [UYGULANDI]**
   Deneme sorusu artık birinci-sınıf SRS öğesi (`tur: 'deneme'`, kimlik
   `d{gun}:hash(q)`). Hem gün-içi hem karışık deneme her cevabı belleğe yazar
   (yanlış → 1. kutu, doğru → +1). Karışık deneme sorularını **öncelik-ağırlıklı**
   çeker (`agirlikliOrneklem`). Sonuç ekranında yanlışlardan ilgili güne atlanır.
   Vadesi gelen deneme soruları Bugün'ün tekrar akışında da çıkar (yetim SRS
   kaydı kalmaz). `toplamMadde` artık deneme'yi de kapsar → hazırlık skoru üç
   pratik türünü de yansıtır.
2. **Emniyet + geri dönüş — [UYGULANDI]**
   İlerleme ekranında **Verilerim & Yedek** paneli: tüm `zt*` verisini tek JSON
   dosyasına indirir; doğrulamalı geri yükleme (yabancı/bozuk yedek reddedilir,
   depoyu bozmaz) sonrası sayfa yenilenir. Seriye **1 günlük dondurma toleransı**:
   tek gün kaçırılırsa (fark 2) seri bir kez affedilir; ikinci ardışık boşluk
   sıfırlar, temiz gün toleransı tazeler (`seriGuncelle`). Bugün ekranında, tek
   gün kaçırılıp tolerans hakkı dururken "bugün çalış, serin bozulmasın" nudge'ı.
3. **Erişilebilirlik — [UYGULANDI]**
   Isı haritası ustalığı artık yalnız renkle değil: her karede **ustalık %'si
   yazılı** (renk-dışı redundant sinyal, WCAG 1.4.1). Her kareye ve öncelik
   listesindeki her satıra düzgün `aria-label` (gün + konu + ustalık % + ağırlık);
   yalnız-görsel çubuklar/rozetler `aria-hidden` ile ekran okuyucudan gizlendi.
4. **(Düşük öncelik)** Sabit Leitner aralıkları yerine madde-başı zorlukla
   adaptif aralık (SM-2 / FSRS-lite).
