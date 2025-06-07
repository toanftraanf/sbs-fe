import { gql } from "@apollo/client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apolloClient } from "../config/apollo";

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const GET_GOOGLE_AUTH_URL = gql`
  query {
    googleAuthUrl
  }
`;

const GOOGLE_AUTH_MOBILE = gql`
  mutation GoogleAuthMobile($idToken: String!) {
    googleAuthMobile(idToken: $idToken) {
      id
      email
      phoneNumber
      status
      isVerified
    }
  }
`;

const CHECK_EXISTING_USER = gql`
  mutation CheckExistingUser($phoneNumber: String!) {
    checkExistingUser(phoneNumber: $phoneNumber) {
      id
      phoneNumber
      status
      isVerified
    }
  }
`;

const AUTHENTICATE = gql`
  mutation Authenticate($phoneNumber: String!, $otp: String!) {
    authenticate(phoneNumber: $phoneNumber, otp: $otp) {
      user {
        id
        phoneNumber
        status
        isVerified
        role
      }
      accessToken
      refreshToken
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout($accessToken: String!, $refreshToken: String) {
    logout(accessToken: $accessToken, refreshToken: $refreshToken)
  }
`;

const RESET_OTP = gql`
  mutation ResetOTP($phoneNumber: String!) {
    resetOTP(phoneNumber: $phoneNumber)
  }
`;

const REGISTER_OWNER = gql`
  mutation RegisterOwner($phoneNumber: String!, $fullName: String!) {
    registerOwner(phoneNumber: $phoneNumber, fullName: $fullName) {
      id
      phoneNumber
      fullName
      status
      isVerified
      role
    }
  }
`;

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Token management methods
  private async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  private async getStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  public async getGoogleAuthUrl(): Promise<string> {
    try {
      const { data } = await apolloClient.query({
        query: GET_GOOGLE_AUTH_URL,
      });

      if (data?.googleAuthUrl) {
        return data.googleAuthUrl;
      }

      throw new Error("Failed to get Google auth URL");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  public async validateGoogleToken(idToken: string): Promise<any> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: GOOGLE_AUTH_MOBILE,
        variables: {
          idToken,
        },
      });

      if (data?.googleAuthMobile) {
        return data.googleAuthMobile;
      }

      throw new Error("Failed to validate Google token");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  public async checkExistingUser(phoneNumber: string): Promise<any> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CHECK_EXISTING_USER,
        variables: {
          phoneNumber,
        },
      });

      if (data?.checkExistingUser) {
        return data.checkExistingUser;
      }

      // If user doesn't exist, backend should return null/undefined
      return null;
    } catch (error) {
      console.error("Error checking existing user:", error);
      // For user existence check, we should return null if there's an error
      // instead of throwing, so the app can proceed with registration
      return null;
    }
  }

  public async login(phoneNumber: string, otp: string): Promise<any> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: AUTHENTICATE,
        variables: {
          phoneNumber,
          otp,
        },
      });

      if (data?.authenticate) {
        const { user, accessToken, refreshToken } = data.authenticate;
        
        // Store tokens securely
        if (accessToken) {
          await this.storeTokens(accessToken, refreshToken);
        }
        
        return user; // Return user data without tokens for context
      }

      throw new Error("Authentication failed");
    } catch (error) {
      // Handle GraphQL errors with more specific messages
      if (error instanceof Error && error.message.includes('Số điện thoại không tồn tại')) {
        throw new Error("Số điện thoại không tồn tại");
      }
      if (error instanceof Error && error.message.includes('Mã OTP không hợp lệ')) {
        throw new Error("Mã OTP không hợp lệ");
      }
      
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  public async logout(): Promise<void> {
    try {
      // Get stored tokens
      const { accessToken, refreshToken } = await this.getStoredTokens();
      
      if (accessToken) {
        // Call backend logout mutation
        const { data } = await apolloClient.mutate({
          mutation: LOGOUT_MUTATION,
          variables: {
            accessToken,
            refreshToken,
          },
        });

        if (!data?.logout) {
          console.warn("Backend logout returned false, but continuing with local logout");
        }
      }

      // Clear stored tokens regardless of backend response
      await this.clearStoredTokens();
      
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, we should still clear local data
      await this.clearStoredTokens();
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred during logout");
    }
  }

  public async resetOTP(phoneNumber: string): Promise<boolean> {
    console.log("[AuthService.resetOTP] Gửi phoneNumber =", phoneNumber);
    try {
      const { data } = await apolloClient.mutate({
        mutation: RESET_OTP,
        variables: { phoneNumber },
      });
      console.log("[AuthService.resetOTP] GraphQL trả về:", data?.resetOTP);
      return data?.resetOTP || false;
    } catch (error) {
      console.error("[AuthService.resetOTP] GraphQL error:", error);
      return false;
    }
  }

  public async registerOwner(phoneNumber: string, fullName: string): Promise<any> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REGISTER_OWNER,
        variables: {
          phoneNumber,
          fullName,
        },
      });

      if (data?.registerOwner) {
        return data.registerOwner;
      }

      throw new Error("Registration failed");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  // Utility method to get access token for API calls
  public async getAccessToken(): Promise<string | null> {
    const { accessToken } = await this.getStoredTokens();
    return accessToken;
  }

  // Method to check if user is authenticated
  public async isAuthenticated(): Promise<boolean> {
    const { accessToken } = await this.getStoredTokens();
    return !!accessToken;
  }
}

export default AuthService.getInstance();
