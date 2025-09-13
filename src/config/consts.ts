export const CONSTS = {
  DEFAULT_SUFFIX: "赤石科技",
  // BadVideo 功能配置
  BADVIDEO: {
    // 最大允许文件大小（字节），默认 768 MiB，避免内存与性能问题
    MAX_FILE_SIZE_BYTES: 768 * 1024 * 1024,
    // 百分比范围（0.001% - 1%）作为小数表示
    MIN_PERCENT: 0.00001,
    MAX_PERCENT: 0.01,
  },
} as const;
