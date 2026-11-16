import { ACCOUNT_DELETION_SCHEDULED_ERROR } from "@/shared/account-deletion";
import { CHATGPT_EMAIL_NOT_VERIFIED_CODE } from "@/shared/chatgpt-sign-in";

/**
 * Plain-language copy for OAuth failures, shared by the connect-surface
 * inline alert (GoogleLinkErrorAlert) and the /auth-error fallback page.
 * `code` is the `error` query param on the redirect: the provider's own error
 * code (access_denied), or one set by googleOAuth.ts / Better Auth.
 *
 * `providerLabel` ("Search Console" / "Google Analytics") is set when the
 * failure came from a connect flow; without it the copy reads as a sign-in
 * failure. The error page can't tell a Google sign-in from a ChatGPT one, so
 * that copy names neither.
 */
export function googleAuthErrorCopy(
  code: string,
  providerLabel?: string,
): { title: string; description: string } {
  const what = providerLabel ? `${providerLabel} bağlantısı` : "Oturum açma";
  const provider = providerLabel ? "Google" : "oturum açma sağlayıcısı";

  switch (code) {
    case ACCOUNT_DELETION_SCHEDULED_ERROR:
      return {
        title: "Bu hesap siliniyor",
        description:
          "Bu hesabın silinmesini istedin, bu yüzden hesaba giriş yapılamıyor.",
      };
    // Sign-in with Google or ChatGPT reached an existing account it may not
    // be attached to: the provider hasn't verified the email, or the account
    // never confirmed its own.
    case "account_not_linked":
      return {
        title: "Bu e-postayla zaten bir hesap var",
        description:
          "Daha önce nasıl giriş yaptıysan öyle giriş yap. E-posta ve şifreyle giriş yaptıysan ve e-postanı hiç onaylamadıysan önce onu onayla.",
      };
    case CHATGPT_EMAIL_NOT_VERIFIED_CODE:
      return {
        title: "Önce e-postanı ChatGPT'de doğrula",
        description:
          "OpenAI, ChatGPT hesabındaki e-postayı doğrulamamış; bu yüzden bundan FOXSEO hesabı oluşturamıyoruz. E-postanı ChatGPT'de doğrula ya da Google veya e-postayla kaydol.",
      };
    case "state_mismatch":
      return {
        title: `${what} tamamlanmadı`,
        description:
          "Deneme zaman aşımına uğradı ya da yarıda kaldı. Tek bir tarayıcı sekmesinde tekrar dene ve adımları 10 dakika içinde bitir. Sorun sürerse tarayıcının bu site için çerezlere izin verdiğinden emin ol.",
      };
    case "access_denied":
      return {
        title: `${what} iptal edildi`,
        description:
          "İzin ekranı kapatıldı ya da reddedildi. Hazır olduğunda tekrar dene.",
      };
    case "scope_not_granted":
      return {
        title: `${what} için bir izin eksik`,
        description: `Google'ın izin ekranındaki kutulardan biri işaretlenmediği için FOXSEO ${providerLabel ?? "Google"} verilerine erişemedi. Tekrar dene ve devam etmeden önce tüm kutuları işaretle.`,
      };
    case "connection_save_failed":
      return {
        title: `${what} tamamlanmadı`,
        description:
          "Bağlantı kaydedilemedi. Lütfen tekrar dene; sorun sürerse sunucu kayıtlarına bak.",
      };
    default:
      return {
        title: `${what} tamamlanmadı`,
        description: `${provider} ile iletişimde bir sorun oluştu. Lütfen tekrar dene; sorun sürerse sunucu kayıtlarına bak.`,
      };
  }
}
