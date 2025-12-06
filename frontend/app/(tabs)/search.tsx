import { BooksSection } from "@/components/ui/booksSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookData } from "@/constants/bookData";
import { COLORS } from "@/constants/colors";
import { authClient } from "@/lib/auth-client";
import { honoclient } from "@/lib/hono-client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import Iconify from "react-native-iconify/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const surpriseMe = () => {
    setLoading(true);
    const result = honoclient.
  };
  return (
    <SafeAreaView className="flex bg-gray_0 flex-1 p-6">
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

      <View className="items-center flex-1 pt-10 flex justify-between gap-4">
        <View className="items-center">
          <Text className="font-hepta_semibold text-h4">
            Don&apos;t know what to read?
          </Text>
          <Text className="font-hepta_regular text-p">Try one of these?</Text>
        </View>
        <Button title="Surprise Me" prefixIcon="streamline:dice-5-remix" />
      </View>
    </SafeAreaView>
  );
}
