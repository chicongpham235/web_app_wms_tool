import { ProxyOptions, UserConfig, defineConfig, loadEnv } from "vite";

import path from "node:path";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";

function getProxy(env: any): Record<string, string | ProxyOptions> {
  let proxy = {};
  if (env.API_BASE_URL) {
    proxy = Object.assign(proxy, {
      "^/api": {
        target: env.API_BASE_URL,
      },
      "^/storage": {
        target: env.API_BASE_URL,
      },
    });
  }
  return proxy;
}

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), "");
  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      svgrPlugin({
        svgrOptions: {
          icon: true,
          // ...svgr options (https://react-svgr.com/docs/options/)
        },
      }),
    ],
    server: {
      port: +env.PORT,
      proxy: getProxy(env),
    },
    css: {
      devSourcemap: true,
    },
  } as UserConfig;
});
