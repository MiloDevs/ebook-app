import { authClient } from "@/lib/auth-client";
import { Button, View } from "react-native";

export default function SearchPage() {
  return (
    <View
      style={{
        flex: 1,
        padding: 28,
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Button onPress={() => authClient.signOut()} title="Logout"></Button>
    </View>
  );
}
