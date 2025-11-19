import { Text, View } from "react-native";
import Iconify from "react-native-iconify/native";
import { ClassNameValue, twMerge } from "tailwind-merge";

type BannerVariants = "info" | "warning" | "error";

interface BannerProps {
  title?: string;
  className?: ClassNameValue;
  variant?: BannerVariants;
}

const BannerStyles: Record<
  BannerVariants,
  {
    className: string;
    textClass: string;
    icon: string;
    iconColor: string;
  }
> = {
  info: {
    className: "bg-blue-500/20 border border-blue-500/70",
    textClass: "text-white",
    icon: "mingcute:alert-fill",
    iconColor: "#2b7fff",
  },
  warning: {
    className: "bg-amber-500/20 border border-amber-500/70",
    textClass: "text-amber-500",
    icon: "mingcute:warning-fill",
    iconColor: "#fd9a00",
  },
  error: {
    className: " bg-red-500/20 border border-red-500/70",
    textClass: "text-red-500",
    icon: "mingcute:alert-octagon-fill",
    iconColor: "#fb2c36",
  },
};

export const Banner = ({ title, variant = "info", className }: BannerProps) => {
  return (
    <View
      className={twMerge([
        "flex flex-row gap-2 p-2 py-2.5 pl-6 rounded-full",
        BannerStyles[variant].className,
        className,
      ])}
    >
      <Iconify
        color={BannerStyles[variant].iconColor}
        icon={BannerStyles[variant].icon}
      />
      <Text
        className={twMerge([
          "font-hepta_medium text-p",
          BannerStyles[variant].textClass,
        ])}
      >
        {title}
      </Text>
    </View>
  );
};
