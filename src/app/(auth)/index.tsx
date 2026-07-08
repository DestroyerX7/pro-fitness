import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as AppleAuthentication from "expo-apple-authentication";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "apple" | null>(
    null,
  );

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginWithEmail = async ({ email, password }: LoginForm) => {
    setFormError(null);
    setLoading("email");

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error !== null) {
      setFormError(error.message ?? "Something went wrong. Try again.");
      setLoading(null);
    }
  };

  const loginWithGoogle = async () => {
    setFormError(null);
    setLoading("google");

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(protected)/(tabs)/home", // Callback url is required or it breaks
    });

    setLoading(null);

    if (error !== null) {
      setFormError(error.message ?? "Couldn't sign in with Google.");
    }
  };

  const loginWithApple = async () => {
    try {
      setFormError(null);
      setLoading("apple");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken === null) {
        setFormError("No identity token.");
        return;
      }

      const { error } = await authClient.signIn.social({
        provider: "apple",
        idToken: {
          token: credential.identityToken,
        },
      });

      if (error !== null) {
        setFormError(error.message ?? "Couldn't sign in with Apple.");
      }
    } catch {
    } finally {
      setLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1 mb-8">
          <ThemedText className="text-4xl font-bold">Welcome back</ThemedText>

          <ThemedText className="text-base opacity-60">
            Log in to pick up where you left off.
          </ThemedText>
        </View>

        <View className="gap-3">
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <ThemedTextInput
                  placeholder="Email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {formState.errors.email && (
              <ThemedText className="text-destructive text-xs mt-1 ml-1">
                {formState.errors.email.message}
              </ThemedText>
            )}
          </View>

          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <ThemedTextInput
                  placeholder="Password"
                  textContentType="password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-0 h-14 justify-center"
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.foreground}
                style={{ opacity: 0.5 }}
              />
            </Pressable>

            {formState.errors.password && (
              <ThemedText className="text-destructive text-xs mt-1 ml-1">
                {formState.errors.password.message}
              </ThemedText>
            )}
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="self-end">
              <ThemedText className="text-sm opacity-60">
                Forgot password?
              </ThemedText>
            </Pressable>
          </Link>
        </View>

        {formError && (
          <View className="mt-3 px-4 py-3 rounded-xl bg-destructive-accent">
            <ThemedText className="text-destructive text-sm">
              {formError}
            </ThemedText>
          </View>
        )}

        <Pressable
          className={cn(
            "mt-6 p-4 bg-primary rounded-xl items-center justify-center",
            loading !== null && "opacity-50",
          )}
          onPress={handleSubmit(loginWithEmail)}
          disabled={loading !== null}
        >
          {loading === "email" ? (
            <ActivityIndicator color={theme.primaryForeground} />
          ) : (
            <ThemedText className="text-primary-foreground font-semibold">
              Log in
            </ThemedText>
          )}
        </Pressable>

        <View className="flex-row items-center gap-3 my-6">
          <View className="flex-1 h-px bg-border" />

          <ThemedText className="text-xs opacity-50">
            OR CONTINUE WITH
          </ThemedText>

          <View className="flex-1 h-px bg-border" />
        </View>

        <View className="gap-3">
          <Pressable
            className={cn(
              "p-4 bg-background rounded-xl border border-border flex-row items-center justify-center gap-3",
              loading !== null && loading !== "google" && "opacity-50",
            )}
            onPress={loginWithGoogle}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <ActivityIndicator color={theme.foreground} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="google"
                  size={20}
                  color={theme.foreground}
                />

                <ThemedText className="font-medium">
                  Continue with Google
                </ThemedText>
              </>
            )}
          </Pressable>

          <Pressable
            className={cn(
              "p-4 bg-background rounded-xl border border-border flex-row items-center justify-center gap-3",
              loading !== null && loading !== "apple" && "opacity-50",
            )}
            onPress={loginWithApple}
            disabled={loading !== null}
          >
            {loading === "apple" ? (
              <ActivityIndicator color={theme.foreground} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="apple"
                  size={20}
                  color={theme.foreground}
                />

                <ThemedText className="font-medium">
                  Continue with Apple
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>

        <ThemedText className="text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/(auth)/sign-up">
            <ThemedText className="text-primary font-medium">
              Sign up
            </ThemedText>
          </Link>
        </ThemedText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
