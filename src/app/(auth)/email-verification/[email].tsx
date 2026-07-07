import ThemedText from "@/components/ThemedText";
import useTheme from "@/hooks/useTheme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/nativewind";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  TextInputKeyPressEvent,
  View,
} from "react-native";

type OTPInputProps = {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
};

function OTPInput({ length = 6, value, onChange, onComplete }: OTPInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  const setDigit = (text: string, index: number) => {
    // Handle pasting a full code into a single box
    if (text.length > 1) {
      const pasted = text.replace(/[^0-9]/g, "").slice(0, length);
      onChange(pasted);
      if (pasted.length === length) {
        inputs.current[length - 1]?.blur();
        onComplete?.(pasted);
      } else {
        inputs.current[pasted.length]?.focus();
      }
      return;
    }

    const cleaned = text.replace(/[^0-9]/g, "");
    const next = digits.slice();
    next[index] = cleaned;
    const newValue = next.join("").slice(0, length);
    onChange(newValue);

    if (cleaned && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (
      newValue.length === length &&
      newValue.split("").every((d) => d !== "")
    ) {
      onComplete?.(newValue);
    }
  };

  const handleKeyPress = (e: TextInputKeyPressEvent, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const next = digits.slice();
      next[index - 1] = "";
      onChange(next.join(""));
    }
  };

  return (
    <View className="flex-row justify-between gap-2">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => setDigit(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1} // allow paste to hit box 0
          textContentType="oneTimeCode" // enables iOS SMS/clipboard autofill
          autoComplete="sms-otp" // enables Android SMS autofill
          className="w-16 h-20 border-2 border-border bg-muted rounded-xl text-center text-muted-foreground focus:border-primary"
          style={{ fontSize: 24 }}
        />
      ))}
    </View>
  );
}

export default function VerifyEmailScreen() {
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

      <OTPInput value={otp} onChange={setOtp} />

      <Pressable
        onPress={verify}
        className={cn(
          "p-4 bg-primary rounded-xl active:opacity-80",
          loading && "opacity-50",
        )}
        disabled={loading}
      >
        <ThemedText className="text-primary-foreground text-center font-semibold">
          Verify
        </ThemedText>
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
