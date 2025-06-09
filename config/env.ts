
const ENV = {
  dev: {
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
    GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
    API_BASE_URL: process.env.API_BASE_URL,
    API_VERSION: process.env.API_VERSION,
    GOONG_API_KEY: process.env.GOONG_API_KEY,
  },
  prod: {
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
    GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
    API_BASE_URL: process.env.API_BASE_URL,
    API_VERSION: process.env.API_VERSION,
    GOONG_API_KEY: process.env.GOONG_API_KEY,
  },
} as const;

const getEnvVars = () => {
  const env = process.env.ENV || "dev";
  console.log("[ENV] Current environment:", env);
  return ENV[env as keyof typeof ENV];
};

export default getEnvVars();
