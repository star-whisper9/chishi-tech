import React from "react";
import { Fab } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import useScrollToTop from "../../hooks/useScrollHooks";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface BackToTopProps {
  opacityPercent?: number; // 0-100
  position?: Position;
  threshold?: number;
}

const positionStyles: Record<Position, React.CSSProperties> = {
  "top-left": { position: "fixed", top: 28, left: 28 },
  "top-right": { position: "fixed", top: 28, right: 28 },
  "bottom-left": { position: "fixed", bottom: 28, left: 28 },
  "bottom-right": { position: "fixed", bottom: 28, right: 28 },
};

const BackToTop: React.FC<BackToTopProps> = ({
  opacityPercent = 90,
  position = "bottom-right",
  threshold = 200,
}) => {
  const { isScrolled, scrollToTop } = useScrollToTop({ threshold });
  const opacity = Math.max(0, Math.min(100, opacityPercent)) / 100;

  if (!isScrolled) return null;

  return (
    <div style={positionStyles[position]}>
      <Fab
        color="primary"
        size="small"
        onClick={() => scrollToTop("smooth")}
        aria-label="back-to-top"
        sx={{ opacity }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </div>
  );
};

export default BackToTop;
