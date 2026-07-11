---
name: gun-isle
description: Bir günün temiz transkriptini okuyup content/gunNN.json çalışma modülünü üretir. Kullanım: /gun-isle <günNo>
argument-hint: <günNo 1-30>
---

# Gün İşleme

Gün numarası: $ARGUMENTS (iki haneli kullan: 7 → 07).

## Adımlar
1. `wc -c data/transcripts/clean/gunNN.txt` ile boyutu öğren (içeriği OKUMADAN). Dosya yoksa dur; kullanıcıdan raw dosyayı koyup clean script'ini çalıştırmasını iste.
2. Dosyayı ~20.000 karakterlik dilimlerle SIRAYLA oku. Her dilimden şu ham notları çıkar:
   - Hocanın ezber şifreleri — KELİMESİ KELİMESİNE (örn. "GS-GB-Adanaspor", "A→B İstanbul", "12 HACERİM", "TİEM")
   - "Muhtemel soru adayı" / "çıkmış soru" / "MEB kitabında" uyarıları + varsa yıl bilgisi
   - İlk / tek / en kalıpları ve KARIŞTIRILAN çiftler (coğrafya ayrımları dahil: Orta Asya'da / Anadolu'da / Mısır'da ...)
   - Kurucu / en parlak dönem / unvan üçlüleri; savaş-antlaşma zincirleri ve tarihleri
   - Tanımı verilen her kavram (görevli, divan, sembol, vergi, eser, kurum)
   - Hocanın anlattığı sahne ve hikâyeler (zihin filmi kancası olarak tek cümleye özetlenecek)
3. TÜM dilimler bittikten sonra docs/icerik-sema.md şemasına göre content/gunNN.json'u TEK SEFERDE kur. Hedef adetler ve 7 kalite kuralı oradadır; hepsine uy.
4. Eksik kalan modül olursa (örn. eşleştirme çıkacak liste yoksa) sayı doldurma; az ama sağlam bırak ve raporda belirt.
5. content/index.json'a günü ekle. `pnpm validate:content` çalıştır; hata varsa düzelt.
6. Kısa rapor ver: modül başına adetler · meta.duzeltmeler listesi · hocanın en çok vurguladığı 5 nokta · kapsanamayan konu var mı · kullanıcıya /clear hatırlat.

## Yasaklar
- Bu skill dışında `data/transcripts/**` okunmaz.
- Transkriptte olmayan bilgi uydurulmaz (müfredat köprüsü istisnası: `(müfredat)` etiketi).
- Bu skill çalışırken uygulama koduna dokunulmaz.
