import { TextInputProps, TextInput, View, Text } from "react-native";

interface InputProps extends TextInputProps {
  error?: boolean;
  title?: string;
}

export const Input = ({ title, error, ...props }: InputProps) => {
  return (
    <View className="flex flex-col gap-2">
      {title && (
        <Text
          className={`font-hepta_regular text-small ${error ? "text-red-500" : "text-gray_50"}`}
        >
          {title}
        </Text>
      )}
      <TextInput
        className={`${error ? "border-red-500" : "border-gray_50"} text-gray_50 p-2 py-4 pl-6 placeholder:font-hepta_regular border-input rounded-full placeholder:text-gray_25`}
        {...props}
      />
    </View>
  );
};
