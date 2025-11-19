import { Book } from "@/types/books";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { BookItem } from "./bookItem";

interface BooksSectionProps {
  title?: string;
  books: Book[];
  readMore?: boolean;
  readMorePress?: () => void;
}

export const BooksSection = ({
  books,
  title,
  readMorePress,
}: BooksSectionProps) => {
  return (
    <View>
      {title && (
        <View className="flex flex-row items-center mb-4 justify-between">
          <Text className="font-hepta_semibold text-p">{title}</Text>
          <TouchableOpacity onPress={readMorePress}>
            <Text className="font-hepta_regular">see more</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={books}
        numColumns={3}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        ItemSeparatorComponent={() => <View className="p-2"></View>}
        renderItem={({ item }) => <BookItem {...item} />}
        keyExtractor={(item) => item.title}
      />
    </View>
  );
};
