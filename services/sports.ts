import { apolloClient } from "../config/apollo";
import {
    ADD_FAVORITE_SPORT,
    GET_ALL_SPORTS,
    GET_USER_FAVORITE_SPORTS,
    REMOVE_FAVORITE_SPORT,
} from "../graphql";
import { Sport, UserFavoriteSport } from "../types";

class SportsService {
  private static instance: SportsService;

  private constructor() {}

  public static getInstance(): SportsService {
    if (!SportsService.instance) {
      SportsService.instance = new SportsService();
    }
    return SportsService.instance;
  }

  public async getAllSports(): Promise<Sport[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_SPORTS,
        fetchPolicy: 'network-only',
      });

      if (data?.sports) {
        return data.sports;
      }

      return [];
    } catch (error) {
      console.error("Error fetching sports:", error);
      // Return fallback sports data
      return this.getFallbackSports();
    }
  }

  public async getUserFavoriteSports(userId: number): Promise<Sport[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_USER_FAVORITE_SPORTS,
        variables: { userId },
        fetchPolicy: 'network-only',
      });

      if (data?.userFavoriteSports) {
        return data.userFavoriteSports.map((favorite: UserFavoriteSport) => favorite.sport);
      }

      return [];
    } catch (error) {
      console.error("Error fetching user favorite sports:", error);
      return [];
    }
  }

  public async addFavoriteSport(userId: number, sportId: number): Promise<UserFavoriteSport | null> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ADD_FAVORITE_SPORT,
        variables: {
          addFavoriteSportInput: {
            userId,
            sportId,
          },
        },
      });

      return data?.addFavoriteSport || null;
    } catch (error) {
      console.error("Error adding favorite sport:", error);
      throw error;
    }
  }

  public async removeFavoriteSport(userId: number, sportId: number): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REMOVE_FAVORITE_SPORT,
        variables: {
          userId,
          sportId,
        },
      });

      return data?.removeFavoriteSport || false;
    } catch (error) {
      console.error("Error removing favorite sport:", error);
      throw error;
    }
  }

  private getFallbackSports(): Sport[] {
    return [
      { id: 1, name: "Cầu lông", createdAt: new Date().toISOString() },
      { id: 2, name: "Quần vợt", createdAt: new Date().toISOString() },
      { id: 3, name: "Bóng bàn", createdAt: new Date().toISOString() },
      { id: 4, name: "Pickleball", createdAt: new Date().toISOString() },
    ];
  }
}

export default SportsService.getInstance(); 