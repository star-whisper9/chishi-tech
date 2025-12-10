import React, { useCallback, useState } from "react";
import { ReactCompareSlider } from "react-compare-slider";
import { Box, Typography, Paper } from "@mui/material";

interface ImageCompareSliderProps {
  originalUrl: string;
  upscaledUrl: string;
  zoomAmount?: number; // 缩放百分比 (100-200)
}

const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  originalUrl,
  upscaledUrl,
  zoomAmount = 100,
}) => {
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const x = ((e.pageX - left) / width) * 100;
      const y = ((e.pageY - top) / height) * 100;
      setBackgroundPosition(`${x}% ${y}%`);
    },
    []
  );

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: 600,
        overflow: "hidden",
        position: "relative",
        "& .group:hover img": {
          transform: `scale(${zoomAmount / 100})`,
        },
      }}
    >
      <ReactCompareSlider
        itemOne={
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                bgcolor: "rgba(0, 0, 0, 0.3)",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 500,
                zIndex: 1,
              }}
            >
              原图
            </Typography>
            <img
              src={originalUrl}
              alt="原图"
              onMouseMove={handleMouseMove}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transformOrigin: backgroundPosition,
                transition: "transform 0.2s ease-out",
              }}
            />
          </Box>
        }
        itemTwo={
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                bgcolor: "rgba(0, 0, 0, 0.3)",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 500,
                zIndex: 1,
              }}
            >
              放大后
            </Typography>
            <img
              src={upscaledUrl}
              alt="放大后"
              onMouseMove={handleMouseMove}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transformOrigin: backgroundPosition,
                transition: "transform 0.2s ease-out",
              }}
            />
          </Box>
        }
        className="group"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </Paper>
  );
};

export default ImageCompareSlider;
