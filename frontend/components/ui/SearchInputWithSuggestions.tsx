import React, { useState } from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { SearchSuggestions } from "@/components/ui/SearchSuggestions";
import { useSearchSuggestions } from "@/hooks/useApi";
import { Book } from "@/types/api";

interface SearchInputWithSuggestionsProps {
  placeholder?: string;
  className?: string;
  onBookSelect?: (book: Book) => void;
  autoFocus?: boolean;
}

export function SearchInputWithSuggestions({
  placeholder = "Search books, authors, genres...",
  className,
  onBookSelect,
  autoFocus = false,
}: SearchInputWithSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const { data: suggestions = [], isLoading: loadingSuggestions } =
    useSearchSuggestions(searchQuery);

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for tap events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionPress = (book: Book) => {
    console.log(
      "SearchInputWithSuggestions - Suggestion pressed:",
      book.title,
      book.id
    );

    setSearchQuery("");
    setShowSuggestions(false);

    if (onBookSelect) {
      onBookSelect(book);
    } else {
      // Navigate to book detail page
      console.log("Navigating to book page:", book.id);
      router.push(`/book/${book.id}`);
    }
  };

  const handleSeeAllPress = () => {
    setShowSuggestions(false);
    // Navigate to search results page with current query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSubmitEditing = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOutsidePress = () => {
    setShowSuggestions(false);
  };

  const handleSuggestionsTouch = () => {
    console.log("Suggestions container touched - preventing outside press");
  };

  return (
    <View className="relative">
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View>
          <Input
            isSearch={true}
            className={className}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onSubmitEditing={handleSubmitEditing}
            autoFocus={autoFocus}
            returnKeyType="search"
          />
        </View>
      </TouchableWithoutFeedback>

      <SearchSuggestions
        suggestions={suggestions}
        isLoading={loadingSuggestions}
        query={searchQuery}
        onSuggestionPress={handleSuggestionPress}
        onSeeAllPress={handleSeeAllPress}
        onTouchStart={handleSuggestionsTouch}
        visible={showSuggestions && searchQuery.length >= 2}
      />
    </View>
  );
}
