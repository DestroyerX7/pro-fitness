import { authClient } from "@/lib/auth-client";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          router.replace("/(tabs)");
        },
      },
    });
  };

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      fetchOptions: {
        onSuccess: (ctx) => {
          console.log(ctx.data);
        },
        onError: (ctx) => {
          console.log(ctx.error.message);
        },
      },
    });
  };

  return (
    <SafeAreaView className="p-4 gap-4">
      <Text className="text-4xl font-bold">Login</Text>

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-muted-foreground"
        placeholder="Email"
        textContentType="emailAddress"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-muted-foreground"
        placeholder="Password"
        textContentType="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable className="p-4 bg-primary rounded-lg" onPress={handleLogin}>
        <Text className="text-primary-foreground">Login</Text>
      </Pressable>

      <View className="h-[2px] bg-border" />

      <Pressable
        className="p-4 bg-background rounded-lg border border-border flex-row items-center gap-4"
        onPress={loginWithGoogle}
      >
        <Image
          className="w-8 h-8"
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png",
          }}
        />
        <Text className="text-foreground">Login with Google</Text>
      </Pressable>

      <Pressable className="p-4 bg-background rounded-lg border border-border flex-row items-center gap-4">
        <MaterialCommunityIcons
          name="apple"
          size={32}
          color={colors.foreground}
        />
        <Text className="text-foreground">Login with Apple</Text>
      </Pressable>

      <Text className="text-center text-xl">
        Don't have an account?{" "}
        <Link className="text-primary underline" href="/(auth)/sign-up">
          <Text>Sign Up</Text>
        </Link>
      </Text>
    </SafeAreaView>
  );
}
