# İçerik Şeması (content/gunNN.json)

## TypeScript tipi
    export type Kaynak = "z" | "e";            // z = hocanın şifresi, e = eklenen kanca

    export interface Gun {
      meta: {
        gun: number;                           // 1..30
        baslik: string;                        // "İslamiyet Öncesi Türk Tarihi"
        ozet: string;                          // 1-2 cümle
        tahminiSoru: string;                   // "KPSS'de ~2-3 soru"
        duzeltmeler: string[];                 // transkriptte düzeltilen hatalar
      };
      kodlar: { b: string; i: { k: string; m: string; s: Kaynak }[] }[];  // b=grup başlığı, k=kod, m=anlam
      kartlar: { c: string; o: string; a: string }[];                     // c=kategori, o=ön, a=arka (\n serbest)
      tuzak:  { q: string; o: string[]; c: number; n: string }[];         // 2-3 şık, c=doğru idx, n=tuzak notu
      deneme: { q: string; o: [string,string,string,string,string]; c: 0|1|2|3|4; e: string }[];
      eslestir: { ad: string; p: [string, string][] }[];                  // set başına 6-8 çift
    }

## Hedef adetler (gün başına)
kodlar 30-45 · kartlar 70-90 (7-9 kategori) · tuzak 28-36 · deneme tam 20 · eslestir 4-6 set.
Kısa günlerde alt sınırlar yeterli; sayı doldurmak için sulandırma YASAK.

## Kalite kuralları
1. Hocanın her ezber şifresi ve her "muhtemel soru adayı / çıkmış soru / MEB kitabında" uyarısı MUTLAKA içeriğe girer (kodlar veya kartlar), `s:"z"` etiketiyle ve varsa çıkmış yıl bilgisiyle.
2. Birbirine karışan çiftler (ilk/tek/en, benzer isimler, coğrafya ayrımları) tuzak bölümüne ikili soru olarak yazılır; `n` alanı tuzağın NEDEN tuzak olduğunu tek cümlede söyler.
3. Deneme: ÖSYM üslubu; 5 şık, tek doğru; öncüllü (I-II-III), "hangisi değildir / gösterilemez", paragraf-yorum kalıpları karıştırılır; her soru 1 cümlelik açıklama taşır; şıklar aynı gramer yapısındadır.
4. Transkriptte OLMAYAN bilgi eklenmez. İstisna: standart müfredat köprüsü zorunluysa kartın sonuna `(müfredat)` etiketi konur.
5. Tactiq bozulmaları düzeltilir (ör. "Cabir bin Hayyam" → Câbir bin Hayyân) ve meta.duzeltmeler'e yazılır. Emin olunamayan isim/tarih DENEMEYE KONMAZ.
6. Kartlar aktif hatırlama için yazılır: ön yüz SORU biçiminde, arka yüz ≤ 5 satır.
7. Aynı bilgi en fazla 2 modülde görünür; tekrar iyidir, kopyala-yapıştır şişkinliği kötüdür.
