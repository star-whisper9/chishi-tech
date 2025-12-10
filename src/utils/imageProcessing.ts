export const fileToImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const imageToImageData = (img: HTMLImageElement): ImageData => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
};

export const imageDataToTensor = (imageData: ImageData): Float32Array => {
  const { data, width, height } = imageData;
  const float32Data = new Float32Array(3 * width * height);

  // HWC to CHW，归一化到 [0, 1]
  for (let i = 0; i < width * height; i++) {
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[width * height + i] = data[i * 4 + 1] / 255.0; // G
    float32Data[2 * width * height + i] = data[i * 4 + 2] / 255.0; // B
  }
  return float32Data;
};

export const tensorToImageData = (
  data: Float32Array,
  width: number,
  height: number
): ImageData => {
  const rgbaData = new Uint8ClampedArray(width * height * 4);

  // 关键改进：添加 0.5 clip 以匹配 upscayl 的实现
  const clipEps = 0.5;

  for (let i = 0; i < width * height; i++) {
    const r = data[i] * 255.0 + clipEps;
    const g = data[width * height + i] * 255.0 + clipEps;
    const b = data[2 * width * height + i] * 255.0 + clipEps;

    // 使用 floor 而不是四舍五入，并确保在 [0, 255] 范围内
    rgbaData[i * 4] = Math.min(255, Math.max(0, Math.floor(r)));
    rgbaData[i * 4 + 1] = Math.min(255, Math.max(0, Math.floor(g)));
    rgbaData[i * 4 + 2] = Math.min(255, Math.max(0, Math.floor(b)));
    rgbaData[i * 4 + 3] = 255; // Alpha
  }

  return new ImageData(rgbaData, width, height);
};

export const imageDataToUrl = (imageData: ImageData): string => {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};
