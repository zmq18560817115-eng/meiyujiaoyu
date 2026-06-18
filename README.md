# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: [https://ai.studio/apps/2a5e1129-526c-4f93-8648-d5b8913f3073](https://ai.studio/apps/2a5e1129-526c-4f93-8648-d5b8913f3073)

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
  `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
  `npm run dev`

## REST API（已实现）

服务入口 `http://localhost:3000`，统一响应格式 `{ code, message, data }`。

**演示教师账号：** 工号 `SL-1008`，密码 `demo123`（密码也可留空）


| 模块  | 主要接口                                                                                        |
| --- | ------------------------------------------------------------------------------------------- |
| 鉴权  | `POST /api/auth/teacher/login`、`GET /api/auth/me`                                           |
| 作品  | `GET/POST /api/artworks`、`PATCH /api/artworks/:id/approve`、`POST /api/artworks/:id/likes`   |
| 课程  | `GET/POST /api/courses`                                                                     |
| 资源  | `GET/POST /api/resources`、`POST /api/resources/:id/download`                                |
| 看板  | `GET /api/dashboard/teacher`、`GET /api/announcements`、`GET /api/bootstrap/`*                |
| 全景  | `GET /api/panorama/hotspots`、`POST /api/panorama/projection`                                |
| AI  | `POST /api/chat`、`POST /api/prepare`、`POST /api/ai-motif`、`POST /api/whiteboards/structure` |


数据持久化在 `data/store.json`（首次启动自动从种子数据初始化）。

## 增强功能

1. **学生登录**：入口选择「学生登录」，填写姓名与班级后进入研学舱，作品自动署名。
2. **画布 PNG 导出**：发布作品时将 SVG 设色稿导出为 PNG 并上传至 `/api/uploads`。
3. **WebSocket 投屏**：教师端 3D 全景点击「投屏」后，学生端 3D 视图实时跟随热点（`ws://host/ws/projection`）。

