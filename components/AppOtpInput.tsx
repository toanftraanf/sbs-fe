import React, { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { cn } from "../utils";

interface AppOtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  numberOfDigits?: number;
}

export default function AppOtpInput({
  value,
  onChangeText,
  numberOfDigits = 6,
}: AppOtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(numberOfDigits).fill(""));
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Update local state when value prop changes
    if (value) {
      const newOtp = value.split("").concat(Array(numberOfDigits - value.length).fill(""));
      setOtp(newOtp);
    }
  }, [value, numberOfDigits]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Join all digits and update parent
    const otpString = newOtp.join("");
    onChangeText(otpString);

    // Auto focus next input
    if (text && index < numberOfDigits - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row gap-2 items-center justify-center my-4">
      {Array(numberOfDigits).fill(0).map((_, index) => (
        <View
          key={index}
          className={cn(
            "w-[50px] h-[50px] items-center justify-center border border-gray-200 rounded-lg bg-white",
            {
              "border-black border-2": otp[index] !== "",
            }
          )}
        >
          <TextInput
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            value={otp[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            className="text-2xl font-medium text-gray-900 text-center"
            selectTextOnFocus
          />
        </View>
      ))}
    </View>
  );
}
