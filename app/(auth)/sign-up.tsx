import { authClient } from "@/lib/auth-client";
import { colors } from "@/lib/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await authClient.signUp.email({
      email,
      password,
      name,
    });
  };

  return (
    <SafeAreaView className="p-4 gap-4">
      <Text className="text-4xl font-bold">Sign Up</Text>

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Name"
        textContentType="name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        textContentType="emailAddress"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Password"
        textContentType="newPassword"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        className="p-4 border border-border rounded-lg placeholder:text-secondaryForeground"
        placeholder="Confirm Password"
        textContentType="newPassword"
        secureTextEntry
      />

      <Pressable className="p-4 bg-primary rounded-lg" onPress={handleLogin}>
        <Text className="text-primaryForeground">Sign Up</Text>
      </Pressable>

      <View className="h-[2px] bg-border" />

      <Pressable className="p-4 bg-primaryForeground rounded-lg border border-border flex-row items-center gap-4">
        <Image
          className="w-8 h-8"
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/500px-Google_%22G%22_logo.svg.png",
          }}
        />
        <Text className="text-foreground">Sign up with Google</Text>
      </Pressable>

      <Pressable className="p-4 bg-primaryForeground rounded-lg border border-border flex-row items-center gap-4">
        <MaterialCommunityIcons
          name="apple"
          size={32}
          color={colors.foreground}
        />
        <Text className="text-foreground">Sign up with Apple</Text>
      </Pressable>

      <Text className="text-center text-xl">
        Already have an account?{" "}
        <Link className="text-primary underline" href="/(auth)/login">
          <Text>Login</Text>
        </Link>
      </Text>
    </SafeAreaView>
  );
}
