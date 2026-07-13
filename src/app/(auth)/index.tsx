import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { LoginFormValues, loginSchema } from "@/lib/zodSchema";
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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "apple" | null>(
    null,
  );

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginWithEmail = async ({ email, password }: LoginFormValues) => {
    try {
      setFormError(null);
      setLoading("email");

      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error !== null) {
        setFormError(
          error.message ?? "Something went wrong. Please try again.",
        );
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setFormError(null);
      setLoading("google");

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/(protected)/(tabs)/home",
      });

      if (error !== null) {
        setFormError(error.message ?? "Couldn't login with Google.");
      }
    } catch {
      setFormError("Couldn't login with Google.");
    } finally {
      setLoading(null);
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
        setFormError(error.message ?? "Couldn't login with Apple.");
      }
    } catch {
      setFormError("Couldn't login with Apple.");
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1 mb-8">
          <ThemedText className="text-4xl font-bold">Welcome back</ThemedText>

          <ThemedText className="text-muted-foreground">
            Log in to pick up where you left off.
          </ThemedText>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <ThemedTextInput
                  placeholder="Email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  className={
                    formState.errors.email !== undefined
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.email !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.email.message}
              </ThemedText>
            )}
          </View>

          <View className="gap-2">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <View className="relative">
                  <ThemedTextInput
                    placeholder="Password"
                    textContentType="password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    className={cn(
                      "pr-12",
                      formState.errors.password !== undefined &&
                        "border-destructive",
                    )}
                  />

                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-0 bottom-0 justify-center active:opacity-80"
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={theme.mutedForeground}
                    />
                  </Pressable>
                </View>
              )}
            />

            {formState.errors.password !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.password.message}
              </ThemedText>
            )}
          </View>

          <Link href="/(auth)/forgot-password">
            <ThemedText className="text-sm text-muted-foreground text-right">
              Forgot password?
            </ThemedText>
          </Link>

          {formError !== null && (
            <View className="p-4 rounded-xl bg-destructive-accent">
              <ThemedText className="text-destructive text-sm">
                {formError}
              </ThemedText>
            </View>
          )}

          <Pressable
            className={cn(
              "p-4 bg-primary rounded-xl items-center justify-center",
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
        </View>

        <View className="flex-row items-center gap-2 my-8">
          <View className="flex-1 h-px bg-border" />

          <ThemedText className="text-xs text-muted-foreground">
            OR CONTINUE WITH
          </ThemedText>

          <View className="flex-1 h-px bg-border" />
        </View>

        <View className="gap-4">
          <Pressable
            className={cn(
              "p-4 bg-background rounded-xl border border-border flex-row items-center justify-center gap-2",
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
              "p-4 bg-background rounded-xl border border-border flex-row items-center justify-center gap-2",
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

          <ThemedText className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/(auth)/sign-up">
              <ThemedText className="text-primary font-medium">
                Sign up
              </ThemedText>
            </Link>
          </ThemedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
