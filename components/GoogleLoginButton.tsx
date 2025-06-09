import { icons } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { apolloClient } from "@/config/apollo";
import { gql } from "@apollo/client";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Clipboard from 'expo-clipboard';

interface GoogleLoginButtonProps {
  title?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GET_GOOGLE_AUTH_URL = gql`
  query GetGoogleAuthUrl($redirectUri: String) {
    googleAuthUrl(redirectUri: $redirectUri)
  }
`;

const HANDLE_GOOGLE_CALLBACK = gql`
  mutation HandleGoogleCallback($code: String!) {
    handleGoogleCallback(code: $code) {
      user {
        id
        email
        fullName
        phoneNumber
        role
      }
      accessToken
      refreshToken
    }
  }
`;

// Complete auth session when redirected back
WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton({
  title = "Google",
  disabled = false,
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoringClipboard, setIsMonitoringClipboard] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  // Monitor clipboard for Google OAuth callback URL - SMART AUTO DETECTION!
  useEffect(() => {
    let clipboardInterval: any = null;
    let lastClipboardContent = '';

    const checkClipboard = async () => {
      try {
        const clipboardContent = await Clipboard.getStringAsync();
        
        // Check if clipboard content is a Google OAuth callback URL
        if (clipboardContent !== lastClipboardContent && 
            clipboardContent.includes('auth.expo.io') && 
            clipboardContent.includes('code=')) {
          
          console.log('🎯 AUTO-DETECTED Google OAuth URL in clipboard!');
          
          // Extract code from URL
          const urlObj = new URL(clipboardContent);
          const code = urlObj.searchParams.get('code');
          
          if (code) {
            // Stop monitoring clipboard
            setIsMonitoringClipboard(false);
            if (clipboardInterval) clearInterval(clipboardInterval);
            
            // Clear clipboard for security
            await Clipboard.setStringAsync('');
            
            console.log('🚀 Auto-processing Google OAuth code...');
            setIsLoading(true);
            handleGoogleCallback(code);
          }
        }
        
        lastClipboardContent = clipboardContent;
      } catch (error) {
        console.error('Clipboard check error:', error);
      }
    };

    // Start monitoring when needed
    if (isMonitoringClipboard) {
      console.log('📋 Started smart clipboard monitoring...');
      clipboardInterval = setInterval(checkClipboard, 1000); // Check every 1 second
    }

    return () => {
      if (clipboardInterval) {
        clearInterval(clipboardInterval);
        console.log('📋 Stopped clipboard monitoring');
      }
    };
  }, [isMonitoringClipboard]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Use fixed redirect URI that works with Google
      const redirectUri = 'https://auth.expo.io/@toantran.11/stadium-booking-frontend';
      console.log('Redirect URI:', redirectUri);

      // Get Google Auth URL from backend
      const { data } = await apolloClient.query({
        query: GET_GOOGLE_AUTH_URL,
        variables: { redirectUri },
        fetchPolicy: 'network-only'
      });

      console.log('Backend Google Auth URL:', data?.googleAuthUrl);

      if (data?.googleAuthUrl) {
        // Open Google OAuth in external browser
        await Linking.openURL(data.googleAuthUrl);
        console.log('Opened Google OAuth URL in external browser');

        // Start smart clipboard monitoring
        setIsMonitoringClipboard(true);
        setIsLoading(false);
        
        Alert.alert(
          '🎯 Google Login - SMART AUTO',
          '✨ Sau khi chọn tài khoản Google:\n\n1️⃣ Copy URL từ trang lỗi\n2️⃣ Quay lại app\n\n🤖 App sẽ TỰ ĐỘNG phát hiện và xử lý!\n\n(Không cần nhập gì cả)',
          [
            { 
              text: 'Hủy', 
              style: 'cancel', 
              onPress: () => setIsMonitoringClipboard(false) 
            },
            { 
              text: '🚀 Bắt đầu', 
              style: 'default'
            }
          ]
        );
      } else {
        throw new Error('Không thể lấy URL đăng nhập Google');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";

      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert("Lỗi đăng nhập", errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleGoogleCallback = async (code: string) => {
    try {
      console.log('=== SMART AUTO GOOGLE CALLBACK START ===');
      console.log('Processing Google callback with code:', code);

      // Call backend mutation with the code
      console.log('Sending mutation to backend...');
      const { data: callbackData } = await apolloClient.mutate({
        mutation: HANDLE_GOOGLE_CALLBACK,
        variables: { code }
      });

      console.log('=== BACKEND RESPONSE ===');
      console.log('Backend callback response:', JSON.stringify(callbackData, null, 2));

      if (callbackData?.handleGoogleCallback) {
        const { user, accessToken, refreshToken } = callbackData.handleGoogleCallback;

        console.log('=== LOGIN SUCCESS ===');
        console.log('User data:', JSON.stringify(user, null, 2));

        // Store tokens securely (same as in authService.login)
        if (accessToken) {
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
              await AsyncStorage.setItem('refreshToken', refreshToken);
            }
          } catch (error) {
            console.error('Error storing Google login tokens:', error);
          }
        }

        // Save user to context
        setUser(user);

        console.log('Smart auto Google login successful:', user);
        Alert.alert('🎉 Thành công', '✨ Google login tự động thành công!\n\nChào mừng ' + user.email);

        // Call success callback or navigate
        if (onSuccess) {
          onSuccess();
        } else {
          // Check if user needs to complete their profile (same logic as OTP verification)
          const checkProfileAndNavigate = async () => {
            let shouldRedirectToProfile = false;

            try {
              const authService = (await import('@/services/auth')).default;
              const userProfile = await authService.getUserProfile(parseInt(user.id));
              
              // Check if user has essential profile information
              const hasFullName = userProfile?.fullName && userProfile.fullName.trim() !== "";
              const hasDob = userProfile?.dob && userProfile.dob !== null && userProfile.dob !== undefined;
              const hasSex = userProfile?.sex && userProfile.sex !== null && userProfile.sex !== undefined;
              
              console.log("Profile check details:", {
                hasFullName,
                hasDob,
                hasSex,
                fullName: userProfile?.fullName,
                dob: userProfile?.dob,
                sex: userProfile?.sex,
                userProfileExists: !!userProfile
              });
              
              if (!hasFullName || !hasDob || !hasSex) {
                shouldRedirectToProfile = true;
              }
            } catch (profileError) {
              console.log("❌ Error fetching user profile, assuming incomplete:", profileError);
              shouldRedirectToProfile = true;
            }

            // Navigate based on profile completion
            setTimeout(() => {
              if (shouldRedirectToProfile) {
                router.replace("/(auth)/user-information-step1");
              } else {
                // User has complete profile, navigate to appropriate tab
                if (user.role === "OWNER") {
                  router.replace("/(tabs)/stadium-status");
                } else {
                  router.replace("/(tabs)/stadium-booking");
                }
              }
            }, 100);
          };

          checkProfileAndNavigate();
        }
      } else {
        console.log('=== BACKEND ERROR ===');
        console.log('No handleGoogleCallback data in response');
        throw new Error('Không nhận được dữ liệu từ backend');
      }
    } catch (error) {
      console.log('=== GOOGLE CALLBACK ERROR ===');
      console.error('Google callback error details:', error);
      
      if (error instanceof Error) {
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
      }
      
      // Log GraphQL errors specifically
      if ((error as any).graphQLErrors) {
        console.log('GraphQL errors:', (error as any).graphQLErrors);
      }
      
      if ((error as any).networkError) {
        console.log('Network error:', (error as any).networkError);
      }

      const errorMessage = error instanceof Error ? error.message : "Xử lý callback thất bại";
      Alert.alert("Lỗi", errorMessage);
    } finally {
      console.log('=== SMART AUTO GOOGLE CALLBACK END ===');
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center border-2 border-primary rounded-2xl py-3 mb-4"
      onPress={handleGoogleSignIn}
      disabled={isLoading || disabled}
      style={{
        opacity: isLoading || disabled ? 0.6 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color="#5A983B" />
      ) : (
        <>
          <Text className="font-InterBold text-primary text-lg mr-2">
            {title}
          </Text>
          <Image source={icons.google} className="w-10 h-10" />
        </>
      )}
    </TouchableOpacity>
  );
}
