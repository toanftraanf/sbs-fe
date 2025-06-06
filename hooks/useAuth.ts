import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For Expo development, use Expo's auth proxy
  // const redirectUri = makeRedirectUri({
  //   scheme: undefined, // Let Expo handle the scheme
  // });
  const redirectUri = "https://auth.expo.io/@toantran.11/stadium-booking-frontend";
  console.log("Redirect URI:", redirectUri);

  // Debug logging for environment variables
  // useEffect(() => {
  //   console.log("[AUTH] Configuration:", {
  //     redirectUri,
  //     androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
  //     iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
  //     webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  //   });
  // }, [redirectUri]);

  // Configure Google OAuth request
  // In development, use web client ID for all platforms
  // const webClientId = Constants.expoConfig?.extra?.googleWebClientId;
  // console.log("Web Client ID:", webClientId);
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // clientId: webClientId, // Use web client ID for development
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    responseType: "id_token",
    scopes: ['profile', 'email'],
    redirectUri,
  });

  // Debug logging for request object
  // useEffect(() => {
  //   console.log("[AUTH] Google Sign In request configuration:", {
  //     request,
  //     redirectUri,
  //     webClientId,
  //   });
  // }, [request, redirectUri, webClientId]);

  const handleGoogleSignIn = async () => {
    // try {
    //   console.log("[AUTH] Starting Google Sign In");
    //   setIsLoading(true);
    //   setError(null);

    //   if (!request) {
    //     console.log("[AUTH] Google Sign In request not ready:", { request });
    //     throw new Error("Google Sign In configuration is not ready");
    //   }

    //   console.log("[AUTH] Starting Google Sign In with redirect URI:", redirectUri);
    //   // Prompt for Google Sign In
    //   const result = await promptAsync();
    //   console.log("[AUTH] Sign In result:", result);

    //   if (result.type === "success") {
    //     // Get the ID token
    //     const { id_token } = result.params;
    //     console.log("[AUTH] Got ID token, validating with backend...");

    //     // Validate the token with our backend
    //     await authService.validateGoogleToken(id_token);
    //     console.log("[AUTH] Token validated successfully");

    //     // If successful, navigate to the main app
    //     router.push("/(tabs)");
    //   } else if (result.type === "cancel") {
    //     setError("Google sign in was cancelled");
    //   } else {
    //     console.log("[AUTH] Sign in failed:", result);
    //     setError("Google sign in failed");
    //   }
    // } catch (error) {
    //   console.error("[AUTH] Google Sign In Error:", error);
    //   setError(
    //     error instanceof Error ? error.message : "An unknown error occurred"
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return {
    isLoading,
    error,
    handleGoogleSignIn,
  };
};

// export const useAuth = () => {
//   const user = {
//     role: "user",
//   }

//   return {
//     user,
//   }
// }

