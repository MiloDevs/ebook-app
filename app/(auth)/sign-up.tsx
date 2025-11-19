import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Link } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");

  const handleLogin = async () => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (error) {
      console.log(error);
      setSignUpError(error.message || "");
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
      {signUpError && <Text>{signUpError}</Text>}
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign up" onPress={handleLogin} />
      <Link href={"/(auth)/sign-in"}>Sign in</Link>
    </View>
  );
}
