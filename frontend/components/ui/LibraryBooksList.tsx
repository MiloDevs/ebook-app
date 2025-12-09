import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Iconify from "react-native-iconify/native";
import { useToast } from "react-native-toast-notifications";
import { COLORS } from "@/constants/colors";
import { Input } from "./input";
import { LibraryBook } from "@/types/api";
import { useRemoveBookFromLibrary } from "@/hooks/useLibraries";

interface LibraryBooksListProps {
  userId: string;
  libraryId: string;
  books: LibraryBook[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function LibraryBooksList({
  userId,
  libraryId,
  books,
  isLoading = false,
  onRefresh,
}: LibraryBooksListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [removingBookId, setRemovingBookId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const removeBookFromLibrary = useRemoveBookFromLibrary();

  // Filter books based on search query
  const filteredBooks = books.filter((libraryBook) => {
    const book = libraryBook.book;
    if (!book) return false;

    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author?.full_name.toLowerCase().includes(query) ||
      book.genres?.some((genre) => genre.title.toLowerCase().includes(query))
    );
  });

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  const handleRemoveBook = async (bookId: string, bookTitle: string) => {
    Alert.alert(
      "Remove Book",
      `Are you sure you want to remove "${bookTitle}" from this library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingBookId(bookId);
            try {
              await removeBookFromLibrary.mutateAsync({
                userId,
                libraryId,
                bookId,
              });
              toast.show("Book removed from library", {
                type: "success",
                placement: "top",
              });
              onRefresh?.();
            } catch (error) {
              toast.show("Failed to remove book", {
                type: "danger",
                placement: "top",
              });
            } finally {
              setRemovingBookId(null);
            }
          },
        },
      ]
    );
  };

  const renderBookItem = ({ item }: { item: LibraryBook }) => {
    const book = item.book;
    if (!book) return null;

    const isRemoving = removingBookId === book.id;

    return (
      <TouchableOpacity
        onPress={() => handleBookPress(book.id)}
        className="flex-row items-center p-4 rounded-xl mb-3"
        disabled={isRemoving}
      >
        {/* Book Cover */}
        <View className="mr-3">
          <Image
            source={{
              uri: book.image_url || undefined,
            }}
            placeholder={require("../../assets/icons/book-placeholder.png")}
            contentFit="cover"
            style={{
              width: 60,
              height: 80,
              borderRadius: 8,
            }}
          />
        </View>

        {/* Book Details */}
        <View className="flex-1 mr-3">
          <Text
            className="font-hepta_semibold text-base text-gray_100 mb-1"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text className="font-hepta_regular text-sm text-gray_75 mb-2">
            by {book.author?.full_name || "Unknown Author"}
          </Text>
          <View className="flex-row items-center">
            <Iconify icon="mingcute:star-fill" size={14} color="#FFD700" />
            <Text className="ml-1 font-hepta_medium text-sm text-gray_75">
              {book.rating.toFixed(1)}
            </Text>
            <Text className="ml-3 font-hepta_regular text-xs text-gray_50">
              {new Date(book.released_at).getFullYear()}
            </Text>
          </View>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={() => handleRemoveBook(book.id, book.title)}
          className="p-2 rounded-lg bg-red-50"
          disabled={isRemoving}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Iconify icon="mingcute:delete-3-line" size={20} color="#EF4444" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      {searchQuery ? (
        <>
          <Iconify
            icon="mingcute:search-2-line"
            size={48}
            color={COLORS.gray_25}
          />
          <Text className="font-hepta_medium text-lg text-gray_75 mt-4 mb-2">
            No books found
          </Text>
          <Text className="font-hepta_regular text-sm text-gray_50 text-center">
            Try adjusting your search terms
          </Text>
        </>
      ) : (
        <>
          <Iconify
            icon="mingcute:book-2-line"
            size={48}
            color={COLORS.gray_25}
          />
          <Text className="font-hepta_medium text-lg text-gray_75 mt-4 mb-2">
            Library is empty
          </Text>
          <Text className="font-hepta_regular text-sm text-gray_50 text-center">
            Add some books to get started
          </Text>
        </>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="font-hepta_regular text-sm text-gray_50 mt-4">
          Loading books...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search Input */}
      <View className="mb-4">
        <Input
          isSearch={true}
          className="py-2.5 border-gray_25"
          placeholder="Search books in library..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Books List */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
