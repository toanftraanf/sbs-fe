import { apolloClient } from "@/config/apollo";
import { CANCEL_USER_SUBSCRIPTION, CREATE_USER_SUBSCRIPTION, GET_SUBSCRIPTIONS, GET_USER_SUBSCRIPTION } from "@/graphql";

export interface Subscription {
  id: string;
  name: string;
  description: string;
  durationMonths: number;
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  userId: number;
  subscriptionId: number;
  startDate: string;
  endDate: string;
  status: string;
  isCancelled: boolean;
  cardId: number;
  createdAt: string;
  updatedAt: string;
  subscription?: Subscription;
}

export interface UserSubscriptionDetails {
  id: string;
  userId: number;
  subscriptionId: number;
  startDate: string;
  endDate: string;
  status: string;
  isCancelled: boolean;
  cardId: number;
  createdAt: string;
  updatedAt: string;
  subscription?: Subscription;
}

// Get all available subscriptions
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_SUBSCRIPTIONS,
      fetchPolicy: "cache-first",
    });
    return data.subscriptions || [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

// Create a new user subscription
export const createUserSubscription = async (input: {
  userId: number;
  subscriptionId: number;
  startDate: string;
  endDate: string;
  status: string;
  cardId: number;
}): Promise<UserSubscription> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_USER_SUBSCRIPTION,
      variables: {
        createUserSubscriptionInput: {
          userId: input.userId,
          subscriptionId: input.subscriptionId,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
          cardId: input.cardId,
        },
      },
    });
    return data.createUserSubscription;
  } catch (error) {
    console.error("Error creating user subscription:", error);
    throw error;
  }
};

// Get user subscription details
export const getUserSubscription = async (userId: number): Promise<UserSubscriptionDetails | null> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_USER_SUBSCRIPTION,
      variables: { userId },
      fetchPolicy: "cache-first",
      errorPolicy: "all", // Don't throw errors for missing data
    });
    
    // Handle array response and get the first active subscription
    const subscriptions = data.userSubscriptionsByUserId || [];
    const activeSubscription = subscriptions.find((sub: any) => 
      sub.status === "ACTIVE" && !sub.isCancelled
    );
    
    console.log("[getUserSubscription] Found subscriptions:", subscriptions.length, "Active:", !!activeSubscription);
    return activeSubscription || null;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    // Return null instead of throwing error to prevent app crashes
    return null;
  }
};

// Cancel user subscription
export const cancelUserSubscription = async (userId: number): Promise<UserSubscription> => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CANCEL_USER_SUBSCRIPTION,
      variables: { userId },
    });
    return data.cancelUserSubscription;
  } catch (error) {
    console.error("Error canceling user subscription:", error);
    throw error;
  }
}; 