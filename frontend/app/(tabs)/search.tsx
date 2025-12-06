import { BooksSection } from "@/components/ui/booksSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookData } from "@/constants/bookData";
import { COLORS } from "@/constants/colors";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/lib/hono-client";
import { mapToBook } from "@/lib/utils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import Iconify from "react-native-iconify/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [randomBooks, setRandomBooks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getRandomBooks();
  }, []);

  const getRandomBooks = async () => {
    try {
      const result = await apiClient.search.random
        .$get()
        .then((res) => res.json());
      const books = result.result.map(mapToBook);
      setRandomBooks(books);
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getRandomBooks();
    setRefreshing(false);
  };

  const surpriseMe = async () => {
    setLoading(true);
    try {
      const result = await apiClient.search.random
        .$get({
          query: {
            num: 1,
          },
        })
        .then((res) => res.json());
      if (result && result.result && Array.isArray(result.result)) {
        if (result.result[0]?.file_url) {
          router.push(
            `/reader?fileUrl=${encodeURI(result.result[0].file_url)}`,
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex bg-gray_0 flex-1 p-6">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-row items-center mb-8 justify-between">
          <View>
            <Text className="font-hepta_regular text-h4">Search</Text>
          </View>
          <View className="p-4 rounded-full bg-gray_25">
            <Iconify
              icon="mingcute:user-3-fill"
              size={24}
              color={COLORS.gray_50}
            />
          </View>
        </View>

        <Input
          isSearch={true}
          className="py-2.5 border-gray_25 mb-5"
          placeholder="Search books, authors, genres.."
        />

        <View className="items-center flex-1 pt-10 justify-between gap-4">
          <View className="items-center">
            <Text className="font-hepta_semibold text-h4">
              Don&apos;t know what to read?
            </Text>
            <Text className="font-hepta_regular text-p">Try one of these?</Text>
          </View>
          {randomBooks.length > 0 && <BooksSection books={randomBooks} />}
          <Button
            title={loading ? "Cooking" : "Surprise Me"}
            prefixIcon="streamline:dice-5-remix"
            className="w-full"
            variant={"outline"}
            loading={loading}
            onPress={() => surpriseMe()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
