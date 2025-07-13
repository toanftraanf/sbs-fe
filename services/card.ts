import { apolloClient } from "@/config/apollo";
import { CREATE_CARD, GET_USER_SAVED_CARD } from "@/graphql";

export type Card = {
  id: string;
  userId: number;
  cardType: string;
  bankName: string;
  last4: string;
  saveForNextPayment: boolean;
};

export const getUserSavedCard = async (userId: number): Promise<Card | null> => {
  try {
    console.log("Calling getUserSavedCard for userId:", userId);
    const { data } = await apolloClient.query({
      query: GET_USER_SAVED_CARD,
      variables: { userId },
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });
    console.log("GraphQL response:", data);
    return data?.userSavedCard || null;
  } catch (error) {
    console.error('Error fetching user saved card:', error);
    return null;
  }
};

export const createCard = async (input: {
  userId: number;
  cardType?: string;
  bankName: string;
  last4: string;
  saveForNextPayment?: boolean;
}) => {
  try {
    const { userId, cardType = "VISA", bankName, last4, saveForNextPayment = true } = input;
    
    const { data } = await apolloClient.mutate({
      mutation: CREATE_CARD,
      variables: {
        createCardInput: {
          userId,
          cardType,
          bankName,
          last4,
          saveForNextPayment,
        },
      },
    });
    return data.createCard;
  } catch (error) {
    console.error("Error creating card:", error);
    throw error;
  }
}; 