import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Iconify from "react-native-iconify/native";

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  icon?: string;
  loading?: boolean;
}

export const Button = ({ title, onPress, loading, children }: ButtonProps) => {
  return (
    <TouchableOpacity
      className={`bg-primary p-2 py-4 w-full rounded-full flex items-center justify-center ${loading && "opacity-80"}`}
      onPress={onPress}
      disabled={loading}
    >
      {title && <Text className="text-white font-hepta_medium">{title}</Text>}
    </TouchableOpacity>
  );
};
