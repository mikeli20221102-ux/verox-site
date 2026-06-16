# Decap CMS 后台 — 开通指南（VEROX）

后台地址：**https://你的域名/admin/**
在这里可以：改价格、上传图片、新增/下架产品、改评价和数据条，**不用改代码**。

> ⚠️ 后台必须配合 **GitHub + Netlify 自动部署** 才能保存。
> 如果只用「拖拽上传」、没有 Git，后台无法写入。

---

## 第一步：代码放到 GitHub（约 10 分钟）

1. 注册/登录 [github.com](https://github.com)
2. 右上角 **New repository** → 名字如 `verox-site` → **Public** → Create
3. 把本地 `verox-site` 文件夹上传到仓库：
   - 网页：仓库页 **Add file → Upload files**，拖入整个文件夹内容（含 `admin/`、`content/`）
   - 或用 [GitHub Desktop](https://desktop.github.com)：Clone 空仓库 → 复制文件 → Commit → Push

确保仓库根目录有：`index.html`、`admin/`、`content/`、`assets/`、`netlify.toml`

---

## 第二步：Netlify 连接 GitHub

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. 选 **GitHub** → 授权 → 选 `verox-site` 仓库
3. 构建设置（一般自动识别）：
   - **Build command**：留空
   - **Publish directory**：`.`（一个点）
4. **Deploy site** → 得到固定网址，如 `https://verox.netlify.app`

以后：**改 GitHub 上的文件 = 自动重新部署**。

---

## 第三步：开启登录（Identity + Git Gateway）

1. Netlify 项目 → **Site configuration → Identity** → **Enable Identity**
2. **Identity → Registration** → 选 **Invite only**（只允许你邀请的人进后台）
3. **Identity → Services → Git Gateway** → **Enable Git Gateway**
4. **Identity → Invite users** → 输入你的邮箱 → 收邮件设密码

---

## 第四步：改后台配置里的域名

编辑仓库里的 `admin/config.yml`，把这两行改成你的 Netlify 网址：

```yaml
site_url: https://verox.netlify.app
display_url: https://verox.netlify.app
```

保存并 Push → 等 Netlify 自动部署完成。

---

## 第五步：登录后台

1. 浏览器打开 **https://你的域名/admin/**
2. 用第三步邀请的邮箱登录
3. 左侧菜单：
   - **站点设置** — 邮箱、WhatsApp、Facebook、数据条、首页/关于/配送图片
   - **产品管理** — 改价、上传封面和相册、新增产品（填 ID、英文名、价格、成分、图文）
   - **视频** — 封面和视频路径
   - **客户评价** — 增删改评价

改完点 **Publish** → 约 1–2 分钟网站自动更新。

---

## 新增一个产品（后台操作）

1. **产品管理 → 所有产品 → 产品列表 → Add 产品列表 item**
2. 填写：
   - **ID**：英文小写，如 `apex-drive`（创建后勿改）
   - **上架显示**：勾选
   - **英文名 / 中文名 / 价格 / 单位**
   - **封面图**、**详情相册**（点 Upload 直接传图）
   - 中英文标签、介绍、形式/用量/成分/规格/适合
3. **Publish** → 前台自动出现新产品，下单下拉也会更新

---

## 常见问题

**Q：/admin 打开空白或报错？**
确认已 Deploy 且 `admin/config.yml` 在仓库里；Identity 和 Git Gateway 已开启。

**Q：Publish 后前台没变？**
等 Netlify Deploy 完成（Deploys 页绿色 ✓）；浏览器强制刷新。

**Q：还想本地预览？**
在 `verox-site` 目录：`python -m http.server 8080`，打开 http://localhost:8080

| 方式 | 更新网站 | 能用 /admin 后台 |
|------|----------|------------------|
| Netlify Drop 拖拽 | ✅ | ❌ |
| GitHub + Netlify（推荐） | ✅ 自动 | ✅ |
