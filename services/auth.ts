import { gql } from "@apollo/client";
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
      id
      phoneNumber
      status
      isVerified
      role
    }
  }
`;

const RESET_OTP = gql`
  mutation ResetOTP($phoneNumber: String!) {
    resetOTP(phoneNumber: $phoneNumber) {
      success
      message
    }
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

      throw new Error("Failed to check existing user");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
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
        // Store the token in secure storage or memory
        // You might want to use expo-secure-store or similar
        return data.authenticate;
      }

      throw new Error("Authentication failed");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  public async resetOTP(phoneNumber: string): Promise<boolean> {
    console.log("[AuthService.resetOTP] Gửi phoneNumber =", phoneNumber);
    try {
      const { data } = await apolloClient.mutate<{ resetOTP: boolean }>({
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
}

export default AuthService.getInstance();
