import 'dotenv/config';

export default {
    name: "SportNow",
    slug: "SportNow",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "sbsfe",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sbs.fe"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.sbs.fe"
    },
    web: {
      favicon: "./assets/images/icon.png"
    },
    extra: {
      ENV: process.env.ENV || "dev",
      GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
      API_BASE_URL: process.env.API_BASE_URL,
      API_VERSION: process.env.API_VERSION,
      GOONG_API_KEY: process.env.EXPO_PUBLIC_GOONG_API_KEY,
      eas: {
        projectId: "0ff925f3-d0a5-4958-a6df-0f3d0f322a9b"
      }
    },
    plugins: []
  }; 