@echo off
chcp 65001 >nul
title ESTILO PRIME — Servidor
cd /d "%~dp0"

echo ============================================
echo   ESTILO PRIME — http://localhost:3000
echo   Loja:  /          Painel: /admin/dashboard
echo   Login demo: admin@estiloprime.store / prime2026
echo   (feche esta janela para PARAR o servidor)
echo ============================================
echo.

rem encerra processos órfãos na porta 3000, se houver
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 .*LISTENING"') do taskkill /PID %%a /F >nul 2>&1

call npm run dev

echo.
echo O servidor foi encerrado. Pressione qualquer tecla para fechar.
pause >nul
