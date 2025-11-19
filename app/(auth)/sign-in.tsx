import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    if (error) {
      console.log(error);
      setError(error.message || "");
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 28,
        justifyContent: "center",
        width: "100%",
      }}
    >
      {signInError && <Text>{signInError}</Text>}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Link href={"/(auth)/sign-up"}>Sign up</Link>
    </View>
  );
}
