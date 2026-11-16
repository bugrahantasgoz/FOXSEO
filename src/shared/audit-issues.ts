/**
 * Registry of site-audit issue types.
 *
 * Shared between the server (issue engine, MCP tools) and the client
 * (issues UI, CSV export). Each issue row in `audit_issues` references one
 * of these types by id.
 */

// Relative: tests/badseo type-checks this file without the @ alias.
import { RENDERED_CRAWL_TIME_LIMIT_HOURS } from "./audit-limits";

export type IssueSeverity = "critical" | "warning" | "info";

interface AuditIssueDescriptor {
  severity: IssueSeverity;
  title: string;
  explanation: string;
  howToFix: string;
}

export const AUDIT_ISSUE_TYPES = {
  "blocked-page": {
    severity: "critical",
    title: "Tarayıcı engellendi",
    explanation:
      "Site, sayfa yerine bir bot doğrulaması ya da erişim reddi döndürdü (örneğin bir Cloudflare doğrulaması veya 403). Sayfayı bozuk diye göstermiyoruz, ama bu sayfa denetlenemedi. Arama motorlarının tarayıcıları da benzer bir engelle karşılaşabilir.",
    howToFix:
      'Site senin ise WAF / bot koruması ayarlarında "FOXSEO-Audit" kullanıcı aracısına (user agent) izin ver. Cloudflare\'de bunun için, kullanıcı aracısı "FOXSEO-Audit" içerdiğinde bot korumasını atlayan bir WAF özel kuralı ekleyebilirsin; bazı ücretsiz planlarda bot korumasını gevşetmen gerekebilir. Sonra denetimi yeniden çalıştır. Shopify kullanıyorsan bunun yerine Crawler access özelliğini kullan (Online Store → Preferences → Crawler access) ve imzayı FOXSEO\'da Ayarlar → Tarayıcı erişimi bölümüne yapıştır. Tarayıcıya nasıl izin verileceği: https://openseo.so/docs/crawler',
  },
  "javascript-rendering-suspected": {
    severity: "warning",
    title: "İçerik JavaScript gerektiriyor olabilir",
    explanation:
      "Sayfanın HTML'inde bir JavaScript uygulama kapsayıcısı var ama neredeyse hiç okunabilir içerik, başlık, link ya da görsel yok. Sayfa içeriğini tarayıcıda yüklüyor olabilir ya da oluşturulurken hâlâ yükleniyordu. Bu HTML sayfanın tamamını göstermeyebileceği için içerik kontrolleri atlandı.",
    howToFix:
      "Bu denetimde JavaScript işlenmediyse, yüklenen içeriği kontrol etmek için \"JavaScript'i işle\" seçeneği açık yeni bir denetim başlat. Güvenilir bir tarama için önemli içeriği ve menüyü sunucu tarafında oluşturma (SSR) ya da ön oluşturma (prerendering) ile ilk HTML'de sun. Bu uyarı, arama motorlarının sayfayı dizine ekleyemediğini kanıtlamaz.",
  },
  "rate-limited-page": {
    severity: "warning",
    title: "İstek sınırına takıldı (429)",
    explanation:
      "Sunucu 429 Too Many Requests (çok fazla istek) yanıtı verdi, bu yüzden bu sayfa denetlenemedi. Tarayıcı, sunucunun istediği süre (Retry-After) kadar bekleyip sayfayı bir kez daha denedi, sonra devam etti.",
    howToFix:
      "Tarayıcılar için istek sınırını yükselt ya da istek sınırlama kurallarında \"FOXSEO-Audit\" kullanıcı aracısına izin ver (Cloudflare'de: bu kullanıcı aracısına uyan bir rate limiting kuralı istisnası). Sonra denetimi yeniden çalıştır. Sınır sıkıysa daha az sayfayla denemek de işe yarar. Shopify kullanıyorsan bunun yerine Crawler access özelliğini kullan (Online Store → Preferences → Crawler access) ve imzayı FOXSEO'da Ayarlar → Tarayıcı erişimi bölümüne yapıştır. Tarayıcıya nasıl izin verileceği: https://openseo.so/docs/crawler",
  },
  "crawl-rate-limited": {
    severity: "warning",
    title: "Tarama erken durdu: istek sınırı",
    explanation:
      "Site art arda birkaç sayfayı 429 Too Many Requests ile reddetti ya da tarayıcıyı çok uzun süre bekletti, bu yüzden sayfa istemeyi bıraktık. Bu rapor eksik; taramadığımız URL'ler bozuk ya da sınırlı olarak kaydedilmedi.",
    howToFix:
      "Sitenin istek sınırı sıfırlandıktan sonra denetimi yeniden çalıştır ya da site sahibinden FOXSEO-Audit tarayıcısına izin vermesini iste (https://openseo.so/docs/crawler). Shopify kullanıyorsan bunun yerine Crawler access özelliğini kullan (Online Store → Preferences → Crawler access) ve imzayı FOXSEO'da Ayarlar → Tarayıcı erişimi bölümüne yapıştır.",
  },
  "crawl-time-limit": {
    severity: "warning",
    title: "Tarama erken durdu: süre sınırı",
    explanation: `JavaScript işleyen denetimler ${RENDERED_CRAWL_TIME_LIMIT_HOURS} saat sonra taramayı durdurur ve bu denetim o sınıra ulaştı. Bu rapor eksik; taramadığımız URL'ler bozuk olarak kaydedilmedi.`,
    howToFix:
      "Denetimi daha düşük bir sayfa sınırıyla yeniden çalıştır. Sitenin içeriği ve linkleri zaten HTML'de varsa \"JavaScript'i işle\" seçeneğini kapatabilirsin.",
  },
  "crawl-credits-exhausted": {
    severity: "warning",
    title: "Tarama erken durdu: işleme sınırı",
    explanation:
      "Bu sitedeki birçok sayfa gelişmiş işleyiciye ihtiyaç duydu, bu yüzden denetim işleme sınırına ulaşıp durdu.",
    howToFix:
      "Site içeriğini göstermek için JavaScript'e ihtiyaç duymuyorsa, denetimi \"JavaScript'i işle\" kapalıyken yeniden çalıştır.",
  },
  "crawl-page-limit": {
    severity: "warning",
    title: "Tarama erken durdu: sayfa sınırı",
    explanation:
      "Denetim, bulduğu tüm URL'leri ziyaret etmeden sayfa sınırına ulaştı, yani bu rapor sitenin yalnızca bir kısmını kapsıyor. Kısmi taramada yetim sayfalar kontrol edilmez.",
    howToFix:
      'Denetimi daha yüksek bir sayfa sınırıyla yeniden çalıştır. Zaten en yüksek sınırdaysan, robots.txt dosyasına "FOXSEO-Audit" kullanıcı aracısı için denetlemen gerekmeyen bölümleri (etiket arşivleri, filtrelenmiş listeler gibi) engelleyen bir grup ekle; böylece sınır önemli sayfalara harcanır: https://openseo.so/docs/crawler',
  },
  "server-error": {
    severity: "critical",
    title: "Sunucu hatası (5xx)",
    explanation:
      "Sayfa 5xx sunucu hatası döndürdü. Sürekli sunucu hatası gören arama motorları siteyi daha az tarar ve sayfayı dizinden çıkarabilir.",
    howToFix:
      "Bu URL için sunucu kayıtlarına (log) bak ve asıl hatayı düzelt. Sayfa artık yoksa hata vermek yerine 404/410 döndür ya da ilgili bir sayfaya yönlendir.",
  },
  "broken-internal-link": {
    severity: "critical",
    title: "Kırık iç link",
    explanation:
      "Bu sayfa, hata durum kodu (4xx/5xx) döndüren bir iç URL'ye link veriyor. Kırık linkler tarama bütçesini boşa harcar, link değerini kaybettirir ve ziyaretçileri rahatsız eder. En yaygın ve en zararlı teknik SEO sorunlarındandır.",
    howToFix:
      "Linki doğru ve çalışan URL'ye yönlendir ya da kaldır. Hedef sayfa taşındıysa yönlendirmeye güvenmek yerine doğrudan yeni URL'ye link ver.",
  },
  "missing-title": {
    severity: "critical",
    title: "Başlık etiketi (title) eksik",
    explanation:
      "Sayfada <title> yok. Başlık, sayfanın konusunu anlatan en güçlü sinyaldir ve arama sonuçlarında görünen başlıktır. Yoksa arama motorları kendisi bir başlık üretir, genelde de kötü olur.",
    howToFix:
      "Sayfanın ana konusunu içeren, benzersiz ve açıklayıcı, yaklaşık 50–60 karakterlik bir <title> ekle.",
  },
  "broken-page": {
    severity: "warning",
    title: "Sayfa hata döndürüyor (4xx)",
    explanation:
      "Taranan bu URL bir istemci hatası döndürdü (örneğin 404). Site haritasında ya da başka sayfalarda bu URL'ye yer veriliyorsa tarayıcılar ona boşuna istek atmaya devam eder.",
    howToFix:
      "Sayfanın var olması gerekiyorsa geri getir. Bilerek kaldırıldıysa site haritasından ve iç linklerden çıkar, en yakın çalışan sayfaya 301 yönlendirmesi eklemeyi düşün.",
  },
  "duplicate-title": {
    severity: "warning",
    title: "Yinelenen başlık",
    explanation:
      "Birden fazla sayfa aynı başlık etiketini kullanıyor. Arama motorları sayfaları ayırt etmek için başlıklara bakar; aynı başlıklar sayfaları birbirine rakip yapar ve tıklanma oranını düşürür.",
    howToFix:
      "Her sayfaya, kendi içeriğini anlatan benzersiz bir başlık yaz. Şablondan üretilen sayfalarda ayırt edici bilgiyi (ad, kategori, konum) şablona ekle.",
  },
  "duplicate-meta-description": {
    severity: "warning",
    title: "Yinelenen meta açıklama",
    explanation:
      "Birden fazla sayfa aynı meta açıklamayı kullanıyor. Arama sonuçlarında aynı özet görünür ve kullanıcılar sayfaları birbirinden ayıramaz.",
    howToFix:
      "Her sayfaya benzersiz bir meta açıklama yaz ya da yinelenen açıklamayı tamamen kaldır. Arama motorları sayfa içeriğinden bir özet üretir, bu da yanlış bir kopyadan iyidir.",
  },
  "duplicate-content": {
    severity: "warning",
    title: "Yinelenen sayfa içeriği",
    explanation:
      "İki veya daha fazla URL birebir aynı görünür metni sunuyor. Arama motorları dizine eklemek için birini seçip diğerlerini yok sayar ve sıralama sinyalleri kopyalar arasında bölünür.",
    howToFix:
      "Kopyaları birleştir: asıl (canonical) URL'yi seç, diğerlerine rel=canonical ekle ve mümkünse yinelenen URL'leri 301 ile yönlendir. Sık görülen nedenler: sondaki eğik çizgi (/) farkları, URL parametreleri, http/https ya da www farkları.",
  },
  "missing-meta-description": {
    severity: "warning",
    title: "Meta açıklama eksik",
    explanation:
      "Sayfada meta açıklama yok. Arama motorları sayfa metninden bir özet oluşturur; bu özet genelde daha az ilgi çekicidir ve tıklanma oranını düşürür.",
    howToFix:
      "Sayfayı özetleyen ve tıklamak için bir neden veren, yaklaşık 70–160 karakterlik bir meta açıklama ekle.",
  },
  "missing-h1": {
    severity: "warning",
    title: "H1 başlığı eksik",
    explanation:
      "Sayfada H1 yok. H1, ziyaretçilere ve arama motorlarına sayfanın ne hakkında olduğunu söyler; H1'i olmayan sayfaların konusu genelde daha belirsiz kalır.",
    howToFix:
      "Sayfanın ana konusunu belirten, başlık etiketiyle (title) uyumlu tek bir H1 ekle.",
  },
  "multiple-h1": {
    severity: "warning",
    title: "Birden fazla H1 başlığı",
    explanation:
      "Sayfada birden fazla H1 var. Bu, ana konu sinyalini zayıflatır ve genelde bir şablon hatasına işaret eder (örneğin hem logo hem de başlık H1 olarak işaretlenmiş).",
    howToFix:
      "Sayfanın ana başlığı için tek bir H1 bırak, diğerlerini H2/H3'e düşür (logo gibi başlık olmayan öğeler için başlık etiketi kullanma).",
  },
  "redirect-chain": {
    severity: "warning",
    title: "Yönlendirme zinciri",
    explanation:
      "Son sayfaya ulaşmak için art arda iki veya daha fazla yönlendirme gerekiyor. Her adım gecikme ekler, link değerini azaltır ve tarama bütçesini harcar; uzun zincirler hiç takip edilmeyebilir.",
    howToFix:
      "İlk URL'yi (ve iç linkleri) doğrudan son hedefe yönlendir, böylece en fazla bir yönlendirme olur.",
  },
  "redirect-loop": {
    severity: "warning",
    title: "Yönlendirme döngüsü",
    explanation:
      "Bu yönlendirme sonunda yine kendisine dönüyor, yani URL hiçbir zaman açılmıyor. Tarayıcılar ve arama motoru tarayıcıları hata vererek vazgeçer.",
    howToFix:
      "Bu URL'nin yönlendirme kurallarını takip et ve döngüyü kır; zincir 200 döndüren gerçek bir sayfada bitmeli.",
  },
  "canonical-conflict": {
    severity: "warning",
    title: "Çelişen canonical etiketleri",
    explanation:
      "Sayfa, HTML'deki <link rel=canonical> ile HTTP Link başlığında farklı canonical URL'ler belirtiyor. Sinyaller çeliştiğinde arama motorları ikisini de yok sayar ve kendi seçimini yapar.",
    howToFix:
      "Tek bir canonical URL seç ve onu yalnızca bir yerde belirt (en yaygını HTML <head> bölümüdür); diğerini kaldır ya da aynı yap.",
  },
  "thin-content": {
    severity: "warning",
    title: "Zayıf içerik",
    explanation:
      "Sayfada çok az görünür metin var. Zayıf sayfalar nadiren sıralama alır, sitenin genel kalite değerlendirmesini aşağı çekebilir ve (site tarayıcıda oluşturuluyorsa) düz HTML okuyan tarayıcıların göremediği bir içeriğe işaret edebilir.",
    howToFix:
      "Sayfayı gerçekten faydalı içerikle genişlet, noindex yap ya da daha güçlü bir sayfayla birleştir. İçerik var ama JavaScript ile oluşturuluyorsa sunucu tarafında ya da ön oluşturmayla sunulduğundan emin ol.",
  },
  "images-missing-alt": {
    severity: "warning",
    title: "Görsellerde alt metin eksik",
    explanation:
      "Sayfadaki bir veya daha fazla görselde alt özelliği yok. Alt metin erişilebilirlik için gereklidir ve arama motorlarının görselleri anlamasının ana yoludur.",
    howToFix:
      'Anlamlı görsellere açıklayıcı bir alt metin ekle; boş alt (alt="") değerini yalnızca süs amaçlı görsellerde kullan.',
  },
  "orphan-page": {
    severity: "warning",
    title: "Yetim sayfa",
    explanation:
      "Taranan hiçbir sayfa bu URL'ye link vermiyor; yalnızca site haritası (sitemap) üzerinden bulunabildi. İç link almayan sayfalar az taranır, iç link değeri almaz ve ziyaretçiler siteyi gezerek onları bulamaz.",
    howToFix:
      "Bu sayfaya ilgili sayfalardan (menü, ilgili içerikler, ana kategori sayfaları) link ver ya da dizine eklenmemesi gerekiyorsa site haritasından çıkar.",
  },
  "no-outgoing-links": {
    severity: "warning",
    title: "Sayfada giden link yok",
    explanation:
      "Sayfada hiç link yok, yani çıkmaz sokak. Sayfaya gelen link değeri orada kalır, tarayıcıların gidecek yeri olmaz ve ziyaretçiler geri tuşuna basmak zorunda kalır.",
    howToFix:
      "İlgili sayfalara, üst kategoriye ya da ana sayfaya link ekle. Sayfanın menüsü JavaScript ile oluşturuluyorsa sunucudan gelen HTML'de de bulunduğundan emin ol.",
  },
  "title-too-long": {
    severity: "info",
    title: "Başlık çok uzun",
    explanation:
      "Başlık yaklaşık 60 karakteri geçiyor; arama sonuçlarında kısaltılır ve sonu cümlenin ortasında kesilebilir.",
    howToFix:
      "Başlığı yaklaşık 50–60 karaktere kısalt ve en önemli kelimeleri başa koy.",
  },
  "title-too-short": {
    severity: "info",
    title: "Başlık çok kısa",
    explanation:
      "Başlık yaklaşık 10 karakterden kısa. Bu genelde sayfayı anlatmak ya da tıklama almak için fazla genel kalır.",
    howToFix:
      "Başlığı, sayfanın ne sunduğunu anlatan açıklayıcı bir ifadeye (yaklaşık 30–60 karakter) genişlet.",
  },
  "meta-description-too-long": {
    severity: "info",
    title: "Meta açıklama çok uzun",
    explanation:
      "Meta açıklama yaklaşık 160 karakteri geçiyor, bu yüzden arama motorları özeti kısaltacak.",
    howToFix:
      "Açıklamayı ana mesajı ve harekete geçirici ifadeyi koruyarak yaklaşık 70–160 karaktere kısalt.",
  },
  "meta-description-too-short": {
    severity: "info",
    title: "Meta açıklama çok kısa",
    explanation:
      "Meta açıklama yaklaşık 70 karakterden kısa. Kısa açıklamalar arama sonuçlarında sana ayrılan özet alanını boşa harcar ve arama motorları çoğu zaman onları yok sayıp sayfadan metin alır.",
    howToFix:
      "Açıklamayı, sayfayı özetleyen ve tıklamak için bir neden veren yaklaşık 70–160 karaktere genişlet.",
  },
  "heading-order-skip": {
    severity: "info",
    title: "Başlık seviyeleri atlanıyor",
    explanation:
      "Başlık hiyerarşisi seviye atlıyor (örneğin H2'den hemen sonra H4). Bu, erişilebilirlik araçları ve içerik analizi için belge yapısını zayıflatır.",
    howToFix:
      "Başlık seviyelerini atlamadan birer birer inecek şekilde düzenle (H1 → H2 → H3).",
  },
  "slow-response": {
    severity: "info",
    title: "Sunucu yavaş yanıt veriyor",
    explanation:
      "HTML yanıtı 1,5 saniyeden uzun sürdü. Yavaş ilk bayt süresi (TTFB) diğer tüm performans ölçümlerini aşağı çeker ve büyük sitelerde tarama hızını düşürür.",
    howToFix:
      "Bu sayfa için sunucu/veritabanı süresini ve önbelleklemeyi incele; önbelleğe alınmış ya da statik üretilmiş HTML sunmak genelde sorunu çözer.",
  },
  "noindex-page": {
    severity: "info",
    title: "Sayfa noindex",
    explanation:
      "Sayfa arama motorlarından kendisini dizine eklememelerini istiyor (robots meta etiketi veya X-Robots-Tag başlığıyla). Bu çoğu zaman bilerek yapılır; bu bir hata değil, sadece bilgilendirme.",
    howToFix:
      "Bu sayfanın aramalarda çıkması gerekiyorsa noindex komutunu kaldır. Bilerek yapıldıysa (yönetim, teşekkür, filtre sayfaları) bir şey yapmana gerek yok.",
  },
  "canonicalized-page": {
    severity: "info",
    title: "Canonical başka bir URL'yi gösteriyor",
    explanation:
      "Sayfa canonical olarak farklı bir URL belirtiyor, yani arama motorlarına o URL'yi dizine eklemelerini söylüyor. Bilerek yapıldıysa sorun yok (parametreli sayfalar, başka yerde yayınlanan içerik); bu sayfanın aramalarda çıkması isteniyorsa sorun.",
    howToFix:
      "Bu sayfanın kendi başına aramalarda çıkması gerekiyorsa canonical etiketini sayfanın kendisine ayarla. Yoksa bir şey yapmana gerek yok.",
  },
  "deep-page": {
    severity: "info",
    title: "Sayfa site yapısında çok derinde",
    explanation:
      "Sayfa ana sayfadan 5 veya daha fazla tık uzakta. Derindeki sayfalar daha seyrek taranır ve daha az link değeri alır.",
    howToFix:
      "Bu sayfaya giden yolu kısaltmak için üst seviyedeki sayfalardan (ana kategori sayfaları, menü) link ver.",
  },
} as const satisfies Record<string, AuditIssueDescriptor>;

export type AuditIssueType = keyof typeof AUDIT_ISSUE_TYPES;

/** Issue types a crawl raises when it stops with URLs left unvisited. */
export const CRAWL_STOP_ISSUE_TYPES = [
  "crawl-rate-limited",
  "crawl-time-limit",
  "crawl-credits-exhausted",
  "crawl-page-limit",
] as const satisfies readonly AuditIssueType[];

export const ISSUE_SEVERITY_ORDER: Record<IssueSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const issueRegistry: Record<string, AuditIssueDescriptor> = AUDIT_ISSUE_TYPES;

export function getIssueDescriptor(
  issueType: string,
): AuditIssueDescriptor | null {
  return issueRegistry[issueType] ?? null;
}
