import { LEFT_AREA_WIDTH_INPUT } from "@/constants";
import React from "react";
import { TextInput, TextInputProps, View } from "react-native";

interface AppTextInputProps extends TextInputProps {
  left?: React.ReactNode;
  containerClassName?: string;
}

export default function AppTextInput({
  left,
  containerClassName = "",
  style,
  ...props
}: AppTextInputProps) {
  return (
    <View
      className={`flex-row items-center bg-white border border-secondary rounded-xl px-3 py-3 ${containerClassName}`}
    >
      {left && (
        <View
          style={{
            width: LEFT_AREA_WIDTH_INPUT,
            alignItems: "center",
            marginRight: 8,
          }}
        >
          {left}
        </View>
      )}
      <TextInput
        style={[{ flex: 1, color: "#515151" }, style]}
        placeholderTextColor="#B0B0B0"
        {...props}
      />
    </View>
  );
}
