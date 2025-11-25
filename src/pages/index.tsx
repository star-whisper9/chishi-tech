import React from "react";
import {
  QrCode2Rounded,
  VideoFileRounded,
  ApiRounded,
} from "@mui/icons-material";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
// 位图两种使用方式：
// 1) public 下直接 /xxx.png 访问（不指纹）
// 2) src/assets 下 import 进来（构建指纹，推荐）
//    示例: import clockPng from '../assets/clock.png'; icon: <img src={clockPng} alt="Clock" />

export type Page = {
  title: string;
  icon?: React.ReactNode; // 支持 MUI 图标组件实例 / 自定义 SVG / <img>
  description: string;
  lastUpdated: string;
  link: string;
  shit?: boolean; // 可选标记，false 时显示缎带标记，null/undefined/true 时不显示
};

export const pages: Page[] = [
  {
    title: "示例页面",
    icon: (
      <img
        src={"/256.png"}
        alt="示例图标"
        style={{ width: 28, height: 28, objectFit: "contain" }}
      />
    ),
    description: "这是一个示例页面，展示了项目的基本结构。",
    lastUpdated: "2025-9-12",
    link: "/example",
    shit: false, // 显示缎带标记
  },
  {
    title: "二维码时钟",
    icon: <QrCode2Rounded color="primary" fontSize="large" />,
    description: "每秒更新的时间二维码，可选择常用时区。",
    lastUpdated: "2025-9-12",
    link: "/qrclock",
  },
  {
    title: "随机损坏 MP4",
    icon: <VideocamOffRoundedIcon color="error" fontSize="large" />,
    description: "导出一个每字节有概率损坏的 MP4 视频文件。",
    lastUpdated: "2025-9-13",
    link: "/badvideo",
  },
  {
    title: "视频格式转换器",
    icon: <VideoFileRounded color="primary" fontSize="large" />,
    description: "在本地快捷转换视频格式，同时支持视频转动图。",
    lastUpdated: "2025-10-11",
    link: "/videoconvertor",
    shit: false,
  },
  {
    title: "API 文档",
    icon: <ApiRounded color="secondary" fontSize="large" />,
    description: "浏览所有可用的 HTTP API 接口文档，包含参数、响应和示例代码。",
    lastUpdated: "2025-11-25",
    link: "/api",
  },
];
