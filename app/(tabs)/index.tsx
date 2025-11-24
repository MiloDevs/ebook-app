import { Image } from "expo-image";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { SafeAreaView } from "react-native-safe-area-context";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import { Input } from "@/components/ui/input";
import { BooksSection } from "@/components/ui/booksSection";
import { bookData } from "@/constants/bookData";

export default function HomeScreen() {
  const { data: session } = authClient.useSession();
  return (
    <SafeAreaView className="p-6 pb-0 bg-gray_0 flex-1">
      <View className="flex flex-row items-center mb-8 justify-between">
        <View>
          <Text className="font-hepta_regular text-h4">Hello there, </Text>
          <Text className="font-hepta_semibold text-h4">
            {session?.user.name}
          </Text>
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
      <ScrollView>
        <BooksSection
          title={"More of What You love "}
          books={bookData.slice(0, 3)}
        />
        <BooksSection title={"Trending Now"} books={bookData.slice(3, 6)} />
        <BooksSection title={"New on the Block"} books={bookData.slice(3, 6)} />
      </ScrollView>
    </SafeAreaView>
  );
}
