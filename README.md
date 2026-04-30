# Peigen Nexus / 培根人脉星图

Peigen Nexus 是一个纯前端、本地运行的人脉资产管理系统。它把《人脉管理课程总结.md》中的方法整理成可执行的工作台，用于完成战略定位、人脉档案、155 黄金圈、全息背景卡和维护行动管理。

当前版本不需要后端，数据保存在浏览器本地，并支持完整 JSON 备份导入 / 导出。

## 功能概览

- 关系资产驾驶舱：查看战略定位、人脉档案、155 黄金圈和维护行动状态
- 关系战略定位：围绕“我想做什么、服务谁、对方缺什么、我能带来什么改变”建立判断基础
- 人脉档案：记录姓名、角色、职业、户籍、居住地、行业、影响力、亲密程度等信息
- 全息背景卡：记录生态圈、相识记录、家庭信息、特征、工作、爱好、特殊细节和启发
- 155 黄金圈：按命友、密友、好友管理重点关系
- 维护行动：为指定人脉创建欣赏、分享、陪伴、推荐、支持、保护等行动
- 方法框架：展示课程精华内容，并提供目录跳转
- 执行路径：按课程整理的完整操作步骤推进使用
- 主题系统：支持白天 / 黑夜主题、Apple 风格强调色和自定义强调色
- 数据迁移：支持完整 JSON 备份导出和全覆盖导入

## 运行方式

这是一个静态前端项目，直接打开 `index.html` 即可使用。

也可以启动本地静态服务器：

```powershell
python -m http.server 5173
```

然后访问：

```text
http://localhost:5173
```

## 数据存储

当前数据保存在浏览器 `localStorage` 中：

```text
peigen-nexus-state
```

导出的备份文件格式：

```json
{
  "app": "Peigen Nexus",
  "schemaVersion": 1,
  "exportedAt": "2026-04-30T00:00:00.000Z",
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

导入备份时会全覆盖当前数据，不做自动合并。

## 项目结构

```text
.
├─ index.html                  # 应用入口
├─ styles.css                  # 页面样式
├─ app.js                      # 交互逻辑与本地数据管理
├─ 人脉管理课程总结.md          # 方法内容来源
├─ ico/
│  └─ 图标.png                 # 应用图标
└─ docs/
   ├─ PRD_REGISTRY.md
   └─ prd/
      └─ PRD-001.md
```

## GitHub Pages 部署

上传到 GitHub 后，可以在仓库设置中启用 GitHub Pages：

1. 进入仓库 `Settings`
2. 打开 `Pages`
3. Source 选择 `Deploy from a branch`
4. Branch 选择 `main`，目录选择 `/root`
5. 保存后等待 GitHub 生成访问地址

## 说明

本项目目前是个人本地工具，不包含账号系统、云同步和多人协作。后续如果需要多端同步，可以在现有 JSON 备份格式基础上增加合并导入或云端存储。
