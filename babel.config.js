module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "react-native-iconify/babel",
        {
          icons: [
            "mingcute:settings-3-fill",
            "mingcute:settings-3-line",
            "mingcute:search-line",
            "mingcute:search-fill",
            "mingcute:user-3-fill",
            "mingcute:alert-fill",
            "mingcute:alert-octagon-fill",
            "mingcute:warning-fill",
            "mingcute:loading-fill",
            "mingcute:loading-3-fill",
            "mingcute:close-circle-fill",
          ],
        },
      ],
    ],
  };
};
