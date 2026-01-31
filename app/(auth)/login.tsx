import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { authClient } from "@/lib/auth-client";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const handleLogin = async () => {
    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          router.replace("/(tabs)");
        },
        onError: (ctx) => {
          console.log(ctx.error.message);
          console.log(ctx);
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
          console.log(ctx);
        },
      },
    });
  };

  return (
    <SafeAreaView className="p-4 gap-4">
      <ThemedText className="text-4xl font-bold">Login</ThemedText>

      <ThemedTextInput
        placeholder="Email"
        textContentType="emailAddress"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <ThemedTextInput
        placeholder="Password"
        textContentType="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable className="p-4 bg-primary rounded-xl" onPress={handleLogin}>
        <ThemedText color="text-primary-foreground">Login</ThemedText>
      </Pressable>

      <View className="h-[1px] bg-border " />

      <Pressable
        className="p-4 bg-background rounded-xl border border-border flex-row items-center gap-4"
        onPress={loginWithGoogle}
      >
        <MaterialCommunityIcons
          name="google"
          size={32}
          color={theme.foreground}
        />
        <ThemedText>Login with Google</ThemedText>
      </Pressable>

      <Pressable className="p-4 bg-background rounded-xl border border-border flex-row items-center gap-4">
        <MaterialCommunityIcons
          name="apple"
          size={32}
          color={theme.foreground}
        />
        <ThemedText>Login with Apple</ThemedText>
      </Pressable>

      <ThemedText className="text-center text-xl">
        Don't have an account?{" "}
        <Link href="/(auth)/sign-up">
          <ThemedText color="text-primary" className="underline">
            Sign Up
          </ThemedText>
        </Link>
      </ThemedText>
    </SafeAreaView>
  );
}
