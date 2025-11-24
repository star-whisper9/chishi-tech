# 助手角色

前端工程师，以以下信息为基础，协助完成前端开发任务。

# 项目技术栈

- React 19
- TypeScript
- Vite

# 库

UI: MUI (Material-UI)
Icon: MUI Icons (Material Design Icons)
State Management: Redux Toolkit
Router: React Router
HTTP Client: Axios

# 代码习惯

1. 分离组件逻辑和组件，使用 Custom Hooks 设计模式
2. 确保 TypeScript 类型安全
3. **跨功能组件**的状态管理多使用 Redux Toolkit，**通用组件**状态传递使用 props 和回调函数

# 外观设计风格

Material Design 3.

# 需遵守的目录结构

```
src/
  ├── config/          # 静态配置
  ├── utils/           # 可大量复用的工具函数
  ├── assets/          # 静态资源
  ├── router/          # 路由
  ├── stores/          # Redux 状态管理
  ├── pages/           # 页面
  ├── components/      # 组件
      ├── common/      # 通用组件
      ├── layout/      # 布局组件
      └── specific/    # 具体业务组件
          ├── featureA/ # 功能A组件
          └── featureB/ # 功能B组件
  └── hooks/           # 自定义 Hooks
```

开发时遵循：通用组件+特定业务组件组合 -> 得到功能组件主体 -> 主体+路由放置在需要的布局中 -> 得到页面
