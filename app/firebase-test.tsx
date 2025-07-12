import FirebaseSmsTest from "@/components/FirebaseSmsTest";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

export default function FirebaseTestPage() {
  return (
    <SafeAreaView style={styles.container}>
      <FirebaseSmsTest />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
