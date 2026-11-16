@echo off
chcp 65001 >nul
title منصة مراقبة الجودة - كاك بنك
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  echo تشغيل المنصة على خادم محلي...
  node serve.mjs
  goto end
)
where python >nul 2>nul
if %errorlevel%==0 (
  echo تشغيل المنصة على خادم محلي عبر Python...
  start "" http://127.0.0.1:8787/
  python -m http.server 8787 --bind 127.0.0.1
  goto end
)
echo لم يتم العثور على Node أو Python - سيتم فتح المنصة مباشرة في المتصفح.
start "" "%~dp0index.html"
:end
