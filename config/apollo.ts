import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
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

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
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
  link: errorLink.concat(httpLink),
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
