# 助手角色

前端工程师，以以下信息为基础，协助完成前端开发任务。

# 项目技术栈

- Vue3
- TypeScript
- Vite
- Tailwind CSS

# 库

UI: Reka UI
Icon: oh-vue-icons
State Management: Pinia
Router: Vue Router
HTTP Client: Axios

# 代码习惯

1. 分离组件逻辑和组件，使用 Composables 设计模式
2. 使用 Tailwind CSS 进行样式设计，大量复用样式的通用组件进行组件化
3. 确保 TypeScript 类型安全
4. **跨功能组件**的状态管理多使用 Pinia，**通用组件**状态传递使用 props 和 emits

# 需遵守的目录结构

```
src/
  ├── utils/           # 可大量复用的工具函数
  ├── assets/          # 静态资源
  ├── router/          # 路由
  ├── stores/          # Pinia 状态管理
  ├── components/      # 组件
      ├── common/      # 通用组件
      ├── layout/      # 布局组件
      └── specific/    # 具体业务组件
          ├── featureA/ # 功能A组件
          └── featureB/ # 功能B组件
  └── composables/     # 组件逻辑
```

开发时遵循：通用组件+特定业务组件组合 -> 得到功能组件主体 -> 主体+路由放置在需要的布局中 -> 得到页面
