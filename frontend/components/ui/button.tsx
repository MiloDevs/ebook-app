import React from "react";
import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  ActivityIndicator,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import Iconify from "react-native-iconify/native";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex flex-row items-center justify-center border-none transition-opacity active:opacity-70",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-white border border-primary",
        destructive: "bg-red-500 text-white",
        outline: "bg-transparent border border-gray-300 text-gray-700",
        ghost: "bg-transparent",
        alt: "bg-gray_25 text-gray_75",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      rounded: "full",
    },
  }
);

const textVariants = cva("font-hepta_medium text-base", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-primary",
      destructive: "text-white",
      outline: "text-gray-700",
      ghost: "text-primary",
      alt: "text-gray_75",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

interface ButtonProps
  extends TouchableOpacityProps, VariantProps<typeof buttonVariants> {
  title?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  loading?: boolean;
}

export const Button = ({
  title,
  onPress,
  loading,
  children,
  className,
  variant,
  size,
  rounded,
  prefixIcon,
  suffixIcon,
  ...props
}: ButtonProps) => {
  const buttonClass = buttonVariants({ variant, size, rounded });
  const textClass = textVariants({ variant, size });

  const spinnerColor =
    variant === "secondary" ||
    variant === "outline" ||
    variant === "ghost" ||
    variant === "alt"
      ? "black"
      : "white";

  const iconColor = spinnerColor;

  const iconSize = size === "lg" ? 24 : 20;

  return (
    <TouchableOpacity
      className={cn(
        buttonClass,
        loading && "opacity-60",
        size === "icon" ? "p-0" : "",
        className
      )}
      onPress={onPress}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <ActivityIndicator className="mr-2" color={spinnerColor} />
          {children
            ? children
            : title && <Text className={cn(textClass)}>{title}</Text>}
        </>
      ) : (
        <>
          {prefixIcon && (
            <Iconify
              icon={prefixIcon}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: title || children ? 8 : 0 }}
            />
          )}

          {children
            ? children
            : title && <Text className={cn(textClass)}>{title}</Text>}

          {suffixIcon && (
            <Iconify
              icon={suffixIcon}
              size={iconSize}
              color={iconColor}
              style={{ marginLeft: title || children ? 8 : 0 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
