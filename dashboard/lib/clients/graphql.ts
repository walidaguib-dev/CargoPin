import type { Client } from "./types";

// Backend/API/Program.cs mounts HotChocolate at app.MapGraphQL(), which defaults to
// "/graphql" off the app root — NOT under "/api" like the REST endpoints. Same
// derivation used for Vessels/Merchandise: strip a trailing "/api" off
// NEXT_PUBLIC_API_URI, with an explicit NEXT_PUBLIC_GRAPHQL_URI override available
// if that's wrong.
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ??
  `${(process.env.NEXT_PUBLIC_API_URI ?? "").replace(/\/api\/?$/, "")}/graphql`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function fetchGraphQL<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  const json: GraphQLResponse<TData> = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data as TData;
}

// ClientsQuery.GetClients has no [UseProjection] (unlike Merchandise/Vessel's
// queries), but [UsePaging][UseFiltering][UseSorting] still produce the same
// Relay-style connection shape. Kept shallow on purpose (scalars only, no
// `shipments` relation) — per the cost-analyzer lesson from Merchandise,
// deep/nested selections blow the default maxFieldCost budget fast.
const CLIENTS_QUERY = /* GraphQL */ `
  query GetClients(
    $first: Int
    $after: String
    $where: ClientFilterInput
    $order: [ClientSortInput!]
  ) {
    clients(first: $first, after: $after, where: $where, order: $order) {
      edges {
        node {
          id
          name
          contactPerson
          phone
          email
          taxId
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface ClientsConnection {
  clients: {
    edges: { node: Client }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface ClientsPage {
  items: Client[];
  hasNextPage: boolean;
  endCursor: string | null;
}

// Same cost-analyzer ceiling Merchandise/Vessels hit (HotChocolate.CostAnalysis,
// default maxFieldCost: 1000) — 20 stayed inside budget there, so starting from
// the same number here rather than re-discovering the limit by trial and error.
const PAGE_SIZE = 20;

export async function fetchClients(options: {
  search?: string;
  after?: string | null;
  first?: number;
}): Promise<ClientsPage> {
  const where = options.search?.trim()
    ? { name: { contains: options.search.trim() } }
    : undefined;

  const data = await fetchGraphQL<ClientsConnection>(CLIENTS_QUERY, {
    first: options.first ?? PAGE_SIZE,
    after: options.after ?? undefined,
    where,
    order: [{ name: "ASC" }],
  });

  return {
    items: data.clients.edges.map((e) => e.node),
    hasNextPage: data.clients.pageInfo.hasNextPage,
    endCursor: data.clients.pageInfo.endCursor,
  };
}
