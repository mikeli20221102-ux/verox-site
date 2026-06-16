@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   VEROX 本地预览服务器
echo   请勿关闭此窗口（关闭即停止网站）
echo   浏览器访问: http://localhost:8080
echo ============================================
start "" "http://localhost:8080"
python -m http.server 8080
pause
