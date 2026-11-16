# FOXSEO Kurulum Rehberi (Windows)

FOXSEO, [OpenSEO](https://github.com/every-app/open-seo) temel alınarak yapılmış, tamamen ücretsiz veri kaynaklarıyla çalışan kişisel bir SEO aracıdır. DataForSEO veya başka bir ücretli servis gerekmez.

| Özellik                                                  | Veri kaynağı                | Gerekli ayar                   |
| -------------------------------------------------------- | --------------------------- | ------------------------------ |
| Site denetimi (kırık linkler, başlıklar, meta, sitemap…) | FOXSEO'nun kendi tarayıcısı | Yok                            |
| Hız / Core Web Vitals (Lighthouse)                       | Google PageSpeed Insights   | Google API anahtarı (ücretsiz) |
| Sıralamalar, tıklamalar, kelimeler                       | Google Search Console       | Google OAuth (ücretsiz)        |
| Trafik                                                   | Google Analytics 4          | Google OAuth (ücretsiz)        |
| Anahtar kelime fikirleri ve hacim                        | Bing Webmaster Tools        | Bing API anahtarı (ücretsiz)   |
| Backlinkler                                              | Bing Webmaster Tools        | Bing API anahtarı (ücretsiz)   |
| Google/Bing'e hızlı dizinleme                            | IndexNow                    | Yok                            |
| Claude ile kullanım                                      | FOXSEO MCP sunucusu         | Yok                            |

> Not: Bing'deki hacimler Bing aramalarındaki gösterim sayısıdır (son 30 gün). Google hacminden düşüktür ama kelimeleri birbiriyle kıyaslamak için iyi bir göstergedir. Google'daki gerçek verilerin için Search Console sayfasını (GSC Insights) kullan.

---

## Hızlı başlangıç (5 dakika)

1. **Node.js'i kur**: https://nodejs.org adresinden **LTS** sürümünü indir, varsayılan seçeneklerle kur.
2. **PowerShell'i yönetici olarak aç** (Başlat → "PowerShell" yaz → sağ tık → "Yönetici olarak çalıştır") ve bir kere şunu çalıştır, sonra pencereyi kapat:

   ```powershell
   corepack enable
   ```

3. **FOXSEO'yu indir**: https://github.com/bugrahantasgoz/FOXSEO adresinde yeşil **Code** düğmesi → **Download ZIP**. ZIP'e sağ tık → **Tümünü ayıkla** → örneğin `Belgeler\FOXSEO` klasörüne çıkar.
4. **Çalıştır**: Klasördeki **`FOXSEO-Baslat.bat`** dosyasına çift tıkla.
   - İlk açılışta gerekli dosyaları indirir, birkaç dakika sürebilir.
   - Windows "bilgisayarınız korundu" derse **Ek bilgi → Yine de çalıştır**.
   - Tarayıcın kendiliğinden **http://localhost:3001** adresini açar.
   - Siyah pencere açık kaldığı sürece FOXSEO çalışır. Kapatınca FOXSEO da kapanır.

### Masaüstü uygulaması gibi kullanmak

FOXSEO açıkken tarayıcıdan "uygulama olarak yükle" dersen tilki simgeli, kendi penceresinde açılan bir uygulama olur:

- **Edge**: sağ üstte **⋯ → Uygulamalar → Bu siteyi uygulama olarak yükle**
- **Chrome**: sağ üstte **⋮ → Yayınla, kaydet ve paylaş → Sayfayı uygulama olarak yükle** (bazı sürümlerde "Kaydet ve paylaş")

Sonra Başlat menüsünde ve görev çubuğunda **FOXSEO** simgesi olur. Kullanmadan önce yine `FOXSEO-Baslat.bat` ile çalıştırman gerekir.

İstersen `FOXSEO-Baslat.bat` dosyasına sağ tık → **Kısayol oluştur**, kısayolu masaüstüne taşı.

> Geliştiriciler için: ZIP yerine `git clone https://github.com/bugrahantasgoz/FOXSEO.git` de kullanabilirsin. Git ile indirirsen `FOXSEO-Guncelle.bat` güncellemeyi tek tıkla yapar.

Buraya kadarki adımlarla **site denetimi** hemen çalışır. Diğer özellikler için aşağıdaki ücretsiz anahtarları ekle.

## 3. Ayar dosyasını düzenle

İlk çalıştırmada FOXSEO klasöründe `.env.local` adında bir ayar dosyası oluşur. Bu dosyaya sağ tık → **Birlikte aç → Not Defteri** ile aç ve içeriğini şununla değiştir:

```
AUTH_MODE=local_noauth

# Google PageSpeed (hız ölçümü) – 4. adım
PAGESPEED_API_KEY=

# Google Search Console ve Analytics – 4. adım
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# En az 32 karakterlik rastgele bir yazı (Google bağlantı bilgilerini şifreler)
BETTER_AUTH_SECRET=buraya-en-az-32-karakterlik-rastgele-bir-yazi-yaz

# Bing anahtar kelime ve backlink – 5. adım
BING_WEBMASTER_API_KEY=
```

Boş bıraktığın satırlar sorun çıkarmaz; o özellik sadece ayar yapılana kadar çalışmaz.

## 4. Google ayarları (ücretsiz)

1. https://console.cloud.google.com adresine git ve yeni bir proje oluştur (örn. "FOXSEO").
2. **APIs & Services → Library** bölümünde şu API'leri bul ve **Enable** de:
   - Google Search Console API
   - Google Analytics Admin API
   - Google Analytics Data API
   - PageSpeed Insights API
3. **APIs & Services → Credentials → Create credentials → API key**. Oluşan anahtarı `.env.local` dosyasında `PAGESPEED_API_KEY=` satırına yapıştır.
4. **Google Auth Platform → Branding / Audience** (eski adı OAuth consent screen):
   - Uygulama adı: FOXSEO, kullanıcı türü: **External**.
   - **Test users** bölümüne kendi Google e-postanı ekle.
5. **Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs bölümüne şu ikisini ekle:
     - `http://localhost:3001/api/gsc/oauth/callback`
     - `http://localhost:3001/api/ga4/oauth/callback`
   - Oluşan **Client ID** ve **Client secret** değerlerini `.env.local` dosyasına yapıştır.

Siten Search Console'da kayıtlı değilse önce https://search.google.com/search-console adresinden ekleyip doğrula.

## 5. Bing ayarları (ücretsiz)

1. https://www.bing.com/webmasters adresine Microsoft veya Google hesabınla gir.
2. Siteni ekle. En kolayı "Google Search Console'dan içe aktar" seçeneği.
3. Sağ üstteki **Ayarlar (dişli) → API Access → API Key → Generate API Key**.
4. Anahtarı `.env.local` dosyasında `BING_WEBMASTER_API_KEY=` satırına yapıştır.

## 6. Anahtarları ekledikten sonra

`.env.local` dosyasını kaydet, FOXSEO'nun siyah penceresini kapat ve `FOXSEO-Baslat.bat` ile yeniden aç.

İlk iş: **Project settings** bölümünden sitenin adresini yaz, sonra **GSC Insights** sayfasından Google hesabını bağla.

## 7. Claude ile kullanmak (isteğe bağlı)

FOXSEO açıkken Claude, FOXSEO'daki verileri okuyup sana SEO önerisi verebilir.

**Claude Code** kullanıyorsan:

```powershell
claude mcp add --transport http foxseo http://localhost:3001/mcp
```

**Claude Desktop** kullanıyorsan: Ayarlar → Developer → Edit Config ile açılan `claude_desktop_config.json` dosyasına şunu ekle ve Claude'u yeniden başlat:

```json
{
  "mcpServers": {
    "foxseo": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3001/mcp"]
    }
  }
}
```

Sonra Claude'a örneğin "FOXSEO ile sitemi denetle ve en önemli 5 sorunu söyle" diyebilirsin.

## Güncelleme

- **Masaüstü uygulaması (FOXSEO-Kurulum.exe ile kurduysan)**: Kurulum klasöründeki **FOXSEO-Guncelle.exe** dosyasını çalıştır ya da uygulamada **Yardım → Güncellemeleri denetle** de. En yeni sürüm indirilip kurulur, verilerin ve ayarların korunur.
- **ZIP ile indirdiysen**: GitHub'dan yeni ZIP'i indir, yeni bir klasöre çıkar ve eski klasördeki `.env.local` dosyası ile `.wrangler` klasörünü (verilerin burada) yeni klasöre kopyala. Sonra `FOXSEO-Baslat.bat`.
- **Git ile indirdiysen**: `FOXSEO-Guncelle.bat` dosyasına çift tıkla.

## Sorun giderme

- **"pnpm kurulamadı" hatası**: Hızlı başlangıç 2. adımdaki `corepack enable` komutunu yönetici PowerShell'de çalıştır, sonra `FOXSEO-Baslat.bat`'ı tekrar aç.
- **Tarayıcı açıldı ama sayfa yüklenmedi**: İlk açılış uzun sürebilir. 30 saniye bekleyip sayfayı yenile (F5).
- **`.env.local` dosyasını göremiyorum**: Dosya Gezgini → **Görünüm → Göster → Dosya adı uzantıları** ve **Gizli öğeler**'i aç.
- **Hız ölçümü "429" hatası veriyor**: `PAGESPEED_API_KEY` boş. Anahtarsız Google çok az istek kabul ediyor.
- **Google bağlanırken "access blocked"**: E-postanı 4. adımdaki **Test users** listesine eklemeyi unutma.
- **Bing "site not verified" diyor**: Project settings'teki site adresi Bing'de doğruladığın adresle aynı olmalı (`https://` ve `www` dahil).

---

FOXSEO, MIT lisanslı OpenSEO projesinin bir türevidir. Orijinal telif bildirimi `LICENSE` dosyasında korunmuştur.
