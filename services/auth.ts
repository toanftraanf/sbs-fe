import AsyncStorage from '@react-native-async-storage/async-storage';
import { apolloClient } from "../config/apollo";
import {
  AUTHENTICATE,
  CHECK_EXISTING_USER,
  GET_GOOGLE_AUTH_URL,
  GET_USER,
  GOOGLE_AUTH_MOBILE,
  LOGOUT_MUTATION,
  REGISTER_OWNER,
  RESET_OTP,
  UPDATE_USER_MUTATION,
} from "../graphql";

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

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

  private async clearStoredTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error clearing tokens:', error);
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

  // Method to get detailed user profile information
  public async getUserProfile(userId: number): Promise<any> {
    try {
      const { data } = await apolloClient.query({
        query: GET_USER,
        variables: { id: userId },
        fetchPolicy: 'network-only' // Always fetch fresh data
      });

      if (data?.user) {
        return data.user;
      }

      throw new Error("User not found");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred while fetching user profile");
    }
  }

  // Method to update user profile information
  public async updateUserProfile(input: {
    userId: number;
    fullName?: string;
    dob?: string;
    sex?: "MALE" | "FEMALE" | "OTHER";
    address?: string;
    userType?: "PLAYER" | "COACH";
    level?: string;
  }): Promise<any> {
    try {
      // Convert userId to id as expected by backend
      const updateUserInput = {
        id: input.userId,
        fullName: input.fullName,
        dob: input.dob,
        sex: input.sex,
        address: input.address,
        userType: input.userType,
        level: input.level,
      };

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { updateUserInput },
      });

      if (data?.updateUser) {
        return data.updateUser;
      }

      throw new Error("Failed to update user profile");
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred while updating user profile");
    }
  }

  // Method to update user profile with sports
  public async updateUserProfileWithSports(userProfileData: {
    userId: number;
    fullName: string;
    dob: string;
    sex: "MALE" | "FEMALE" | "OTHER";
    address: string;
    userType: "PLAYER" | "COACH";
    level: string;
    sportIds: number[];
  }): Promise<any> {
    try {
      // First update the user profile
      const updatedUser = await this.updateUserProfile({
        userId: userProfileData.userId,
        fullName: userProfileData.fullName,
        dob: userProfileData.dob,
        sex: userProfileData.sex,
        address: userProfileData.address,
        userType: userProfileData.userType,
        level: userProfileData.level,
      });

      // Then add favorite sports (if we have sports service available)
      if (userProfileData.sportIds && userProfileData.sportIds.length > 0) {
        // Import sports service dynamically to avoid circular dependency
        const sportsService = await import("./sports");
        
        // First get all available sports to validate IDs
        const availableSports = await sportsService.default.getAllSports();
        const validSportIds = availableSports.map(sport => sport.id);
        
        // Add each sport as favorite, but only if it exists
        for (const sportId of userProfileData.sportIds) {
          if (!validSportIds.includes(sportId)) {
            console.warn(`Sport ID ${sportId} does not exist in backend, skipping...`);
            continue;
          }
          
          try {
            const result = await sportsService.default.addFavoriteSport(userProfileData.userId, sportId);
            if (result) {
              console.log(`Successfully added sport ${sportId} as favorite`);
            } else {
              console.warn(`Sport ${sportId} favorite creation returned null, but may still be successful`);
            }
          } catch (error) {
            console.warn(`Failed to add sport ${sportId} as favorite:`, error);
            // Continue with other sports even if one fails
          }
        }
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile with sports:", error);
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred while updating user profile");
    }
  }
}

export default AuthService.getInstance();
