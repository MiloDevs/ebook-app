import { COLORS } from "@/constants/colors";
import { TextInputProps, TextInput, View, Text } from "react-native";
import Iconify from "react-native-iconify/native";
import { Icon } from "react-native-vector-icons/Icon";
import { twMerge } from "tailwind-merge";

interface InputProps extends TextInputProps {
  error?: boolean;
  title?: string;
  isSearch?: boolean;
}

export const Input = ({
  title,
  error,
  className,
  isSearch,
  ...props
}: InputProps) => {
  return (
    <View className="flex flex-col gap-2">
      {title && (
        <Text
          className={`font-hepta_regular text-small ${error ? "text-red-500" : "text-gray_50"}`}
        >
          {title}
        </Text>
      )}
      <View className="relative">
        {isSearch && (
          <Iconify
            icon="mingcute:search-line"
            color={COLORS.gray_25}
            style={{
              position: "absolute",
              top: 10,
              left: 16,
            }}
          />
        )}
        <TextInput
          className={twMerge([
            `border-[1.5px] ${error ? "border-red-500" : "border-gray_50"} text-gray_50 p-2 py-4 ${isSearch ? "pl-12" : "pl-6"} placeholder:font-hepta_regular rounded-full placeholder:text-gray_25`,
            className,
          ])}
          {...props}
        />
      </View>
    </View>
  );
};
