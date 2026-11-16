// FOXSEO-Guncelle.exe: updates FOXSEO to the newest release on GitHub.
//
// Lives next to FOXSEO.exe in the install folder. It works with every FOXSEO
// version because it only reads the installed version from
// resources\app\package.json and always installs the newest release.
//
// Built with the .NET Framework compiler that ships with Windows
// (see .github/workflows/desktop.yml), so it needs no runtime install.
//
// Arguments (for CI and the app menu):
//   --check --report <file>   only compare versions, write the result to <file>
//   --dir <folder>            the FOXSEO install folder (default: this exe's folder)

using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

[assembly: System.Reflection.AssemblyTitle("FOXSEO Güncelleyici")]
[assembly: System.Reflection.AssemblyProduct("FOXSEO")]

static class Updater
{
    const string Repo = "bugrahantasgoz/FOXSEO";
    const string ReleasesApi = "https://api.github.com/repos/" + Repo + "/releases?per_page=20";
    const string ReleasesPage = "https://github.com/" + Repo + "/releases";
    const string Title = "FOXSEO Güncelleme";

    [STAThread]
    static int Main(string[] args)
    {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        string installDir = ArgValue(args, "--dir") ?? AppDomain.CurrentDomain.BaseDirectory;
        installDir = installDir.TrimEnd('\\', '/');
        bool checkOnly = HasArg(args, "--check");
        string report = ArgValue(args, "--report");

        try
        {
            Version installed = InstalledVersion(installDir);
            Release latest = LatestRelease();

            if (checkOnly)
            {
                string line = string.Format("installed={0} latest={1} asset={2} update={3}",
                    installed, latest.Version, latest.AssetName, latest.Version > installed);
                if (report != null) File.WriteAllText(report, line);
                return 0;
            }

            // The installer replaces this exe, so the update runs from a copy
            // in the temp folder.
            if (!HasArg(args, "--from-temp"))
            {
                string copy = Path.Combine(Path.GetTempPath(), "FOXSEO-Guncelle-" + Guid.NewGuid().ToString("N") + ".exe");
                File.Copy(Application.ExecutablePath, copy, true);
                Process.Start(copy, "--from-temp --dir \"" + installDir + "\"");
                return 0;
            }

            if (installed != null && latest.Version <= installed)
            {
                MessageBox.Show("FOXSEO güncel.\n\nKurulu sürüm: " + installed, Title,
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return 0;
            }

            string question = (installed == null ? "Kurulu sürüm okunamadı." : "Kurulu sürüm: " + installed)
                + "\nYeni sürüm: " + latest.Version
                + "\n\nFOXSEO kapatılıp güncellenecek. Verilerin ve ayarların korunur. Devam edilsin mi?";
            if (MessageBox.Show(question, Title, MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
                return 0;

            RunUpdate(installDir, latest);
            return 0;
        }
        catch (Exception error)
        {
            if (checkOnly)
            {
                if (report != null) File.WriteAllText(report, "error=" + error.Message);
                return 1;
            }
            MessageBox.Show("Güncelleme yapılamadı:\n" + error.Message
                + "\n\nİnternet bağlantını kontrol et veya yeni sürümü elle indir:\n" + ReleasesPage,
                Title, MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }

    class Release
    {
        public Version Version;
        public string AssetName;
        public string AssetUrl;
    }

    static Version InstalledVersion(string installDir)
    {
        string packageJson = Path.Combine(installDir, "resources", "app", "package.json");
        if (!File.Exists(packageJson)) return null;
        var data = (IDictionary)new JavaScriptSerializer().DeserializeObject(File.ReadAllText(packageJson));
        return ParseVersion(data["version"] as string);
    }

    static Release LatestRelease()
    {
        string json;
        using (var client = NewClient())
        {
            try
            {
                json = client.DownloadString(ReleasesApi);
            }
            catch (WebException error)
            {
                var response = error.Response as HttpWebResponse;
                if (response != null && response.StatusCode == HttpStatusCode.NotFound)
                    throw new Exception("Sürümler bulunamadı. FOXSEO reposu herkese açık olmalı.");
                throw;
            }
        }

        Release best = null;
        foreach (object entry in (object[])new JavaScriptSerializer().DeserializeObject(json))
        {
            var release = (IDictionary)entry;
            if (true.Equals(release["draft"])) continue;
            Version version = ParseVersion(release["tag_name"] as string);
            if (version == null) continue;
            foreach (object assetEntry in (object[])release["assets"])
            {
                var asset = (IDictionary)assetEntry;
                string name = asset["name"] as string ?? "";
                if (!Regex.IsMatch(name, @"^FOXSEO-Kurulum-.*\.exe$", RegexOptions.IgnoreCase)) continue;
                if (best == null || version > best.Version)
                {
                    best = new Release
                    {
                        Version = version,
                        AssetName = name,
                        AssetUrl = asset["browser_download_url"] as string,
                    };
                }
            }
        }
        if (best == null) throw new Exception("GitHub'da indirilebilir bir FOXSEO sürümü bulunamadı.");
        return best;
    }

    static void RunUpdate(string installDir, Release latest)
    {
        var form = new Form
        {
            Text = Title,
            Width = 440,
            Height = 150,
            FormBorderStyle = FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            MinimizeBox = false,
            StartPosition = FormStartPosition.CenterScreen,
        };
        var label = new Label { Left = 16, Top = 16, Width = 400, Text = "FOXSEO " + latest.Version + " indiriliyor..." };
        var bar = new ProgressBar { Left = 16, Top = 48, Width = 392, Height = 22 };
        form.Controls.Add(label);
        form.Controls.Add(bar);

        string installer = Path.Combine(Path.GetTempPath(), latest.AssetName);
        Exception failure = null;

        form.Shown += delegate
        {
            var client = NewClient();
            client.Headers.Remove(HttpRequestHeader.Accept);
            client.Headers.Remove(HttpRequestHeader.Authorization);
            client.DownloadProgressChanged += (s, e) => bar.Value = Math.Max(0, Math.Min(100, e.ProgressPercentage));
            client.DownloadFileCompleted += (s, e) =>
            {
                client.Dispose();
                if (e.Error != null) { failure = e.Error; form.Close(); return; }
                label.Text = "FOXSEO kapatılıyor ve kuruluyor...";
                bar.Style = ProgressBarStyle.Marquee;
                var worker = new Thread(() =>
                {
                    try { Install(installDir, installer); }
                    catch (Exception error) { failure = error; }
                    form.BeginInvoke(new Action(form.Close));
                });
                worker.IsBackground = true;
                worker.Start();
            };
            client.DownloadFileAsync(new Uri(latest.AssetUrl), installer);
        };
        Application.EnableVisualStyles();
        Application.Run(form);

        if (failure != null) throw failure;
        MessageBox.Show("FOXSEO " + latest.Version + " sürümüne güncellendi.", Title,
            MessageBoxButtons.OK, MessageBoxIcon.Information);
        string app = Path.Combine(installDir, "FOXSEO.exe");
        if (File.Exists(app)) Process.Start(app);
    }

    static void Install(string installDir, string installer)
    {
        foreach (string name in new[] { "FOXSEO", "workerd" })
        {
            foreach (Process process in Process.GetProcessesByName(name))
            {
                try { process.Kill(); process.WaitForExit(10000); } catch { }
            }
        }
        Thread.Sleep(1500);
        // /S: silent install; /D: the same folder (must come last, unquoted).
        var setup = Process.Start(new ProcessStartInfo(installer, "/S /D=" + installDir) { UseShellExecute = true });
        setup.WaitForExit();
        if (setup.ExitCode != 0) throw new Exception("Kurulum programı hata verdi (kod " + setup.ExitCode + ").");
        try { File.Delete(installer); } catch { }
    }

    static WebClient NewClient()
    {
        var client = new WebClient();
        client.Headers[HttpRequestHeader.UserAgent] = "FOXSEO-Updater";
        client.Headers[HttpRequestHeader.Accept] = "application/vnd.github+json";
        // CI only: lets the test read releases while the repository is private.
        string token = Environment.GetEnvironmentVariable("FOXSEO_GITHUB_TOKEN");
        if (!string.IsNullOrEmpty(token)) client.Headers[HttpRequestHeader.Authorization] = "Bearer " + token;
        return client;
    }

    static Version ParseVersion(string text)
    {
        if (string.IsNullOrEmpty(text)) return null;
        Match match = Regex.Match(text, @"(\d+)\.(\d+)\.(\d+)");
        if (!match.Success) return null;
        return new Version(int.Parse(match.Groups[1].Value), int.Parse(match.Groups[2].Value), int.Parse(match.Groups[3].Value));
    }

    static bool HasArg(string[] args, string name)
    {
        return Array.IndexOf(args, name) >= 0;
    }

    static string ArgValue(string[] args, string name)
    {
        int index = Array.IndexOf(args, name);
        return index >= 0 && index + 1 < args.Length ? args[index + 1] : null;
    }
}
