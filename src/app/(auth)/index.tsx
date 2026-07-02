import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const loginWithEmail = async () => {
    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          router.replace("/(protected)/(tabs)/home");
        },
        onError: (ctx) => {
          console.log(ctx.error);
        },
      },
    });
  };

  const loginWithGoogle = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(protected)/(tabs)/home", // Callback url is required or it breaks
    });

    if (error) {
      console.log(error);
      return;
    }

    router.replace("/(protected)/(tabs)/home");
  };

  const loginWithApple = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken == null) {
      return;
    }

    const { error } = await authClient.signIn.social({
      provider: "apple",
      idToken: {
        token: credential.identityToken,
      },
    });

    if (error) {
      console.log(error);
      return;
    }

    router.replace("/(protected)/(tabs)/home");
  };

  return (
    <View
      className="gap-4"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
    >
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

      <Pressable className="p-4 bg-primary rounded-xl" onPress={loginWithEmail}>
        <ThemedText className="text-primary-foreground">Login</ThemedText>
      </Pressable>

      <View className="h-px bg-border " />

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

      <Pressable
        className="p-4 bg-background rounded-xl border border-border flex-row items-center gap-4"
        onPress={loginWithApple}
      >
        <MaterialCommunityIcons
          name="apple"
          size={32}
          color={theme.foreground}
        />
        <ThemedText>Login with Apple</ThemedText>
      </Pressable>

      <ThemedText className="text-center text-xl">
        Don&apos;t have an account?{" "}
        <Link href="/(auth)/sign-up">
          <ThemedText className="text-primary underline">Sign Up</ThemedText>
        </Link>
      </ThemedText>
    </View>
  );
}
