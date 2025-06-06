import { OTPInput, OTPInputRef, type SlotProps } from "input-otp-native";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
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
  const ref = useRef<OTPInputRef>(null);

  const onComplete = (code: string) => {
    onChangeText(code);
  };

  return (
    <OTPInput
      ref={ref}
      onComplete={onComplete}
      maxLength={numberOfDigits}
      value={value}
      onChangeText={onChangeText}
      render={({ slots }) => (
        <View className="flex-row gap-2 items-center justify-center my-4">
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </View>
      )}
    />
  );
}

function Slot({ char, isActive, hasFakeCaret }: SlotProps) {
  return (
    <View
      className={cn(
        "w-[50px] h-[50px] items-center justify-center border border-gray-200 rounded-lg bg-white",
        {
          "border-black border-2": isActive,
        }
      )}
    >
      {char !== null && (
        <Text className="text-2xl font-medium text-gray-900">{char}</Text>
      )}
      {hasFakeCaret && <FakeCaret />}
    </View>
  );
}

function FakeCaret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle = {
    width: 2,
    height: 28,
    backgroundColor: "#000",
    borderRadius: 1,
  };

  return (
    <View className="absolute w-full h-full items-center justify-center">
      <Animated.View style={[baseStyle, animatedStyle]} />
    </View>
  );
}
