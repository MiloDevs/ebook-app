import { Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useFonts } from "expo-font";
import { ReaderProvider } from "@epubjs-react-native/core";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// @@iconify-code-gen

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  const [fontsLoaded] = useFonts({
    "home-icons": require("../assets/fonts/home-icons.ttf"),
    HeptaSlab_400: require("../assets/fonts/HeptaSlab-Light.ttf"),
    HeptaSlab_500: require("../assets/fonts/HeptaSlab-Regular.ttf"),
    HeptaSlab_600: require("../assets/fonts/HeptaSlab-Medium.ttf"),
    HeptaSlab_700: require("../assets/fonts/HeptaSlab-Bold.ttf"),
    HeptaSlab_900: require("../assets/fonts/HeptaSlab-Black.ttf"),
  });

  if (!fontsLoaded || isPending) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <ReaderProvider>
        <Stack>
          <Stack.Protected guard={session?.user ? false : true}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={session?.user ? true : false}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="reader" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </ReaderProvider>
    </GestureHandlerRootView>
  );
}
