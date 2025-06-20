// components/AppHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
  onDocPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function AppHeader({
  title,
  subtitle,
  showSearch = false,
  searchValue,
  searchPlaceholder = "…Tìm kiếm",
  onSearchChange,
  onFilterPress,
  onDocPress,
  onNotificationPress,
  onProfilePress,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const paddingTop =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;

  return (
    <View style={styles.bgContainer}>
      {/* chỉ safe‐area inset ở trên */}
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: "#E6F4EA", paddingTop }}
      />

      {/* phần có padding horizontal sẽ nằm riêng */}
      <View style={styles.inner}>
        {/* 1) tiêu đề + 3 icon */}
        <View style={styles.row}>
          <View style={styles.titleSection}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            {subtitle && (
              <Text numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={styles.iconGroup}>
            {onDocPress && (
              <TouchableOpacity onPress={onDocPress} style={styles.iconBtn}>
                <Ionicons name="document-text-outline" size={22} color="#222" />
              </TouchableOpacity>
            )}
            {onNotificationPress && (
              <TouchableOpacity
                onPress={onNotificationPress}
                style={styles.iconBtn}
              >
                <Ionicons name="notifications-outline" size={22} color="#222" />
              </TouchableOpacity>
            )}
            {onProfilePress && (
              <TouchableOpacity onPress={onProfilePress}>
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color="#5A983B"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2) search + filter (tuỳ chọn) */}
        {showSearch && (
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#b0b0b0" />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="#b0b0b0"
                value={searchValue}
                onChangeText={onSearchChange}
              />
            </View>
            {onFilterPress && (
              <TouchableOpacity
                style={styles.filterButton}
                onPress={onFilterPress}
              >
                <Ionicons name="filter-outline" size={20} color="#b0b0b0" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    width: "100%",
    backgroundColor: "#E6F4EA",
  },
  inner: {
    paddingHorizontal: 12, // giảm từ 16 xuống 12 cho sát mép hơn
    paddingBottom: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#222",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  iconBtn: {
    marginRight: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  titleSection: {
    flexDirection: "column",
    maxWidth: "70%",
  },
});
