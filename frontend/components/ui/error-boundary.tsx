import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import Iconify from "react-native-iconify/native";
import { Button } from "./button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Iconify
          icon="mingcute:warning-fill"
          size={48}
          color={COLORS.gray_50}
        />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          {error?.message || "An unexpected error occurred"}
        </Text>
        <Button variant={"alt"} title="Try Again" onPress={resetError}></Button>
      </View>
    </View>
  );
}

// Custom error fallback for API errors
export function ApiErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Iconify
          icon="mingcute:wifi-off-fill"
          size={48}
          color={COLORS.gray_50}
        />
        <Text style={styles.title}>Connection Error</Text>
        <Text style={styles.message}>
          Unable to load data. Please check your internet connection.
        </Text>
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Loading component
export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingSpinner} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

// Empty state component
export function EmptyState({
  title = "No data available",
  message = "Check back later",
  icon = "mingcute:inbox-fill",
  onRetry,
}: {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="flex-1 items-center justify-center">
        <Iconify icon={icon} size={48} color={COLORS.gray_50} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.gray_0,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray_50,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: COLORS.gray_75,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.gray_50,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.gray_25,
    borderTopColor: COLORS.gray_50,
    // Note: You'd typically use an ActivityIndicator here
    // This is just for styling reference
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray_50,
  },
});
