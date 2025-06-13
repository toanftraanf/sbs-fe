import Constants from 'expo-constants';

const ENV = {
  dev: {
    GOOGLE_ANDROID_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID,
    GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID,
    API_BASE_URL: Constants.expoConfig?.extra?.API_BASE_URL,
    API_VERSION: Constants.expoConfig?.extra?.API_VERSION,
    GOONG_API_KEY: Constants.expoConfig?.extra?.GOONG_API_KEY,
  },
  prod: {
    GOOGLE_ANDROID_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID,
    GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID,
    API_BASE_URL: Constants.expoConfig?.extra?.API_BASE_URL,
    API_VERSION: Constants.expoConfig?.extra?.API_VERSION,
    GOONG_API_KEY: Constants.expoConfig?.extra?.GOONG_API_KEY,
  },
} as const;

const getEnvVars = () => {
  const env = Constants.expoConfig?.extra?.ENV || "dev";
  console.log("[ENV] Current environment:", env);
  return ENV[env as keyof typeof ENV];
};

export default getEnvVars();
