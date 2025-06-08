import React from "react";
import { View } from "react-native";

interface SettingsSectionProps {
  children: React.ReactNode;
  backgroundColor?: string;
  marginBottom?: number;
}

export default function SettingsSection({
  children,
  backgroundColor = "white",
  marginBottom = 12,
}: SettingsSectionProps) {
  return (
    <View
      className="overflow-hidden"
      style={{
        backgroundColor,
        marginBottom,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}
