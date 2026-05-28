import React, { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const CDN_URL =
  "https://cdn.jsdelivr.net/npm/skinview3d@3.0.0/bundles/skinview3d.bundle.js";

interface SkinViewer3DProps {
  skinUrl: string;
}

declare global {
  interface Window {
    skinview3d?: {
      SkinViewer: new (opts: {
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
        skin: string;
      }) => SkinViewerInstance;
      WalkingAnimation: new () => object;
      IdleAnimation?: new () => object;
    };
  }
}

interface SkinViewerInstance {
  autoRotate: boolean;
  animation: object | null;
  width: number;
  height: number;
  dispose: () => void;
  loadSkin: (url: string) => void;
}

const SkinViewer3D: React.FC<SkinViewer3DProps> = ({ skinUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewerInstance | null>(null);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      if (cancelled) return;
      const sv = window.skinview3d;
      if (!sv) return;

      viewerRef.current?.dispose();

      const viewer = new sv.SkinViewer({
        canvas,
        width: 280,
        height: 400,
        skin: skinUrl,
      });
      viewer.autoRotate = true;
      viewer.animation = new sv.WalkingAnimation();
      viewerRef.current = viewer;
    };

    if (window.skinview3d) {
      init();
      return () => {
        cancelled = true;
        viewerRef.current?.dispose();
      };
    }

    // 避免重复加载
    const existing = document.querySelector(`script[src="${CDN_URL}"]`);
    if (existing) {
      existing.addEventListener("load", init);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", init);
        viewerRef.current?.dispose();
      };
    }

    const script = document.createElement("script");
    script.src = CDN_URL;
    script.onload = init;
    script.onerror = () => {
      if (!cancelled) setScriptError(true);
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.onload = null;
      script.onerror = null;
      viewerRef.current?.dispose();
    };
  }, [skinUrl]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: 280,
        height: 400,
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "grey.900",
        position: "relative",
      }}
    >
      {scriptError ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" color="grey.500">
            3D 预览加载失败
          </Typography>
        </Box>
      ) : (
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      )}
    </Box>
  );
};

export default SkinViewer3D;
