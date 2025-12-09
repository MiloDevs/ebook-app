import { Book } from "@/types/books";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { BookItem } from "./bookItem";
import { useRouter } from "expo-router";

interface BooksSectionProps {
  title?: string;
  books: Book[];
  readMore?: boolean;
  readMorePress?: () => void;
  sectionType?: "recommended" | "bestsellers" | "discover" | "library";
  // New props for search results
  infiniteScroll?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshControl?: React.ReactElement;
}

export const BooksSection = ({
  books,
  title,
  readMorePress,
  sectionType,
  infiniteScroll = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  ListHeaderComponent,
  ListFooterComponent,
  refreshControl,
}: BooksSectionProps) => {
  const router = useRouter();

  const handleReadMorePress = () => {
    if (readMorePress) {
      readMorePress();
    } else if (sectionType) {
      router.push(
        `/view-all-books?section=${sectionType}&title=${encodeURIComponent(title || "")}`
      );
    }
  };
  return (
    <View>
      {title && (
        <View className="flex flex-row items-center mb-4 justify-between">
          <Text className="font-hepta_semibold text-p">{title}</Text>
          <TouchableOpacity onPress={handleReadMorePress}>
            <Text className="font-hepta_regular">see more</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={books}
        numColumns={3}
        scrollEnabled={infiniteScroll}
        nestedScrollEnabled={infiniteScroll}
        ItemSeparatorComponent={() => <View className="p-2"></View>}
        renderItem={({ item }) => <BookItem {...item} />}
        keyExtractor={(item) => item.title}
        // Infinite scroll props
        onEndReached={infiniteScroll ? onEndReached : undefined}
        onEndReachedThreshold={infiniteScroll ? onEndReachedThreshold : undefined}
        ListHeaderComponent={infiniteScroll ? ListHeaderComponent : undefined}
        ListFooterComponent={infiniteScroll ? ListFooterComponent : undefined}
        refreshControl={infiniteScroll ? refreshControl : undefined}
        showsVerticalScrollIndicator={infiniteScroll}
        contentContainerStyle={infiniteScroll ? { paddingBottom: 20 } : undefined}
      />
    </View>
  );
};
