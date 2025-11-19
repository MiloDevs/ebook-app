module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
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
          ],
        },
      ],
    ],
  };
};
