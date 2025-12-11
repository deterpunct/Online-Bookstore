module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 忽略Ant Design的source map警告
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Module Warning \(from .*source-map-loader.*\)/,
      ];
      return webpackConfig;
    },
  },
}; 