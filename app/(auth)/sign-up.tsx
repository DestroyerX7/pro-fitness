import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { authClient } from "@/lib/auth-client";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "light" ? colors.light : colors.dark;

  const handleLogin = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }

    await authClient.signUp.email({
      email,
      password,
      name,
    });
  };

  return (
    <SafeAreaView className="p-4 gap-4">
      <ThemedText className="text-4xl font-bold">Sign Up</ThemedText>

      <ThemedTextInput
        placeholder="Name"
        textContentType="name"
        value={name}
        onChangeText={setName}
      />

      <ThemedTextInput
        textContentType="emailAddress"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <ThemedTextInput
        placeholder="Password"
        textContentType="newPassword"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <ThemedTextInput
        placeholder="Confirm Password"
        textContentType="password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable className="p-4 bg-primary rounded-xl" onPress={handleLogin}>
        <ThemedText color="text-primary-foreground">Sign Up</ThemedText>
      </Pressable>

      <View className="h-[2px] bg-border" />

      <Pressable className="p-4 bg-background rounded-xl border border-border flex-row items-center gap-4">
        <Image
          className="w-8 h-8"
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png",
          }}
        />
        <ThemedText>Sign up with Google</ThemedText>
      </Pressable>

      <Pressable className="p-4 bg-background rounded-xl border border-border flex-row items-center gap-4">
        <MaterialCommunityIcons
          name="apple"
          size={32}
          color={theme.foreground}
        />
        <ThemedText>Sign up with Apple</ThemedText>
      </Pressable>

      <ThemedText className="text-center text-xl">
        Already have an account?{" "}
        <Link href="/(auth)/login">
          <ThemedText color="text-primary" className="underline">
            Login
          </ThemedText>
        </Link>
      </ThemedText>
    </SafeAreaView>
  );
}
