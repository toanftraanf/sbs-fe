import { gql } from "@apollo/client";
import { apolloClient } from "../config/apollo";
import { GET_ALL_COACHES, GET_COACH_PROFILE_FALLBACK, GET_COACH_PROFILE_MOBILE } from "../graphql";
import { Coach, CoachProfile, CoachReviewStats } from "../types";

// Fallback query without favoriteSports if main query fails
const GET_ALL_COACHES_FALLBACK = gql`
  query GetAllCoachFallback {
    coaches {
      id
      fullName
      rating
      avatar {
        url
      }
      coachProfile {
        id
        hourlyRate
        isAvailable
        bio
      }
    }
  }
`;



interface CoachProfileResponse {
  coachProfile: CoachProfile & {
    user: {
      id: string;
      fullName: string;
      rating?: number;
      avatar?: { url: string };
      favoriteSports?: any[];
    };
  };
  coachReviewStats: CoachReviewStats;
}

class CoachService {
  private static instance: CoachService;

  private constructor() {}

  public static getInstance(): CoachService {
    if (!CoachService.instance) {
      CoachService.instance = new CoachService();
    }
    return CoachService.instance;
  }

  public async getAllCoaches(): Promise<Coach[]> {
    try {
      // Try main query first
      const { data } = await apolloClient.query({
        query: GET_ALL_COACHES,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      });

      if (data?.coaches) {
        return data.coaches.map((coach: any) => ({
          ...coach,
          favoriteSports: coach.favoriteSports || [],
        }));
      }

      return [];
    } catch (error) {
      console.log("Main coaches query failed, trying fallback:", error);
      
      // Try fallback query without favoriteSports
      try {
        const { data } = await apolloClient.query({
          query: GET_ALL_COACHES_FALLBACK,
          fetchPolicy: 'network-only',
        });

        if (data?.coaches) {
          return data.coaches.map((coach: any) => ({
            ...coach,
            favoriteSports: [], // Empty array for fallback
          }));
        }
      } catch (fallbackError) {
        console.error("Fallback coaches query also failed:", fallbackError);
      }

      return [];
    }
  }

  public async getCoachProfile(coachProfileId: number): Promise<CoachProfileResponse> {
    try {
      // Try main query first
      const { data } = await apolloClient.query({
        query: GET_COACH_PROFILE_MOBILE,
        variables: { coachProfileId },
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      });

      // Create a completely mutable copy using JSON serialization
      const mutableData = JSON.parse(JSON.stringify(data));
      
      const result = {
        coachProfile: {
          ...mutableData.coachProfile,
          user: {
            ...mutableData.coachProfile?.user,
            favoriteSports: mutableData.coachProfile?.user?.favoriteSports || [],
          }
        },
        coachReviewStats: mutableData.coachReviewStats || { averageRating: 0, totalReviews: 0 },
      };

      return result;
    } catch (error) {
      console.log("Main coach profile query failed, trying fallback:", error);
      
      // Try fallback query without favoriteSports
      try {
        const { data } = await apolloClient.query({
          query: GET_COACH_PROFILE_FALLBACK,
          variables: { coachProfileId },
          fetchPolicy: 'network-only',
        });

        // Create a completely mutable copy using JSON serialization
        const mutableData = JSON.parse(JSON.stringify(data));

        const result = {
          coachProfile: {
            ...mutableData.coachProfile,
            user: mutableData.coachProfile?.user ? {
              ...mutableData.coachProfile.user,
              favoriteSports: []
            } : {
              id: "unknown",
              fullName: "Không có thông tin",
              rating: 0,
              avatar: null,
              favoriteSports: []
            }
          },
          coachReviewStats: mutableData.coachReviewStats || { averageRating: 0, totalReviews: 0 },
        };

        return result;
      } catch (fallbackError) {
        console.error("Fallback coach profile query also failed:", fallbackError);
        throw fallbackError;
      }
    }
  }

  // New method to get a coach by coach profile ID and convert to Coach format
  public async getCoachByProfileId(coachProfileId: number): Promise<Coach | null> {
    try {
      const profileResponse = await this.getCoachProfile(coachProfileId);
      
      if (!profileResponse.coachProfile) {
        return null;
      }

      // Convert CoachProfile response to Coach format
      const coach: Coach = {
        id: profileResponse.coachProfile.user.id.toString(),
        fullName: profileResponse.coachProfile.user.fullName,
        rating: profileResponse.coachProfile.user.rating || 0,
        avatar: profileResponse.coachProfile.user.avatar,
        favoriteSports: profileResponse.coachProfile.user.favoriteSports || [],
        coachProfile: {
          id: profileResponse.coachProfile.id,
          hourlyRate: profileResponse.coachProfile.hourlyRate,
          isAvailable: profileResponse.coachProfile.isAvailable,
          bio: profileResponse.coachProfile.bio,
          yearsOfExperience: profileResponse.coachProfile.yearsOfExperience,
        },
      };

      return coach;
    } catch (error) {
      console.error("Error getting coach by profile ID:", error);
      return null;
    }
  }
}

export default CoachService.getInstance(); 