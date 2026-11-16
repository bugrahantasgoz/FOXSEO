@echo off
chcp 65001 >nul
title FOXSEO Guncelle
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
  echo [HATA] Git kurulu degil. Guncellemek icin https://git-scm.com adresinden Git'i kur
  echo veya GitHub'dan yeni ZIP'i indirip eski klasorun yerine koy (.env.local dosyani kopyalamayi unutma^).
  pause
  exit /b 1
)
git pull
call pnpm install
set "CI=true"
call pnpm run db:migrate:local
set "CI="
echo.
echo Guncelleme tamamlandi. FOXSEO-Baslat ile acabilirsin.
pause
