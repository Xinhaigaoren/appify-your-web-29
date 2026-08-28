import type { CapacitorConfig } from "@capacitor/cli";

/**
 * 原生 App 打包配置（安卓 / iOS）
 *
 * server.url 指向已发布的线上地址：先在 Lovable 点击 Publish 发布，
 * 然后把下面的 url 换成你自己的正式域名，再执行打包命令。
 * 详细步骤见 docs/打包指南.md
 */
const config: CapacitorConfig = {
  appId: "cn.hailin.alumni",
  appName: "新海高人",
  webDir: "dist/client",
  server: {
    url: "https://17041ed4-b002-4284-afa8-f0ab78dd38fb.lovableproject.com",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#183059",
      launchAutoHide: true,
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#183059",
    },
  },
};

export default config;
