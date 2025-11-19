import { Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";

// @@iconify-code-gen

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={session?.user ? false : true}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={session?.user ? true : false}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
