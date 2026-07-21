import OtpInput from "@/components/OtpInput";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
  ResetPasswordFormValues,
  resetPasswordSchema,
} from "@/lib/zodSchema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
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

const optLength = 6;

function EnterEmail({ onNext }: { onNext?: (email: string) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState } =
    useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
    });

  const sendCode = async ({ email }: ForgotPasswordFormValues) => {
    try {
      setFormError(null);
      setLoading(true);

      const { error } = await authClient.emailOtp.requestPasswordReset({
        email,
      });

      if (error !== null) {
        setFormError(
          error.message ?? "Something went wrong. Please try again.",
        );
        return;
      }

      onNext?.(email);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
          <ThemedText className="text-4xl font-bold">
            Forgot Password?
          </ThemedText>

          <ThemedText className="text-muted-foreground">
            Enter you email and we&apos;ll send you a 6-digit verification code
            instantly.
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
              <ThemedText className="text-destructive text-xs mt-1 ml-1">
                {formState.errors.email.message}
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
              "p-4 bg-primary rounded-xl items-center justify-center active:opacity-80",
              loading && "opacity-50",
            )}
            onPress={handleSubmit(sendCode)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <ThemedText className="text-primary-foreground font-semibold">
                Send Code
              </ThemedText>
            )}
          </Pressable>

          <Link href="/(auth)">
            <ThemedText className="text-muted-foreground">
              ← Back to login
            </ThemedText>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EnterOtp({
  email,
  onVerified,
}: {
  email: string;
  onVerified?: (code: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const verify = async () => {
    try {
      setLoading(true);

      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp,
        type: "forget-password",
      });

      if (error !== null) {
        setError(error.message ?? "Couldn't verify code.");
        return;
      }

      onVerified?.(otp);
    } catch {
      setError("Couldn't verify code.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email,
      });

      if (error !== null) {
        setError(error.message ?? "Couldn't resend code.");
      }
    } catch {
      setError("Couldn't resend code.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
        justifyContent: "center",
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1 mb-8">
        <ThemedText className="text-4xl font-bold">Verify Code</ThemedText>

        <ThemedText className="text-muted-foreground">
          Enter the code sent to {email}
        </ThemedText>
      </View>

      <View className="gap-4">
        <OtpInput value={otp} onChange={setOtp} length={optLength} />

        {error !== null && (
          <View className="p-4 rounded-xl bg-destructive-accent">
            <ThemedText className="text-destructive text-sm">
              {error}
            </ThemedText>
          </View>
        )}

        <Pressable
          onPress={verify}
          className={cn(
            "p-4 bg-primary rounded-xl active:opacity-80",
            (otp.length !== optLength || loading) && "opacity-50",
          )}
          disabled={otp.length !== optLength || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.primaryForeground} />
          ) : (
            <ThemedText className="text-primary-foreground text-center font-semibold">
              Verify
            </ThemedText>
          )}
        </Pressable>

        <View className="flex-row justify-center items-center gap-1">
          <ThemedText>Didn&apos;t recieve a OTP?</ThemedText>

          <Pressable onPress={resendOtp} className="active:opacity-80">
            <ThemedText className="text-primary font-medium">Resend</ThemedText>
          </Pressable>
        </View>

        <Link href="/(auth)">
          <ThemedText className="text-muted-foreground text-center">
            ← Back to login
          </ThemedText>
        </Link>
      </View>
    </ScrollView>
  );
}

function ResetPassword({
  email,
  otp,
  onNext,
}: {
  email: string;
  otp: string;
  onNext?: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit, formState } = useForm<ResetPasswordFormValues>(
    {
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: { password: "", confirmPassword: "" },
    },
  );

  const resetPassword = async ({ password }: ResetPasswordFormValues) => {
    try {
      setFormError(null);
      setLoading(true);

      const { error } = await authClient.emailOtp.resetPassword({
        email,
        password,
        otp,
      });

      if (error !== null) {
        setFormError(
          error.message ?? "Something went wrong. Please try again.",
        );

        return;
      }

      onNext?.();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
          <ThemedText className="text-4xl font-bold">Reset Password</ThemedText>

          <ThemedText className="text-muted-foreground">
            Enter your new password
          </ThemedText>
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <View className="relative">
                  <ThemedTextInput
                    placeholder="Password"
                    textContentType="newPassword"
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

          <View className="gap-2">
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <View className="relative">
                  <ThemedTextInput
                    placeholder="Confirm password"
                    textContentType="password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    className={cn(
                      "pr-12",
                      formState.errors.confirmPassword !== undefined &&
                        "border-destructive",
                    )}
                  />

                  <Pressable
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-0 bottom-0 justify-center active:opacity-80"
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color={theme.mutedForeground}
                    />
                  </Pressable>
                </View>
              )}
            />

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
              "p-4 bg-primary rounded-xl items-center justify-center active:opacity-80",
              loading && "opacity-50",
            )}
            onPress={handleSubmit(resetPassword)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primaryForeground} />
            ) : (
              <ThemedText className="text-primary-foreground font-semibold">
                Reset Password
              </ThemedText>
            )}
          </Pressable>

          <Link href="/(auth)">
            <ThemedText className="text-muted-foreground">
              ← Back to login
            </ThemedText>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">(
    "email",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const insets = useSafeAreaInsets();

  if (step === "email") {
    return (
      <EnterEmail
        onNext={(e) => {
          setEmail(e);
          setStep("otp");
        }}
      />
    );
  } else if (step === "otp") {
    return (
      <EnterOtp
        email={email}
        onVerified={(code) => {
          setOtp(code);
          setStep("password");
        }}
      />
    );
  } else if (step === "password") {
    return (
      <ResetPassword
        email={email}
        otp={otp}
        onNext={() => setStep("success")}
      />
    );
  }

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
          <ThemedText className="text-4xl font-bold">Success!</ThemedText>

          <ThemedText className="text-muted-foreground">
            Your password has been reset successsfully. You can now login with
            your new password.
          </ThemedText>
        </View>

        <Link href="/(auth)" asChild>
          <Pressable className="p-4 bg-primary rounded-xl items-center justify-center active:opacity-80">
            <ThemedText className="text-primary-foreground font-semibold">
              Login
            </ThemedText>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
