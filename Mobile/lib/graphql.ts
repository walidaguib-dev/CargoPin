import { GraphQLClient } from "graphql-request";
import * as SecureStore from "expo-secure-store";

import { GRAPHQL_URL } from "./constants";

export async function getGraphQLClient(): Promise<GraphQLClient> {
  const accessToken = await SecureStore.getItemAsync("access_token");

  return new GraphQLClient(GRAPHQL_URL, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
