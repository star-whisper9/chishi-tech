import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "exclude-wasm-plugin",
      generateBundle(_, bundle) {
        // 遍历所有即将打包的文件
        for (const fileName in bundle) {
          // 如果文件名以 .wasm 结尾（或者你可以匹配特定的 onnxruntime 文件名）
          if (fileName.endsWith(".wasm")) {
            console.log(`\n已从构建产物中剔除: ${fileName}`);
            // 从 bundle 对象中删除，这样 Vite 就不会把它写入 dist 目录了
            delete bundle[fileName];
          }
        }
      },
    },
  ],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    target: "esnext",
  },
});
