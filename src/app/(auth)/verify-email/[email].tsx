import OtpInput from "@/components/OtpInput";
import ThemedText from "@/components/ThemedText";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();

  const verify = async () => {
    setLoading(true);

    const { error: otpError } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    });

    if (otpError !== null) {
      setError(otpError.message ?? "Couldn't verify email.");
      setLoading(false);
      return;
    }
  };

  const resendOtp = async () => {
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
  };

  return (
    <ScrollView
      contentContainerClassName="flex-1 p-4 justify-center gap-4"
      // contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1 mb-8">
        <ThemedText className="text-4xl font-bold">Verify Email</ThemedText>

        <ThemedText className="text-muted-foreground">
          Enter the code sent to {email}
        </ThemedText>
      </View>

      <OtpInput value={otp} onChange={setOtp} />

      <Pressable
        onPress={verify}
        className={cn(
          "p-4 bg-primary rounded-xl active:opacity-80",
          loading && "opacity-50",
        )}
        disabled={loading}
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

        <Pressable onPress={resendOtp}>
          <ThemedText className="text-primary font-medium">Resend</ThemedText>
        </Pressable>
      </View>

      {error !== null && (
        <View className="mt-3 px-4 py-3 rounded-xl bg-destructive-accent">
          <ThemedText className="text-destructive text-sm">{error}</ThemedText>
        </View>
      )}
    </ScrollView>
  );
}
