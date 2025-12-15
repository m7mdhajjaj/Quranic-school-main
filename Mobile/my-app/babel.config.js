module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
      "nativewind/babel",
      // Must be last
      "react-native-reanimated/plugin",
    ],
  };
};
