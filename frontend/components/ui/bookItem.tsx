import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface BookItemData {
  id?: string;
  title: string;
  author: string;
  imageUrl: string | null;
  fileUrl: string;
}

export const BookItem = ({
  id,
  title,
  author,
  imageUrl,
  fileUrl,
}: BookItemData) => {
  const router = useRouter();

  // Determine if the book is stored locally
  const isLocal = fileUrl.startsWith("file://") || fileUrl.startsWith("/");

  const handlePress = () => {
    if (isLocal || !id) {
      // For local books or books without ID, go directly to reader
      router.push(`/reader?fileUrl=${encodeURIComponent(fileUrl)}`);
    } else {
      // For online books with ID, go to book details page
      router.push(`/book/${id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="w-full max-w-[120px] m-0.5"
    >
      <View className="h-[168px] bg-gray_25/20 rounded-xl overflow-hidden relative">
        <Image
          source={{
            uri: imageUrl || undefined,
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
      <Text className="font-hepta_medium text-small mb-2 line-clamp-2">
        {title}
      </Text>
      <Text className="text-gray_50 text-small">by {author}</Text>
    </TouchableOpacity>
  );
};
