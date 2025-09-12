import { LockClockRounded, QrCode2Rounded } from "@mui/icons-material";
import React from "react";
// 可在此处 import 位图或 svg 资源，如:
// import clockPng from '../assets/clock.png';

export type Page = {
  title: string;
  icon?: React.ReactNode; // 支持 MUI 图标组件实例 / 自定义 SVG / <img>
  description: string;
  lastUpdated: string;
  link: string;
};

export const pages: Page[] = [
  {
    title: "示例页面",
    icon: React.createElement(LockClockRounded, {
      color: "primary",
      fontSize: "large",
    }),
    description: "这是一个示例页面，展示了项目的基本结构。",
    lastUpdated: "2025-9-12",
    link: "/example",
  },
  {
    title: "二维码时钟",
    icon: React.createElement(QrCode2Rounded, {
      color: "secondary",
      fontSize: "large",
    }),
    description: "每秒更新的时间二维码，可选择常用时区。",
    lastUpdated: "2025-9-12",
    link: "/qrclock",
  },
];
