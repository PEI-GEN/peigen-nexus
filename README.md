# Peigen Nexus / 培根人脉星图

Peigen Nexus 是一个人脉资产管理系统，用于完成战略定位、人脉档案、155 黄金圈、全息背景卡和维护行动管理。

## 本地运行

```powershell
npm start
```

然后访问：

```text
http://localhost:5173
```

本地没有配置 Supabase 时，系统会使用 `data/peigen-nexus-data.json` 作为数据文件。

## 网页端部署

推荐部署到 Vercel，并使用 Supabase 作为登录和数据库。

### 1. 创建 Supabase 项目

在 Supabase 控制台创建项目后，打开 SQL Editor，执行：

```text
docs/supabase-schema.sql
```

这会创建 `app_states` 表，并启用用户只能读写自己数据的权限规则。

### 2. 配置 Vercel 环境变量

在 Vercel 项目设置中添加：

```text
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_ANON_KEY=你的 Supabase anon public key
```

### 3. 部署

把代码推送到 GitHub，并在 Vercel 导入该仓库。部署完成后，网页会自动进入云端模式：

- 用户需要注册/登录
- 每个用户的数据独立保存
- 数据自动同步到 Supabase
- 导入数据会覆盖当前登录用户的数据
- 导出数据会下载当前登录用户的数据备份

## 数据存储

- 网页端：数据保存在 Supabase 的 `app_states.payload` 字段中。
- 本地端：没有 Supabase 配置时，数据保存在 `data/peigen-nexus-data.json`。
- `localStorage` 只作为临时兜底缓存。

## 项目结构

```text
.
├── api/
│   └── config.js
├── data/
│   └── peigen-nexus-data.json
├── docs/
│   └── supabase-schema.sql
├── index.html
├── styles.css
├── assets/
│   └── app.js
├── scripts/
│   └── local-server.js
├── package.json
└── 人脉管理课程总结.md
```
