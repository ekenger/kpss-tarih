export const M = {
  // Genel
  yakinda: 'Yakında',
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
    '"Tekrar" dediğin kart Zayıflar destesine düşer ve peşini bırakmaz.',
  tumKartlar: 'Tümü',
  zayiflar: 'Zayıflar',
  zayifYok: 'Zayıf kartın yok — Tuzak Avı söylesin.',
  kategoriYok: 'Bu kategoride kart yok.',
  // Tuzak
  tuzakAciklama: "ÖSYM'nin en sevdiği yer: birbirine benzeyen iki bilgi.",
  tuzakTemiz: 'Tertemiz. Bu refleksle bu üniteden soru kaçmaz.',
  tuzakYanlis: (n: number) =>
    `${n} tuzağa düştün. Düştüğün yer, sınavda kaybedeceğin yerdir — hemen kapat.`,
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
} as const
