export const M = {
  // Genel
  yakinda: 'Yakında',
  baslanmadi: 'Başlanmadı',
  gunlerAciklama: '30 günlük seri — bir güne gir, modülleri çalış.',
  hepsiniAc: 'Hepsini aç / kapat',
  bildim: '✔ Bildim',
  tekrar: '✖ Tekrar',
  bastan: 'Baştan',
  sonraki: 'Sonraki',
  bitir: 'Bitir',
  yanlislariCoz: 'Yanlışları tekrar çöz',
  // Kodlar
  kodlarAciklama:
    "Önce kancaları yükle: koda dokunmadan anlamını içinden söyle, sonra açıp kontrol et. Z = hocanın şifresi, + = eklenen kanca.",
  // Kartlar
  kartlarAciklama:
    'Önce cevabı hatırla, sonra çevir. "Bildim" kartı bir üst kutuya taşır (daha seyrek çıkar), "Unuttum" 1. kutuya indirir. Vadeli tekrarlar Bugün sekmesinde.',
  tumKartlar: 'Tümü',
  zayiflar: 'Zayıflar',
  zayifYok: 'Zayıf kartın yok — Tuzak Avı söylesin.',
  kategoriYok: 'Bu kategoride kart yok.',
  // Tuzak
  tuzakAciklama: "ÖSYM'nin en sevdiği yer: birbirine benzeyen iki bilgi.",
  tuzakTemiz: 'Tertemiz. Bu refleksle bu üniteden soru kaçmaz.',
  tuzakYanlis: (n: number) =>
    `${n} tuzağa düştün. Düştüğün yer, sınavda kaybedeceğin yerdir — hemen kapat.`,
  tuzakKlavye: 'Klavye: 1 / 2 / 3 ile cevapla · Enter veya → ile ilerle. Şıklar her turda karışır.',
  // Deneme
  denemeAciklama: 'Net = Doğru − Yanlış / 4. Bitince netini not et.',
  cevap: 'Cevap',
  // Eşleştir
  eslestirAciklama: 'En hızlı unutulan listeler burada. İki kutuya dokun, eşini bul.',
  setBitti: '✔ Set bitti — üstteki çiplerden sıradaki sete geç.',
  eslenme: (bulunan: number, toplam: number) => `${bulunan} / ${toplam} eş bulundu`,
  // Skor
  kopya: (gun: number, d: number, y: number, net: string) =>
    `Gün ${gun} deneme — D:${d} Y:${y} Net:${net}`,
  kopyalandı: 'Kopyalandı!',
  // SRS / Kartlar derecelendirme
  unuttum: '✖ Unuttum',
  hatirla: 'Önce hatırla, sonra çevir',
  cevir: 'Çevir',
  kutu: (n: number) => `Kutu ${n}`,
  // Bugün
  bugunAciklama:
    'Aralıklı tekrar: unutma eğrisine göre bugün vadesi gelen kartlar. Az ve düzenli, çok ve seyrekten iyidir.',
  bugunSayac: (n: number) =>
    n === 0 ? 'Bugün vadesi gelen kart yok — tertemizsin.' : `Bugün ${n} kart seni bekliyor.`,
  bugunBitti: 'Bugünlük tekrar bitti. Yarın yenileri gelecek.',
  bugunTekrarBaslik: 'Bugünkü Tekrar',
  bugunHicYok:
    'Henüz tekrar destesi boş. Bir güne girip Kartlar ve Tuzak çalıştıkça buraya vadeli tekrarlar düşer.',
  statOgrenilen: 'ÇALIŞILAN',
  statUsta: 'USTALAŞILAN',
  statOrtKutu: 'ORT. KUTU',
  // Sınav Hazırlık Skoru
  hazirlikBaslik: 'Sınav Hazırlığı',
  hazirlikTahmini: 'tahmini · konu ağırlıklı',
  hazirlikKapsam: (n: number) => `kapsam %${n}`,
  hazirlikOlcemiyor: 'Henüz ölçemiyorum. Aşağıdaki ağırlıklı konulardan başla — birkaç kart yeter.',
  netKazandiran: 'En çok net kazandıracak konular',
  netKazandiranAlt: 'Ağırlığı yüksek ama henüz zayıf — buraya çalışmak en çok net getirir.',
  soruAgirlik: (n: number) => `~${n} soru`,
  konuTamam: 'Ağırlıklı konularda iyi durumdasın 👏',
  karisikBaslik: 'Karışık Deneme',
  karisikAciklama:
    'Tüm günlerden harmanlanmış sorular. Konuları karıştırmak (interleaving) kalıcılığı artırır.',
  karisikBaslat: (n: number) => `${n} soruluk karışık deneme başlat`,
  karisikYanlisBaslik: 'Yanlışların — konusuna git',
  karisikYanlisYok: 'Hiç yanlışın yok — tertemiz 👏',
  guneGit: (g: number) => `Gün ${g}`,
  yukleniyor: 'Yükleniyor…',
  // İlerleme
  ilerlemeAciklama: 'Nerede güçlü, nerede zayıfsın — ve serini koru.',
  seriBaslik: 'Çalışma Serisi',
  seriGun: (n: number) => (n === 1 ? '1 gün' : `${n} gün`),
  seriBugun: 'Bugün çalıştın ✓',
  seriBekliyor: 'Bugün henüz çalışmadın',
  seriTolerans: 'Bir günü kaçırdın ama tolerans hakkın duruyor — bugün çalış, serin bozulmasın.',
  // Yedekleme
  yedekBaslik: 'Verilerim & Yedek',
  yedekAciklama: 'İlerlemen yalnız bu cihazın tarayıcı belleğinde tutulur. Cihaz/telefon değişince ya da geçmişi temizleyince kaybolmasın diye ara ara yedek al.',
  yedekIndir: '↓ Yedek indir (JSON)',
  yedekYukle: '↑ Yedekten geri yükle',
  yedekBasarili: (n: number) => `${n} kayıt geri yüklendi. Sayfa yenileniyor…`,
  skorBaslik: 'Deneme Netleri',
  skorYok: 'Henüz deneme çözmedin. Deneme veya Karışık Deneme çöz, netlerin burada birikir.',
  isiBaslik: 'Konu Isı Haritası',
  isiAciklama: 'Her karede ustalık %’si yazılı; renk aynı bilgiyi pekiştirir. Yüksek = o günü iyi biliyorsun.',
  isiYok: 'Kart çalıştıkça günler burada renklenecek.',
  karistirBaslik: 'En Çok Karıştırdıkların',
  karistirYok: 'Sık takıldığın bir kart yok — güzel.',
} as const
