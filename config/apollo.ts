import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from "./env";

// Log the API URL we're trying to connect to
console.log("Attempting to connect to:", `${env.API_BASE_URL}/graphql`);

const httpLink = createHttpLink({
  uri: `${env.API_BASE_URL}/graphql`,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "apollo-require-preflight": "true",
  },
});

// Auth link to add tokens to requests
const authLink = setContext(async (_, { headers }) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    return {
      headers: {
        ...headers,
        ...(accessToken && { authorization: `Bearer ${accessToken}` }),
      },
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    return { headers };
  }
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.log('Authentication error - user may need to login again');
        // You could dispatch a logout action here or redirect to login
      }
    });
  }
  
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
    console.log("Failed request details:", {
      url: operation.getContext().uri || `${env.API_BASE_URL}/graphql`,
      method: operation.getContext().method || "POST",
      headers: operation.getContext().headers || {},
    });
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "network-only",
    },
    watchQuery: {
      fetchPolicy: "network-only",
    },
  },
});
