import { Platform } from "react-native";

// Get the appropriate localhost URL based on platform
const getLocalhostUrl = () => {
  if (Platform.OS === "android") {
    return "http://192.168.1.8:8089"; // IP của máy tính
  }
  if (Platform.OS === "ios") {
    return "http://192.168.1.8:8089"; // IP của máy tính
  }
  return "http://192.168.1.8:8089"; // IP của máy tính
};

const ENV = {
  dev: {
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID || "",
    GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || "",
    GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || "",
    API_BASE_URL: process.env.API_BASE_URL || getLocalhostUrl(),
    API_VERSION: process.env.API_VERSION || "v1",
  },
  prod: {
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID || "",
    GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || "",
    GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || "",
    API_BASE_URL: process.env.API_BASE_URL || "https://api.sportnow.com",
    API_VERSION: process.env.API_VERSION || "v1",
  },
} as const;

const getEnvVars = () => {
  const env = process.env.ENV || "dev";
  console.log("[ENV] Current environment:", env);
  return ENV[env as keyof typeof ENV];
};

export default getEnvVars();
