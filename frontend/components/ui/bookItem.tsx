import { Book } from "@/types/books";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";

export const BookItem = ({ title, author, imageUrl, fileUrl }: Book) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/reader?fileUrl=${encodeURIComponent(fileUrl)}`)
      }
      className="w-full max-w-[120px] m-0.5"
    >
      <View className="h-[168px] bg-gray_25/20 rounded-xl overflow-hidden">
        <Image
          source={{
            uri: imageUrl,
          }}
          placeholder={require("../../assets/icons/book-placeholder.png")}
          contentFit="cover"
          style={{
            flex: 1,
            width: "100%",
          }}
          onError={(error) => {
            console.log("error loading image:", error);
          }}
        />
      </View>
      <Text className="font-hepta_medium text-small mb-2">{title}</Text>
      <Text className="text-gray_50 text-small">by {author}</Text>
    </TouchableOpacity>
  );
};
