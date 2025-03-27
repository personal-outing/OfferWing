import { defineConfig } from "@ice/app";
import antd from "@ice/plugin-antd";
import auth from "@ice/plugin-auth";
import request from "@ice/plugin-request";
import store from "@ice/plugin-store";

const minify = process.env.NODE_ENV === "production" ? "swc" : false;
export default defineConfig(() => ({
  // dropLogLevel: "log",
  codeSplitting: "page",
  ssg: false,
  minify,
  // publicPath: `/`,
  publicPath: `https://interview-fe-resource.oss-cn-shenzhen.aliyuncs.com/build/${process.env.ICE_VERSION}/build/`,
  webpack: (webpackConfig) => {
    // @ts-expect-error webpack devServer is exist
    if (typeof webpackConfig.devServer?.client === 'object') {
      // @ts-expect-error webpack devServer is exist
      webpackConfig.devServer.client.overlay = false;
    }
    return webpackConfig
  },
  server: {
    onDemand: true,
    format: "esm",
  },
  proxy: {
    "/api": {
      target: "https://pre-api.interviewdogs.com",
      changeOrigin: true,
      enable: true,
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.removeHeader("referer"); //移除请求头
        proxyReq.removeHeader("origin"); //移除请求头
        proxyReq.setHeader("host", "pre-api.interviewdogs.com"); //添加请求头
      },
    },
  },
  plugins: [
    antd({
      importStyle: true,
    }),
    request(),
    store(),
    auth(),
  ],
  compileDependencies: false,
}));
