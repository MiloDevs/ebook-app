import { useState } from "react";
import { View, TextInput, Text } from "react-native";
import { authClient } from "@/lib/auth-client";
import { Link } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import { Banner } from "@/components/ui/banner";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");

  const handleSignup = async () => {
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
    <SafeAreaView className="flex flex-1 p-6 justify-between">
      <Text className="font-hepta_semibold text-h3 mb-12">
        Join thousands of book enthusiasts.
      </Text>
      <View className="flex flex-1">
        <Text className="font-hepta_semibold text-h3 mb-8">Sign up</Text>
        {signUpError && (
          <Banner variant="error" className="mb-8" title={signUpError} />
        )}
        <View className="flex flex-col gap-6 mb-12">
          <Input
            title="Username"
            placeholder="What may we call you?"
            value={name}
            onChangeText={setName}
          />
          <Input
            title="Email"
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            placeholder="A super strong password"
            title="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Input
            placeholder="Make sure it’s the right one"
            title="Confirm Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>
        <Button onPress={handleSignup} title="Continue"></Button>
      </View>
      <Link className="font-hepta_regular text-center" href={"/(auth)/sign-in"}>
        Already have an account?{" "}
        <Text className="font-hepta_semibold">Sign in</Text>
      </Link>
    </SafeAreaView>
  );
}
