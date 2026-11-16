// Page help shown behind the "?" button next to each page title. Written for
// someone new to SEO: what the page is for, how to use it, and the terms it
// uses.

export type PageHelpTopic =
  | "dashboard"
  | "audit"
  | "gsc"
  | "keywords"
  | "backlinks"
  | "saved"
  | "reports"
  | "context"
  | "agent"
  | "settings"
  | "projectSettings"
  | "projects";

export type PageHelp = {
  title: string;
  /** What the page is for, in one or two sentences. */
  summary: string;
  /** Step-by-step use. */
  steps?: string[];
  /** Terms the page uses, with plain explanations. */
  terms?: { term: string; meaning: string }[];
  /** One practical tip. */
  tip?: string;
};

export const PAGE_HELP: Record<PageHelpTopic, PageHelp> = {
  dashboard: {
    title: "Pano",
    summary:
      "Sitenin genel durumunu tek ekranda gösterir: Google'da kaç kişi seni gördü, kaç kişi tıkladı, sitende kaç sorun var ve yeni hangi aramalarda çıkmaya başladın.",
    steps: [
      "İlk kez kullanıyorsan önce Proje ayarları'ndan sitenin adresini yaz.",
      "Google Search Console kartından Google hesabını bağla. Gerçek verilerin buradan gelir.",
      "Site denetimi çalıştır; sağlık puanı ve sorun sayısı panoya gelir.",
      "Haftada bir panoya bakıp değişimleri takip et.",
    ],
    terms: [
      {
        term: "Gösterim",
        meaning:
          "Sitenin Google sonuçlarında kaç kez göründüğü. Kişi tıklamasa da sayılır.",
      },
      { term: "Tıklama", meaning: "Google sonuçlarından sitene gelen ziyaret." },
      {
        term: "Tıklama oranı (CTR)",
        meaning:
          "Görenlerin yüzde kaçının tıkladığı. Düşükse başlık ve açıklamanı daha çekici yazmalısın.",
      },
      {
        term: "Ortalama pozisyon",
        meaning:
          "Google'da kaçıncı sırada çıktığın. 1 en üst demek; 10'dan büyükse ilk sayfada değilsin.",
      },
    ],
    tip: "SEO sonuçları yavaş gelir. Bir değişikliğin etkisini görmek için genellikle 2-6 hafta beklemek gerekir.",
  },
  audit: {
    title: "Site Denetimi",
    summary:
      "Sitendeki sayfaları bir arama motoru gibi tek tek gezer ve Google'ın seni anlamasını ya da sıralamasını zorlaştıran teknik sorunları bulur.",
    steps: [
      "Sitenin ana sayfa adresini yaz ve denetimi başlat.",
      "Bitince sorunlar önem sırasına göre listelenir: önce kırmızı (kritik) olanları düzelt.",
      "Bir soruna tıklayınca hangi sayfalarda olduğunu görürsün.",
      "Düzelttikten sonra denetimi tekrar çalıştırıp sorunun gittiğini kontrol et.",
    ],
    terms: [
      {
        term: "Tarama (crawl)",
        meaning:
          "Programın sitendeki linkleri takip ederek sayfaları tek tek açması. Google da siteni böyle tanır.",
      },
      {
        term: "Başlık (title)",
        meaning:
          "Google sonuçlarında mavi büyük yazıyla görünen sayfa adı. Her sayfada farklı ve 50-60 karakter olmalı.",
      },
      {
        term: "Meta açıklama",
        meaning:
          "Google sonuçlarında başlığın altındaki gri açıklama. Tıklamayı artırır, 120-155 karakter idealdir.",
      },
      {
        term: "H1",
        meaning: "Sayfanın ana başlığı. Her sayfada bir tane olmalı.",
      },
      {
        term: "Kırık link (404)",
        meaning:
          "Artık var olmayan bir sayfaya giden link. Ziyaretçiyi ve Google'ı çıkmaza sokar.",
      },
      {
        term: "Yönlendirme (301/302)",
        meaning:
          "Bir adresin başka bir adrese gönderilmesi. Zincir halinde çok yönlendirme siteyi yavaşlatır.",
      },
      {
        term: "Canonical",
        meaning:
          "Aynı içerik birden çok adreste varsa, Google'a hangisinin asıl olduğunu söyleyen etiket.",
      },
      {
        term: "Noindex",
        meaning:
          "Google'a 'bu sayfayı arama sonuçlarında gösterme' diyen etiket. Yanlışlıkla eklenirse sayfa Google'dan kaybolur.",
      },
      {
        term: "Sitemap (site haritası)",
        meaning:
          "Sitendeki tüm sayfaların listesini Google'a veren dosya (genellikle /sitemap.xml).",
      },
      {
        term: "robots.txt",
        meaning:
          "Arama motorlarına hangi bölümleri gezebileceklerini söyleyen dosya.",
      },
      {
        term: "Alt metin (alt)",
        meaning:
          "Görselin ne olduğunu anlatan yazı. Google görselleri bununla anlar.",
      },
      {
        term: "Lighthouse / Core Web Vitals",
        meaning:
          "Google'ın hız ve kullanıcı deneyimi ölçümü. LCP: ana içeriğin yüklenme süresi (2,5 sn altı iyi), CLS: sayfanın kayması (0,1 altı iyi), INP: tıklamaya tepki süresi (200 ms altı iyi).",
      },
    ],
    tip: "Hız ölçümü (Lighthouse) için Ayarlar'a ücretsiz PageSpeed anahtarı eklemen gerekir.",
  },
  gsc: {
    title: "GSC Insights (Google Search Console)",
    summary:
      "Google'ın kendi verisi: insanlar hangi kelimeleri aratınca seni gördü, kaç kişi tıkladı ve kaçıncı sırada çıktın. Sitenle ilgili en güvenilir bilgi buradadır.",
    steps: [
      "Sayfadaki düğmeyle Google hesabını bağla ve siteni seç (Google girişi tarayıcında açılır).",
      "Sorgular sekmesinde seni getiren aramaları gör.",
      "Sayfalar sekmesinde en çok trafik alan sayfalarını gör.",
      "Tarih aralığını değiştirerek önceki dönemle karşılaştır.",
    ],
    terms: [
      {
        term: "Sorgu",
        meaning: "İnsanların Google'a yazdığı arama ifadesi.",
      },
      {
        term: "Gösterim",
        meaning: "Sitenin o aramada sonuçlarda görünme sayısı.",
      },
      {
        term: "CTR (tıklama oranı)",
        meaning: "Tıklama ÷ gösterim. %2-5 arası normaldir; ilk sıralarda daha yüksektir.",
      },
      {
        term: "Pozisyon",
        meaning: "Ortalama sıran. 1-3 çok iyi, 4-10 ilk sayfa, 11-20 ikinci sayfa.",
      },
    ],
    tip: "En büyük fırsatlar 5-20. sıradaki sorgulardır: o sayfaları biraz güçlendirirsen ilk sayfaya çıkabilir. Gösterimi yüksek ama CTR'si düşük sayfaların başlık ve açıklamasını iyileştir.",
  },
  keywords: {
    title: "Anahtar Kelime Araştırması",
    summary:
      "Bir konu yazınca insanların o konuda neler aradığını ve her aramanın ne kadar popüler olduğunu gösterir. Hangi konularda içerik yazacağına karar vermene yardımcı olur.",
    steps: [
      "Sitenin konusuyla ilgili bir kelime yaz (örneğin 'ahşap mutfak dolabı').",
      "Ülkeyi seç ve Ara'ya bas.",
      "Listeden işine yarayanları seçip kaydet; Kayıtlı Kelimeler'de toplanır.",
      "Her önemli kelime için sitende ona uygun bir sayfa olduğundan emin ol.",
    ],
    terms: [
      {
        term: "Anahtar kelime",
        meaning: "İnsanların arama motoruna yazdığı ifade.",
      },
      {
        term: "Hacim",
        meaning:
          "FOXSEO'da Bing'deki son 30 günlük gösterim sayısıdır. Google'daki gerçek sayıdan düşüktür; kelimeleri birbiriyle kıyaslamak için kullan.",
      },
      {
        term: "Uzun kuyruk kelime",
        meaning:
          "3-4+ kelimelik, daha az aranan ama rakibi az ve satışa yakın aramalar (örneğin 'istanbul ahşap mutfak dolabı fiyatları').",
      },
    ],
    tip: "Yeni bir site için çok genel kelimeler yerine uzun kuyruk kelimeleri hedeflemek daha hızlı sonuç verir.",
  },
  backlinks: {
    title: "Backlinkler",
    summary:
      "Başka sitelerin senin sitene verdiği linkleri gösterir. Google, güvenilir sitelerden gelen linkleri bir 'tavsiye' gibi görür ve bu sıralamanı yükseltir.",
    steps: [
      "Bing Webmaster Tools'a siteni ekle ve Ayarlar'a Bing API anahtarını yaz.",
      "Hangi sayfana kaç link geldiğini gör.",
      "'Who links here' ile o sayfaya link veren siteleri ve link yazısını incele.",
    ],
    terms: [
      {
        term: "Backlink",
        meaning: "Başka bir siteden senin sitene verilen link.",
      },
      {
        term: "Bağlantı metni (anchor text)",
        meaning:
          "Linkin tıklanan yazısı. Konuyla ilgili olması Google'a sayfanın ne hakkında olduğunu anlatır.",
      },
      {
        term: "Referans alan adı",
        meaning:
          "Sana link veren farklı site sayısı. Aynı siteden 100 link yerine 10 farklı siteden link daha değerlidir.",
      },
    ],
    tip: "Link satın almak Google kurallarına aykırıdır. Paylaşılmaya değer içerik üret, sektör rehberlerine ve iş ortaklarının sitelerine kaydol.",
  },
  saved: {
    title: "Kayıtlı Kelimeler",
    summary:
      "Anahtar kelime araştırmasında beğenip kaydettiğin kelimelerin listesi. İçerik planını burada tutarsın.",
    steps: [
      "Anahtar Kelime Araştırması sayfasından kelime kaydet.",
      "Burada hepsini bir arada gör, gereksizleri sil.",
      "Her kelime için bir sayfa ya da blog yazısı planla.",
    ],
    tip: "Benzer anlama gelen kelimeleri tek sayfada hedefle; aynı konu için birden fazla sayfa açmak sayfaların birbiriyle yarışmasına yol açar.",
  },
  reports: {
    title: "Raporlar",
    summary:
      "SEO durumunu özetleyen, paylaşılabilir raporlar oluşturur. Bir ay sonra ilerlemeyi karşılaştırmak için kullanışlıdır.",
    steps: [
      "Yeni rapor oluştur ve içine eklemek istediğin bölümleri seç.",
      "Raporu kaydet; istersen Claude'dan senin için rapor yazmasını isteyebilirsin.",
    ],
  },
  context: {
    title: "Bağlam",
    summary:
      "Siten hakkında temel bilgiler: ne sattığın, kime hitap ettiğin, rakiplerin. Claude ile çalışırken bu bilgiler kullanılır, böylece öneriler sitene özel olur.",
    steps: [
      "İşini birkaç cümleyle anlat.",
      "Hedef müşterini ve bildiğin rakipleri yaz.",
    ],
  },
  agent: {
    title: "Yapay Zekâ Ajanı Kurulumu",
    summary:
      "FOXSEO'yu Claude'a bağlar. Bağladıktan sonra Claude'a 'sitemi denetle ve en önemli sorunları açıkla' gibi şeyler sorabilirsin; Claude FOXSEO'daki verileri okuyup sana öneri verir.",
    steps: [
      "FOXSEO açık olmalı.",
      "Claude Desktop veya Claude Code'a FOXSEO bağlantı adresini ekle: http://localhost:3001/mcp",
      "Claude'a FOXSEO ile ilgili bir soru sor.",
    ],
    terms: [
      {
        term: "MCP",
        meaning:
          "Claude gibi yapay zekâların başka programlardaki verilere bağlanmasını sağlayan standart.",
      },
    ],
  },
  settings: {
    title: "Ayarlar",
    summary: "Uygulamanın genel ayarları: görünüm, bağlı hesaplar ve hesap bilgilerin.",
    tip: "Google ve Bing API anahtarlarını uygulama menüsünden: FOXSEO → Ayarlar (API anahtarları) ile eklersin.",
  },
  projectSettings: {
    title: "Proje Ayarları",
    summary:
      "Bu projenin hangi siteyle ilgili olduğunu ve varsayılan ülke/dil ayarlarını belirlersin. Diğer tüm sayfalar bu bilgileri kullanır.",
    steps: [
      "Site adresini yaz (örneğin ornek.com).",
      "Hedef ülke ve dili seç (örneğin Türkiye, Türkçe).",
      "Kaydet.",
    ],
  },
  projects: {
    title: "Projeler",
    summary:
      "Her proje bir web sitesidir. Birden fazla siten varsa her biri için ayrı proje oluşturursun; verileri birbirine karışmaz.",
  },
};
