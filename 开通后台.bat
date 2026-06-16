@echo off
chcp 65001 >nul
cd /d "%~dp0"
title VEROX 后台开通助手

echo.
echo ============================================
echo   VEROX 后台开通助手
echo   (GitHub + Netlify + Decap CMS)
echo ============================================
echo.

where gh >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 GitHub CLI，请先安装: winget install GitHub.cli
  pause
  exit /b 1
)

echo [1/4] 检查 GitHub 登录状态...
gh auth status >nul 2>&1
if errorlevel 1 (
  echo.
  echo 需要登录 GitHub（会弹出浏览器，用你的 GitHub 账号授权）
  echo 狗项目用的账号: mikeli20221102-ux
  echo.
  gh auth login --hostname github.com --git-protocol https --web
  if errorlevel 1 (
    echo [错误] GitHub 登录失败，请重试
    pause
    exit /b 1
  )
)

echo.
echo [2/4] 创建 GitHub 仓库并推送代码...
gh repo view mikeli20221102-ux/verox-site >nul 2>&1
if errorlevel 1 (
  gh repo create verox-site --public --source=. --remote=origin --push --description "VEROX men's vitality DTC site with Decap CMS"
) else (
  git remote remove origin 2>nul
  git remote add origin https://github.com/mikeli20221102-ux/verox-site.git
  git push -u origin main
)
if errorlevel 1 (
  echo [错误] 推送失败，请检查网络或 GitHub 权限
  pause
  exit /b 1
)

echo.
echo [3/4] 打开 Netlify 创建站点（需你在网页里操作）...
echo.
echo 请在 Netlify 网页中完成:
echo   1. Add new site - Import from Git - 选 verox-site 仓库
echo   2. Build command 留空, Publish directory 填 .
echo   3. Deploy 后得到网址，如 https://verox.netlify.app
echo   4. Site configuration - Identity - Enable Identity
echo   5. Registration 选 Invite only
echo   6. Services - Git Gateway - Enable
echo   7. Invite users - 填你的邮箱收邀请设密码
echo.
start "" "https://app.netlify.com/start"
start "" "https://github.com/mikeli20221102-ux/verox-site"

echo.
echo [4/4] 部署完成后:
echo   - 前台: https://你的域名/
echo   - 后台: https://你的域名/admin/
echo   - 记得把 admin/config.yml 里的 site_url 改成你的 Netlify 域名
echo.
echo 详细图文步骤见: CMS-SETUP.md
echo.
pause
