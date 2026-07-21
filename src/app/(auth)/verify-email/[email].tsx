import OtpInput from "@/components/OtpInput";
import ThemedText from "@/components/ThemedText";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const optLength = 6;

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const verify = async () => {
    try {
      setLoading(true);

      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (error !== null) {
        setError(error.message ?? "Couldn't verify email.");
      }
    } catch {
      setError("Couldn't verify email.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
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
        <ThemedText className="text-4xl font-bold">Verify Email</ThemedText>

        <ThemedText className="text-muted-foreground">
          Enter the code sent to {email}
        </ThemedText>
      </View>

      <View className="gap-4">
        <OtpInput value={otp} onChange={setOtp} />

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

        <Link href="/(auth)/sign-up">
          <ThemedText className="text-muted-foreground text-center">
            ← Back to sign up
          </ThemedText>
        </Link>
      </View>
    </ScrollView>
  );
}
