# Peigen Nexus / 培根人脉星图

Peigen Nexus 是一个本地运行的人脉资产管理系统，用于完成战略定位、人脉档案、155 黄金圈、全息背景卡和维护行动管理。

## 运行方式

需要通过本地 Node 服务启动，服务会托管页面并把用户数据保存到项目目录中的本地 JSON 文件。

```powershell
npm start
```

然后访问：

```text
http://localhost:5173
```

也可以直接运行：

```powershell
node server.js
```

## 数据存储

用户数据默认保存在：

```text
data/peigen-nexus-data.json
```

页面启动时会从这个文件读取数据；用户新增档案、修改战略定位、创建维护行动时，会自动写回这个文件。

`localStorage` 只作为本地服务不可用时的兜底缓存，不作为主要数据源。

## 导入导出

- 导出数据：下载当前 `data/peigen-nexus-data.json` 内容，作为 JSON 备份。
- 导入数据：选择 JSON 备份后，会覆盖当前系统数据，并同步写入 `data/peigen-nexus-data.json`。

备份文件格式：

```json
{
  "app": "Peigen Nexus",
  "schemaVersion": 1,
  "exportedAt": "2026-05-01T00:00:00.000Z",
  "data": {
    "strategy": {},
    "people": [],
    "tasks": []
  },
  "settings": {
    "theme": "light",
    "accent": "appleBlue",
    "customAccent": "#155eef",
    "archiveLayout": "card"
  }
}
```

## 项目结构

```text
.
├── index.html
├── styles.css
├── app.js
├── server.js
├── package.json
├── data/
│   └── peigen-nexus-data.json
├── ico/
│   └── 图标.png
├── docs/
└── 人脉管理课程总结.md
```
