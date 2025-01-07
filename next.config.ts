import type { NextConfig } from "next";
import withLlamaIndex from "llamaindex/next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default withLlamaIndex(nextConfig);
