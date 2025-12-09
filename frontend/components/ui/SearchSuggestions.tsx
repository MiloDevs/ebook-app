import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import Iconify from "react-native-iconify/native";
import { COLORS } from "@/constants/colors";
import { Book } from "@/types/api";

interface SearchSuggestionsProps {
  suggestions: Book[];
  isLoading: boolean;
  query: string;
  onSuggestionPress: (suggestion: Book) => void;
  onSeeAllPress?: () => void;
  visible: boolean;
  onTouchStart?: () => void;
}

export function SearchSuggestions({
  suggestions,
  isLoading,
  query,
  onSuggestionPress,
  onSeeAllPress,
  visible,
  onTouchStart,
}: SearchSuggestionsProps) {
  if (!visible || query.length < 2) {
    return null;
  }

  const renderSuggestion = ({ item }: { item: Book }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("Suggestion item onPress triggered:", item.title, item.id);
        // Dismiss keyboard and immediately call onSuggestionPress
        Keyboard.dismiss();
        onSuggestionPress(item);
      }}
      onPressIn={() => {
        console.log("Suggestion item onPressIn:", item.title);
        if (onTouchStart) onTouchStart();
      }}
      delayPressIn={0}
      delayPressOut={0}
      activeOpacity={0.7}
      className="flex-row z-20 items-center px-4 py-3 border-b border-gray_25/50"
      style={{
        backgroundColor: COLORS.gray_0,
        minHeight: 60,
      }}
    >
      <Iconify
        icon="mingcute:search-line"
        size={16}
        color={COLORS.gray_50}
        style={{ marginRight: 12 }}
      />
      <View className="flex-1">
        <Text
          className="font-hepta_medium text-sm text-gray_100"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {item.author?.full_name && (
          <Text
            className="font-hepta_regular text-xs text-gray_50 mt-0.5"
            numberOfLines={1}
          >
            by {item.author.full_name}
          </Text>
        )}
      </View>
      <Iconify icon="mingcute:right-line" size={16} color={COLORS.gray_50} />
    </TouchableOpacity>
  );

  return (
    <View
      className="absolute top-full border border-gray_25 mt-2 left-0 right-0 bg-gray_0 overflow-hidden rounded-2xl"
      onTouchStart={(e) => {
        console.log("SearchSuggestions container touched");
        if (onTouchStart) onTouchStart();
      }}
      style={{
        zIndex: 1000,
        maxHeight: 300,
      }}
    >
      {isLoading ? (
        <View className="flex-row items-center justify-center py-4">
          <ActivityIndicator size="small" color={COLORS.gray_50} />
          <Text className="ml-2 font-hepta_regular text-sm text-gray_50">
            Searching...
          </Text>
        </View>
      ) : suggestions.length > 0 ? (
        <>
          <FlatList
            data={suggestions.slice(0, 5)} // Show max 5 suggestions
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          {suggestions.length > 5 && onSeeAllPress && (
            <TouchableOpacity
              onPress={() => {
                console.log("See all pressed with query:", query);
                Keyboard.dismiss();
                onSeeAllPress();
              }}
              delayPressIn={0}
              activeOpacity={0.7}
              className="flex-row items-center justify-center px-4 py-3 border-t border-gray_25/50"
              style={{ backgroundColor: COLORS.gray_0, minHeight: 50 }}
            >
              <Text className="font-hepta_medium text-sm text-accent mr-2">
                See all {suggestions.length} results
              </Text>
              <Iconify
                icon="mingcute:right-line"
                size={16}
                color={COLORS.accent}
              />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View className="flex-row items-center justify-center py-4">
          <Iconify
            icon="mingcute:search-line"
            size={16}
            color={COLORS.gray_50}
            style={{ marginRight: 8 }}
          />
          <Text className="font-hepta_regular text-sm text-gray_50">
            No results found for &ldquo;{query}&rdquo;
          </Text>
        </View>
      )}
    </View>
  );
}
