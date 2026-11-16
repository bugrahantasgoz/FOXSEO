import { FREE_MAX_AUDIT_PAGES } from "@/shared/audit-limits";
import { GATEWAY_RENDERING_NOT_SET_UP_MESSAGE } from "@/shared/audit-rendering";
import { isErrorCode, type ErrorCode } from "@/shared/error-codes";
import {
  isEveryAppClientAuthMode,
  isHostedClientAuthMode,
} from "@/lib/auth-mode";

/**
 * Copy for an error we did not expect. Hosted users cannot read our logs, so
 * they get support; a self-hoster runs the server and can.
 */
export const UNEXPECTED_ERROR_MESSAGE = isHostedClientAuthMode()
  ? "Bir şeyler ters gitti. Lütfen tekrar dene; sorun sürerse sunucu kayıtlarına bak."
  : "Bir şeyler ters gitti. Lütfen tekrar dene; ayrıntılar için sunucu kayıtlarına bakabilirsin.";

const STANDARD_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Lütfen oturum aç ve tekrar dene.",
  AUTH_CONFIG_MISSING: isEveryAppClientAuthMode()
    ? "FOXSEO şu anda Every App gateway'ine ulaşamıyor. Kurulumu pnpm everyapp status komutuyla kontrol edebilirsin."
    : "FOXSEO kimlik doğrulaması ayarlanmamış. README'deki Cloudflare Access kurulum adımlarını izle.",
  PAYMENT_REQUIRED: "Bu özellik bu kurulumda kullanılamıyor.",
  INSUFFICIENT_CREDITS:
    "Bu işlem için veri sağlayıcısının kullanım hakkı yetmiyor.",
  PAYMENT_METHOD_REQUIRED: "Bu özellik bu kurulumda kullanılamıyor.",
  PAYMENT_ACTION_REQUIRED: "Bu özellik bu kurulumda kullanılamıyor.",
  AUDIT_RENDERING_UNAVAILABLE: isEveryAppClientAuthMode()
    ? GATEWAY_RENDERING_NOT_SET_UP_MESSAGE
    : "Bu kurulumda JavaScript ile sayfa oluşturma (rendering) ayarlı değil. Kullanmak için bir renderer etkinleştir.",
  FORBIDDEN: "Bu içeriğe erişim iznin yok.",
  NOT_FOUND: "İstenen içerik bulunamadı.",
  AUDIT_CAPACITY_REACHED:
    "Denetim kapasitesi doldu. Yeni bir denetim başlatmak için projelerindeki eski denetimleri sil.",
  AUDIT_PAGE_LIMIT_EXCEEDED: `Denetimler en fazla ${FREE_MAX_AUDIT_PAGES} sayfayla sınırlı. Daha az sayfayla tekrar dene.`,
  AUDIT_ALREADY_RUNNING:
    "Aynı anda çalışabilecek denetim sınırına ulaştın. Yenisini başlatmadan önce birinin bitmesini bekle ya da birini sil.",
  VALIDATION_ERROR: "Lütfen girdiğin bilgileri kontrol edip tekrar dene.",
  UNKNOWN_LOCATION:
    "Bu şehir, ilçe veya bölge bulunamadı. Listeden bir konum seç ya da tüm ülkede aramak için alanı temizle.",
  CRAWL_TARGET_BLOCKED: "Bu adres güvenlik kuralları nedeniyle taranamıyor.",
  BACKLINKS_BILLING_ISSUE:
    "Bağlı DataForSEO hesabında bakiye veya ödeme sorunu var.",
  AI_SEARCH_BILLING_ISSUE:
    "Bağlı DataForSEO hesabında bakiye veya ödeme sorunu var.",
  AI_VISIBILITY_ERROR:
    "Yapay zekâ görünürlüğü isteği tamamlanamadı. Takip ayarlarını kontrol edip tekrar dene.",
  DATAFORSEO_AUTH_FAILED: isEveryAppClientAuthMode()
    ? "DataForSEO henüz Every App gateway'inde kurulu değil ya da kayıtlı anahtarı reddetti. pnpm everyapp secret set DATAFORSEO_API_KEY komutuyla ayarlayabilirsin."
    : "DataForSEO kimlik bilgilerini reddetti. DATAFORSEO_API_KEY değerinin DataForSEO giriş:şifre bilgisinin base64 hali olduğunu ve hesabın doğrulanmış, API erişimi açık olduğunu kontrol et.",
  BING_NOT_CONFIGURED:
    "Bing Webmaster Tools henüz bağlı değil. BING_WEBMASTER_API_KEY değerini .env.local dosyasına ekle ve FOXSEO'yu yeniden başlat (KURULUM.md, 5. adım).",
  BING_REQUEST_FAILED:
    "Bing Webmaster Tools isteği reddetti. API anahtarını ve bu sitenin Bing'de Proje ayarlarındaki adresle aynı şekilde doğrulandığını kontrol et. Ayrıntılar sunucu kayıtlarında.",
  RATE_LIMITED: "Çok fazla istek gönderildi. Biraz bekleyip tekrar dene.",
  UPSTREAM_UNAVAILABLE:
    "Veri sağlayıcısına şu anda ulaşılamıyor. Birazdan tekrar dene.",
  CONFLICT: "Bu istek mevcut verilerle çakışıyor.",
  INTERNAL_ERROR: UNEXPECTED_ERROR_MESSAGE,
};

export function getStandardErrorMessage(
  error: unknown,
  fallback: string = STANDARD_MESSAGES.INTERNAL_ERROR,
): string {
  if (!(error instanceof Error)) return fallback;
  if (isErrorCode(error.message)) return STANDARD_MESSAGES[error.message];
  if (error.message) return error.message;
  return fallback;
}

export function getErrorCode(error: unknown): ErrorCode | null {
  if (!(error instanceof Error)) return null;
  return isErrorCode(error.message) ? error.message : null;
}
