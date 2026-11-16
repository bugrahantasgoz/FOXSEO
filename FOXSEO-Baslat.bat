@echo off
chcp 65001 >nul
title FOXSEO
cd /d "%~dp0"

echo.
echo   FOXSEO baslatiliyor...
echo   Bu pencereyi KAPATMA. Kapatirsan FOXSEO da kapanir.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kur ve tekrar dene.
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm hazirlaniyor...
  call corepack enable
  where pnpm >nul 2>nul
  if errorlevel 1 (
    echo [HATA] pnpm kurulamadi. PowerShell'i "Yonetici olarak" acip su komutu calistir:  corepack enable
    pause
    exit /b 1
  )
)

if not exist ".env.local" (
  echo AUTH_MODE=local_noauth> ".env.local"
  echo .env.local dosyasi olusturuldu. Google ve Bing anahtarlarini sonra ekleyebilirsin.
)

echo Gerekli dosyalar kontrol ediliyor (ilk seferde birkac dakika surebilir)...
call pnpm install
if errorlevel 1 (
  echo [HATA] Kurulum basarisiz oldu. Internet baglantini kontrol et.
  pause
  exit /b 1
)

set "CI=true"
call pnpm run db:migrate:local >nul
set "CI="

echo.
echo   Tarayicin birazdan acilacak: http://localhost:3001
echo.
start "" /min cmd /c "timeout /t 20 /nobreak >nul & start http://localhost:3001"
call pnpm dev
pause
