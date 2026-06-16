# VEROX — 男性天然活力补充剂 跨境独立站（静态版 · 第一版）

面向全球（北美 / 英澳 / 欧洲 / 中东等）的男性天然活力补充剂 DTC 独立站。
**第一版刻意不接在线支付**：访客提交订单/询单 → 你确认能否寄送 + 价格 → 发安全付款链接 → 低调直送。
这样可绕开“保健品被 Shopify Payments / Stripe / PayPal 判为高风险而封号”的最大坑（详见市场分析报告）。

> 部署路线、目录结构、CMS 后台与狗的项目（pawsport-site）完全一致，便于复用与维护。

## 目录结构

```
verox-site/
├── index.html            # 单页站点
├── admin/                # Decap CMS 后台（/admin 登录管理）
│   ├── index.html
│   └── config.yml
├── content/              # ★ 网站内容数据（后台改的就是这些 JSON）
│   ├── products.json     # 产品、价格、图片、成分、介绍
│   ├── videos.json
│   ├── testimonials.json
│   └── settings.json     # 联系方式、数据条、首页图
├── assets/
│   ├── css/styles.css
│   ├── js/
│   │   ├── i18n.js       # 界面多语言（EN/ZH/ES/DE/AR）+ 多语言 SEO
│   │   └── main.js       # 从 content/*.json 加载并渲染
│   ├── img/README.txt    # 图片放置约定
│   └── video/README.txt  # 视频放置约定
├── netlify.toml
├── CMS-SETUP.md          # ★ 后台开通步骤（GitHub + Netlify）
└── README.md
```

## 本地预览

在 `verox-site/` 目录下运行：

```bash
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

或用 VS Code 的 Live Server 插件直接打开 `index.html`。

## 多语言

右上角语言下拉切换，首次访问按浏览器语言自动选择，并记忆（localStorage）。
已内置 5 种语言：**English / 简体中文 / Español / Deutsch / العربية（自动 RTL）**。

- 改文案：编辑 `assets/js/i18n.js`，每种语言一个对象，键名与 `index.html` 的 `data-i18n="..."` 对应。
- 加语言：在顶部 `LANGS` 增加 `{ code, name }`，再补 `I18N.<code> = {...}`；右到左语言把 code 加进 `RTL_LANGS`。
- 产品的名称/介绍/成分分中英文（`_en` / `_zh`），其他语言自动回退到英文（产品英文名很正常）。

## 多语言 SEO（自动）

`i18n.js` 自动处理：`<title>` / `meta description` / Open Graph / Twitter 卡片随语言更新；
自动注入 `hreflang`（含 `x-default`）；切换语言时地址带 `?lang=` 且同步 `canonical`。

上线后在 `index.html` 的 `<head>` 固定正式域名，让 canonical/hreflang 用正式地址：

```html
<meta name="site-url" content="https://你的域名.com/" />
```

## 需要你替换 / 配置的内容（重要）

1. **联系方式 / 接单**：在后台“站点设置”里或 `content/settings.json` 填：
   - `email`：接单邮箱
   - `whatsapp`：国际格式纯数字（如 `8210xxxxxxxx`），填了才显示 WhatsApp 按钮
   - `formEndpoint`：到 [formspree.io](https://formspree.io) 免费注册拿一个表单地址；
     **留空** 则点击“发送”自动打开访客邮件客户端（也能用）。
2. **图片 / 视频**：放进 `assets/img/`、`assets/video/`，文件名按 README.txt 约定，自动覆盖占位图。
3. **产品**：在后台“产品管理”或 `content/products.json` 增删改产品、价格、成分与文案。
4. **品牌名**：当前为 `VEROX`，可在 `index.html`（brand-mark、footer）与文案中替换。

## 部署（境外节点，避免 ICP 备案）

纯静态，任选其一：

- **Cloudflare Pages / Netlify / Vercel**（推荐，免费、自带 CDN+HTTPS）：
  把 `verox-site/` 作为项目根目录，无需构建命令，直接连 Git 部署。
- **VPS（香港/新加坡）**：上传到 Nginx 站点目录（`root /var/www/verox-site;`）。

域名建议用 Cloudflare Registrar / Namecheap，在 Cloudflare 开启 CDN + HTTPS。

> 想用后台 `/admin` 改价上图：需按 `CMS-SETUP.md` 把站点连到 GitHub + Netlify 并开启 Identity。
> 纯拖拽 Drop 部署无法使用后台保存。

## 合规与支付提醒（务必读）

- **第一版不接标准在线支付**：保健品/性功能宣称是高风险类目，Shopify Payments / Stripe / PayPal 易封号。
- **不要做医疗功效宣称**（治疗 ED、壮阳等）；文案统一用“活力 / 精力 / 耐力 / 状态”，并保留底部 FDA 免责声明。
- **绝不掺西地那非等处方成分**（掺药 = 刑事风险，海关高查验）。
- **成分逐目标国核准**（欧盟、澳新、中东差异大）；下单前确认能否寄送。

## 下一步（第二版可做）

- 接入高风险支付通道（Authorize.net / NMI 等）或合规的订阅引擎，做真正的在线下单。
- 加订阅“Subscribe & Save”自动续费，提升 LTV。
- 内容/SEO 落地页（按成分/人群建条件页，压低 CAC，参考 Ro 路线）。
