# Peigen Nexus / 培根人脉星图

Peigen Nexus 是一个本地运行的人脉资产管理系统，用于完成战略定位、人脉档案、155 黄金圈、全息背景卡和维护行动管理。

## 本地运行

先准备 MySQL。默认连接参数：

```text
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=peigen_nexus
```

如果你的 MySQL 密码或账号不同，可以复制 `.env.example` 为 `.env`，或在启动前设置对应环境变量。

安装依赖：

```powershell
npm install
```

启动系统：

```powershell
npm start
```

然后访问：

```text
http://localhost:5173
```

服务启动时会自动创建数据库和 `app_state` 表。首次启动会尝试把 `data/peigen-nexus-data.json` 中的旧数据迁移进 MySQL。

首次打开页面时需要注册账号。注册后，系统会为该账号创建独立的数据记录；之后登录同一账号即可继续使用自己的数据。

## 数据存储

用户数据保存在 MySQL：

```text
database: peigen_nexus
table: users
table: app_state
```

`users` 保存本地账号；`app_state` 按用户保存完整应用状态 JSON payload。导入数据会覆盖当前登录账号的数据，导出数据会下载当前登录账号的数据备份。

`localStorage` 只作为页面临时兜底缓存，不作为主要数据源。

## 手动建表

服务会自动建库建表。如果你想手动执行，可以使用：

```text
docs/mysql-schema.sql
```

## 项目结构

```text
.
├── assets/
│   └── app.js
├── data/
│   └── peigen-nexus-data.json      # 旧数据迁移来源
├── docs/
│   ├── mysql-schema.sql
│   └── supabase-schema.sql         # 历史云端方案保留
├── scripts/
│   ├── local-server.js
│   ├── write-config.js
│   └── build-static.js
├── index.html
├── styles.css
├── package.json
└── 人脉管理课程总结.md
```
