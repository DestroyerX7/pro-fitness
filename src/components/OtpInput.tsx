import { useRef, useState } from "react";
import { TextInput, TextInputKeyPressEvent, View } from "react-native";

type Props = {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
};

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
}: Props) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [, setFocusedIndex] = useState<number | null>(null);

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
