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
            "mingcute:list-check-3-fill",
            "mingcute:list-check-fill",
            "mingcute:font-size-fill",
            "mingcute:font-size-line",
            "mingcute:bookmark-line",
            "mingcute:bookmark-fill",
            "mingcute:book-6-line",
            "mingcute:book-6-fill",
            "mingcute:pencil-3-fill",
            "mingcute:sun-line",
            "mingcute:sun-fill",
            "mingcute:moon-line",
            "mingcute:moon-fill",
            "mingcute:download-2-line",
            "mingcute:font-fill",
            "mingcute:left-line",
            "mingcute:left-fill",
            "mingcute:font-line",
          ],
        },
      ],
    ],
  };
};
