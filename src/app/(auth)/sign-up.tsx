import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as AppleAuthentication from "expo-apple-authentication";
import { Link, router } from "expo-router";
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

const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "apple" | null>(
    null,
  );

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signUpWithEmail = async ({ name, email, password }: SignUpForm) => {
    setFormError(null);
    setLoading("email");

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpError !== null) {
      setFormError(signUpError.message ?? "Something went wrong. Try again.");
      setLoading(null);
      return;
    }

    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (otpError !== null) {
      setFormError(otpError.message ?? "Something went wrong. Try again.");
      setLoading(null);
      return;
    }

    router.push({
      pathname: "/(auth)/verify-email/[email]",
      params: { email },
    });
  };

  const signUpWithGoogle = async () => {
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

  const signUpWithApple = async () => {
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
          <ThemedText className="text-4xl font-bold">
            Create an account
          </ThemedText>

          <ThemedText className="text-muted-foreground">
            Takes less than a minute to get started.
          </ThemedText>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <ThemedTextInput
                  placeholder="Name"
                  textContentType="name"
                  autoComplete="name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  className={
                    formState.errors.name !== undefined
                      ? "border-destructive"
                      : ""
                  }
                />
              )}
            />

            {formState.errors.name !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.name.message}
              </ThemedText>
            )}
          </View>

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
            <View>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <ThemedTextInput
                    placeholder="Password"
                    textContentType="newPassword"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    className={
                      formState.errors.password !== undefined
                        ? "border-destructive"
                        : ""
                    }
                  />
                )}
              />

              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-0 bottom-0 justify-center"
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>
            </View>

            {formState.errors.password !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.password.message}
              </ThemedText>
            )}
          </View>

          <View className="gap-2">
            <View>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { value, onChange, onBlur } }) => (
                  <ThemedTextInput
                    placeholder="Confirm password"
                    textContentType="password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className={
                      formState.errors.confirmPassword !== undefined
                        ? "border-destructive"
                        : ""
                    }
                  />
                )}
              />

              <Pressable
                onPress={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-4 top-0 bottom-0 justify-center"
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>
            </View>

            {formState.errors.confirmPassword !== undefined && (
              <ThemedText className="text-destructive text-xs">
                {formState.errors.confirmPassword.message}
              </ThemedText>
            )}
          </View>

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
            onPress={handleSubmit(signUpWithEmail)}
            disabled={loading !== null}
          >
            {loading === "email" ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <ThemedText className="text-primary-foreground font-semibold">
                Sign up
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
            onPress={signUpWithGoogle}
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
            onPress={signUpWithApple}
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
            Already have an account?{" "}
            <Link href="/(auth)">
              <ThemedText className="text-primary font-medium">
                Log in
              </ThemedText>
            </Link>
          </ThemedText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
