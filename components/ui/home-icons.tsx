import createIconSetFromFontello from "@expo/vector-icons/createIconSetFromFontello";

import fontelloConfig from "../../assets/icons/config.json";

const Icon = createIconSetFromFontello(
  fontelloConfig,
  "fontello",
  "fontello.ttf",
);

export const HomeLine = <Icon name="home-line" size={80} color="#bf1313" />;
export const HomeFill = <Icon name="home-fill" size={80} color="#bf1313" />;

export default Icon;
