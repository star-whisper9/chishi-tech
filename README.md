# React + TypeScript + Vite

赤石科技工具集 - 基于 React 18、TypeScript 和 Vite 构建的现代 Web 应用。

## 功能特性

- **视频转换器**: 基于 FFmpeg.wasm 的浏览器端视频转换工具
- **二维码时钟**: 动态生成包含时间信息的二维码
- **BadVideo**: 视频文件损坏工具
- 更多工具开发中...

## 技术栈

- React 18
- TypeScript
- Vite
- Material-UI (MUI)
- Redux Toolkit
- FFmpeg.wasm

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用会在 `http://localhost:5173` 启动，并自动配置了跨域隔离响应头以支持 FFmpeg.wasm。

### 构建生产版本

```bash
npm run build
```

构建输出在 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 部署

**⚠️ 重要：** 本项目使用 FFmpeg.wasm，需要特定的 HTTP 响应头才能正常工作：

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### 快速部署指南

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

**Nginx 最小配置：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/chishi-tech/dist;

    # 必需的跨域隔离头
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Vercel 配置（vercel.json）：**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

### 支持的部署平台

✅ Nginx、Apache、Vercel、Netlify、Docker  
❌ GitHub Pages (不支持自定义响应头)

完整配置示例参见：

- [nginx.conf.example](./nginx.conf.example) - Nginx 完整配置
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南

## 项目结构

```
src/
  ├── config/          # 静态配置
  ├── utils/           # 工具函数
  ├── assets/          # 静态资源
  ├── router/          # 路由配置
  ├── stores/          # Redux 状态管理
  ├── pages/           # 页面组件
  ├── components/      # UI 组件
  │   ├── common/      # 通用组件
  │   ├── layout/      # 布局组件
  │   └── specific/    # 业务组件
  └── hooks/           # 自定义 Hooks
```

## FFmpeg.wasm 支持

本项目集成了 FFmpeg.wasm，支持在浏览器端进行视频转换：

- 使用 WebAssembly 技术，无需服务器处理
- 所有转换在本地完成，保护隐私
- 支持 WORKERFS 优化（在支持的浏览器环境中自动启用）

**文件大小限制**：

- 默认限制：768MB
- 可解除至：4GB（需用户确认）

**注意**：由于输出文件需要写入内存，建议处理的视频文件不要过大，以免造成浏览器卡顿或崩溃。

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## QrClock 组件

二维码时钟组件会每秒刷新二维码内容，二维码内编码 JSON：`{ iso, timeZone, formatted, epoch }`。

### 使用示例

```tsx
import { QrClock } from "@/components/specific/qrclock";

export default function Demo() {
  return (
    <div style={{ padding: 24 }}>
      <QrClock size={220} level="M" />
    </div>
  );
}
```

### 自定义标签渲染

```tsx
<QrClock
  renderLabel={(formatted, tz) => (
    <span>
      {formatted} - {tz}
    </span>
  )}
/>
```

### Hook 独立使用

```ts
import useQrClock from "@/hooks/useQrClock";

const { text, formatted, timeZone, setTimeZone } = useQrClock({
  initialTimeZone: "UTC",
});
```
