# JobReady · 智能校招助手

一个从"被动记录"升级为"主动规划与进化"的本地化 AI 求职智能体 (Agent)。

## ✨ 核心功能

### 第一期 (MVP)
1. **智能投递看板** - 记录并追踪所有投递进度，支持 Kanban 视图和表格视图
2. **个人档案管理** - 简历上传与 PDF 文本解析，多版本管理
3. **自我介绍工坊** - 三步引导式生成个性化自我介绍

### 第二期 (规划中)
4. **面试备战** - AI 题库生成 + 文字作答 + AI 评分
5. **面经录入** - 粘贴解析 + 与 AI 题库融合
6. **首页 Dashboard** - 统计卡片 + 提醒列表

### 第三期 (规划中)
7. **语音输入** - 面试作答语音识别
8. **语音播放** - 自我介绍练习
9. **数据导出** - JSON 备份/恢复
10. **多条面经综合分析**

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: shadcn/ui + Tailwind CSS
- **AI 能力**: DeepSeek API (兼容 OpenAI 格式)
- **路由**: React Router v6
- **状态管理**: React Context + useReducer
- **数据存储**: localStorage + IndexedDB
- **图标**: lucide-react

## 🎨 设计理念

**治愈系求职避风港** - 传递"生动、轻松、无压迫感、安全私密"的情绪价值：

- **色彩系统**: 禁用纯白和冷灰，使用暖白/纸张色背景，鼠尾草绿主色调，柔和的珊瑚红危险状态
- **形态与排版**: 全局大圆角，弥散阴影，增加行高，深灰色段落文字
- **安全感背书**: 所有数据加密保存在本地浏览器
- **微文案**: 空状态时配可爱 Emoji，治愈系鼓励文案

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发运行
```bash
npm run dev
# 或
yarn dev
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

### 预览生产版本
```bash
npm run preview
# 或
yarn preview
```

## 🔧 配置

### DeepSeek API 设置
1. 访问 [DeepSeek 平台](https://platform.deepseek.com/api-keys) 获取 API Key
2. 在应用的「设置」页面中输入 API Key
3. 保存后即可使用所有 AI 功能

### 数据存储
- **投递记录、面经、自我介绍等**: localStorage
- **简历 PDF 文件**: IndexedDB
- **所有数据仅保存在本地浏览器**，不会上传到任何服务器

## 📁 项目结构

```
jobready/
├── src/
│   ├── components/     # 可复用组件
│   │   ├── ui/        # shadcn/ui 组件
│   │   └── Layout.tsx # 主布局
│   ├── pages/         # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Applications.tsx
│   │   ├── Profile.tsx
│   │   └── ...
│   ├── lib/          # 工具函数和存储
│   │   ├── storage.ts # localStorage 封装
│   │   └── utils.ts   # 工具函数
│   ├── types/        # TypeScript 类型定义
│   ├── hooks/        # 自定义 Hook
│   └── services/     # API 服务
├── public/           # 静态资源
└── ...
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [Lucide React](https://lucide.dev/) - 精美的图标库
- [DeepSeek](https://www.deepseek.com/) - AI 能力支持

---

**✨ 所有简历与投递数据均加密保存在本地浏览器，请放心使用。**

*每一个伟大的职业生涯都从第一步开始。*