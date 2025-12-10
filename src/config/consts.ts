export const CONSTS = {
  DEFAULT_SUFFIX: "赤石科技",
  CDN_PACKAGES: {
    // 多线程版本（优先使用，性能更好）
    FFMPEG_MT: "https://cdn.jsdmirror.com/npm/@ffmpeg/core-mt@0.12.10/dist/esm",
    // 单线程版本（回退选项，兼容性更好）
    FFMPEG: "https://cdn.jsdmirror.com/npm/@ffmpeg/core@0.12.6/dist/esm",
  },
  VIDEO_CONVERTOR: {
    // 最大允许文件大小（字节），默认 768 MiB，避免内存与性能问题
    MAX_FILE_SIZE_BYTES: 768 * 1024 * 1024,
    // 解限的最大文件限制 1.95 GiB，理论上 WebAssembly 只有 2G MemFS 限制
    MAX_SIZE_UNLOCKED: 1.95 * 1024 * 1024 * 1024,
    // GIF 限制
    MAX_FRAMES: 1000,
    MAX_FPS: 30,
    DEFAULT_WIDTH: 480,
    MAX_WIDTH: 1920,
  },
  // BadVideo 功能配置
  BADVIDEO: {
    // 最大允许文件大小（字节），默认 768 MiB，避免内存与性能问题
    MAX_FILE_SIZE_BYTES: 768 * 1024 * 1024,
    // 百分比范围（0.001% - 1%）作为小数表示
    MIN_PERCENT: 0.00001,
    MAX_PERCENT: 0.01,
  },
  // Upscayl 图像放大功能配置
  UPSCAYL: {
    // API 基础路径（默认为相对路径，生产环境需配置完整 URL）
    API_BASE_URL: "http://localhost:3000/api",
    // 支持的图片格式（MIME types）
    SUPPORTED_FORMATS: ["image/png", "image/jpeg", "image/webp"],
    // 支持的图片文件扩展名
    SUPPORTED_EXTENSIONS: [".png", ".jpg", ".jpeg", ".webp"],
    // 最大文件大小（字节），默认 20 MiB
    MAX_FILE_SIZE_BYTES: 20 * 1024 * 1024,
    // 默认放大倍数
    DEFAULT_SCALE: 4,
    // 支持的放大倍数选项
    SCALE_OPTIONS: [2, 3, 4],
    // 默认模型
    DEFAULT_MODEL: "upscayl-standard-4x",
    // 队列状态轮询间隔（毫秒）
    POLL_INTERVAL_MS: 2000,
    // 最大轮询次数（防止无限轮询）
    MAX_POLL_COUNT: 300, // 10 分钟
  },
} as const;
