import {
  formatPhoneNumber,
  handleFirebaseError,
  sendOTP,
} from "@/services/firebaseAuth";
import {
  debugFirebaseSms,
  getFirebaseConfigurationInfo,
} from "@/utils/firebaseDebug";
import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FirebaseSmsTest() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"input" | "otp">("input");
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const handleDebugFirebase = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number first");
      return;
    }

    try {
      setIsLoading(true);
      addTestResult("🔍 Starting detailed Firebase debug...");

      // Get configuration info
      const configInfo = getFirebaseConfigurationInfo();
      configInfo.forEach((info) => addTestResult(info));

      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      addTestResult(`📱 Formatted phone: ${formattedPhone}`);

      // Run detailed debug
      const debugLog = await debugFirebaseSms(formattedPhone);
      debugLog.forEach((log) => addTestResult(log));
    } catch (error) {
      addTestResult(`❌ Debug error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    try {
      setIsLoading(true);
      addTestResult("Starting OTP send process...");

      const formattedPhone = formatPhoneNumber(phoneNumber);
      addTestResult(`Formatted phone: ${formattedPhone}`);

      console.log("Sending OTP to:", formattedPhone);
      addTestResult("Calling Firebase signInWithPhoneNumber...");

      const confirmation = await sendOTP(formattedPhone);
      setVerificationId(confirmation.verificationId || "");
      setStep("otp");

      addTestResult("✅ OTP sent successfully!");
      addTestResult(`VerificationId: ${confirmation.verificationId}`);

      Alert.alert(
        "Success",
        "OTP sent successfully! Check your phone for the SMS.\n\n" +
          "If you don't receive SMS, check:\n" +
          "1. Firebase Console → Authentication → Phone\n" +
          "2. Phone number format (+84xxxxxxxxx)\n" +
          "3. Test phone numbers in Firebase Console\n" +
          '4. Try the "Debug Firebase" button below'
      );

      console.log(
        "OTP sent successfully, verificationId:",
        confirmation.verificationId
      );
    } catch (error) {
      const firebaseError = handleFirebaseError(error);
      addTestResult(`❌ Error: ${firebaseError.message}`);
      Alert.alert("Error", firebaseError.message);
      console.error("Firebase SMS Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      addTestResult("Starting OTP verification...");
      console.log("Verifying OTP:", otp);
      console.log("VerificationId:", verificationId);

      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      addTestResult("Created credential, calling signInWithCredential...");

      const result = await auth().signInWithCredential(credential);

      addTestResult("✅ OTP verified successfully!");
      addTestResult(`User UID: ${result.user.uid}`);

      Alert.alert("Success", "OTP verified successfully!");
      console.log("Firebase verification successful:", result.user.uid);

      // Reset form
      setPhoneNumber("");
      setOtp("");
      setVerificationId("");
      setStep("input");
      setTestResults([]);
    } catch (error) {
      const firebaseError = handleFirebaseError(error);
      addTestResult(`❌ Verification error: ${firebaseError.message}`);
      Alert.alert("Error", firebaseError.message);
      console.error("Firebase verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase SMS Test</Text>
      <Text style={styles.subtitle}>Real SMS Testing with Debug</Text>

      {step === "input" ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number (e.g., 0123456789)"
            keyboardType="phone-pad"
          />
          <Text style={styles.helpText}>
            📱 This will send a real SMS to your phone number
          </Text>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Sending..." : "Send Real SMS"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.debugButton]}
            onPress={handleDebugFirebase}
            disabled={isLoading}
          >
            <Text style={styles.debugButtonText}>
              {isLoading ? "Debugging..." : "Debug Firebase"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>OTP Code:</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit OTP from SMS"
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setStep("input")}
          >
            <Text style={styles.secondaryButtonText}>Back to Phone Input</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test Results Log */}
      <View style={styles.logContainer}>
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Debug Log:</Text>
          <TouchableOpacity onPress={handleClearLogs}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logContent}>
          {testResults.map((log, index) => (
            <Text key={index} style={styles.logEntry}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  debugButton: {
    backgroundColor: "#FF9500",
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  logContainer: {
    flex: 1,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    fontSize: 12,
    color: "#007AFF",
  },
  logContent: {
    flex: 1,
    padding: 10,
  },
  logEntry: {
    fontSize: 11,
    color: "#333",
    marginBottom: 2,
    fontFamily: "monospace",
  },
});
