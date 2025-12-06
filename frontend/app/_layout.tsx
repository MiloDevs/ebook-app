import { Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useFonts } from "expo-font";
import { ReaderProvider } from "@epubjs-react-native/core";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useAppContext } from "@/hooks/app-context";

// @@iconify-code-gen

export const unstable_settings = {
  anchor: "(tabs)",
};

const App: React.FC = (children) => {
  const { data: session, isPending } = authClient.useSession();
  const { isLoading, state, setUser } = useAppContext();

  if (isLoading) {
    return null;
  }

  if (!state?.user.id) {
    if (session) {
      setUser({
        id: session?.user.id,
        name: session?.user.name,
        email: session?.user.email,
      });
    }
  }

  return (
    <GestureHandlerRootView>
      <ReaderProvider>
        <Stack>
          <Stack.Protected guard={!state?.user.id ? true : false}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={state?.user.id ? true : false}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="reader/[fileUrl]"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
        </Stack>
      </ReaderProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "home-icons": require("../assets/fonts/home-icons.ttf"),
    HeptaSlab_400: require("../assets/fonts/HeptaSlab-Light.ttf"),
    HeptaSlab_500: require("../assets/fonts/HeptaSlab-Regular.ttf"),
    HeptaSlab_600: require("../assets/fonts/HeptaSlab-Medium.ttf"),
    HeptaSlab_700: require("../assets/fonts/HeptaSlab-Bold.ttf"),
    HeptaSlab_900: require("../assets/fonts/HeptaSlab-Black.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
