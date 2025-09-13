import React from "react";

/**
 * DevWatermark
 * - Renders a faint, repeated SVG watermark covering the viewport.
 * - Two-line text, rotated 45deg, non-interactive.
 */
const DevWatermark: React.FC = () => {
  // The watermark pattern will be an SVG tile. We'll use background-size to control spacing.
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='420' height='240'>
      <g transform='translate(0,0) rotate(45 210 120)'>
        <text x='210' y='100' text-anchor='middle' fill='rgba(0,0,0,0.06)' font-family='Arial, Helvetica, sans-serif' font-size='20'>
          项目正在开发中
        </text>
        <text x='210' y='130' text-anchor='middle' fill='rgba(0,0,0,0.06)' font-family='Arial, Helvetica, sans-serif' font-size='16'>
          测试版不代表最终质量
        </text>
      </g>
    </svg>
  `);

  const style: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
    backgroundRepeat: "repeat",
    // For roughly 6-8 tiles on 1920x1080, use a large tile size
    backgroundSize: "420px 240px",
    opacity: 1,
    zIndex: 9999,
    mixBlendMode: "normal",
  };

  return <div aria-hidden style={style} />;
};

export default DevWatermark;
