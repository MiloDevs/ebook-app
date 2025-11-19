import { useState } from "react";
import { View, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import { Banner } from "@/components/ui/banner";

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
    <SafeAreaView className="flex flex-1 p-6 justify-between">
      <Text className="font-hepta_semibold text-h3 mb-12">
        Welcome Back! You’ve been missed.
      </Text>
      <View className="flex flex-1">
        <Text className="font-hepta_semibold text-h3 mb-8">Sign in</Text>
        {signInError && (
          <Banner variant="error" className="mb-8" title={signInError} />
        )}
        <View className="flex flex-col gap-6 mb-12">
          <Input
            title="Email"
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            placeholder="Your Password"
            title="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>
        <Button onPress={handleLogin} title="Continue"></Button>
      </View>
      <Link className="font-hepta_regular text-center" href={"/(auth)/sign-up"}>
        Don&apos;t have an account?{" "}
        <Text className="font-hepta_semibold">Sign up</Text>
      </Link>
    </SafeAreaView>
  );
}
