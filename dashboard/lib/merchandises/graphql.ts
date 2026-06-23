import { CARGO_TYPES, type CargoType, type Merchandise } from "./types";

// Backend/API/Program.cs mounts HotChocolate at app.MapGraphQL(), which defaults to
// "/graphql" off the app root — NOT under "/api" like the REST endpoints. There's no
// existing GraphQL call anywhere in this codebase to confirm the env var convention, so
// this derives the endpoint from NEXT_PUBLIC_API_URI (stripping a trailing "/api") with
// an explicit NEXT_PUBLIC_GRAPHQL_URI override for cases where that derivation is wrong.
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ??
  `${(process.env.NEXT_PUBLIC_API_URI ?? "").replace(/\/api\/?$/, "")}/graphql`;

// HotChocolate's default enum naming convention renders C# PascalCase enum members as
// SCREAMING_SNAKE_CASE GraphQL enum values (e.g. CargoType.SteelCoils -> STEEL_COILS).
// Not confirmed against a live schema (no DB connection available here) — verify with
// the Nitro/Banana Cake Pop explorer at GRAPHQL_ENDPOINT and adjust if it differs.
function toGraphQLEnum(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

function fromGraphQLEnum(value: string): CargoType {
  const pascal = value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join("");
  return (CARGO_TYPES as readonly string[]).includes(pascal)
    ? (pascal as CargoType)
    : (value as CargoType);
}

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

interface RawMerchandiseNode {
  id: number;
  description: string;
  cargoType: string;
  weight: number | null;
  numberOfHeat: number | null;
  note: string | null;
}

function mapMerchandise(raw: RawMerchandiseNode): Merchandise {
  return {
    id: raw.id,
    description: raw.description,
    cargoType: fromGraphQLEnum(raw.cargoType),
    weight: raw.weight,
    numberOfHeat: raw.numberOfHeat,
    note: raw.note,
  };
}

// [UsePaging][UseProjection][UseFiltering][UseSorting] on
// MerchandisesQuery.GetMerchandises produces a Relay-style connection field.
// HotChocolate strips the "Get" prefix from resolver method names by default,
// so GetMerchandises -> field `merchandises`, GetMerchandise -> field `merchandise`.
const MERCHANDISES_QUERY = /* GraphQL */ `
  query GetMerchandises(
    $first: Int
    $after: String
    $where: MerchandiseFilterInput
    $order: [MerchandiseSortInput!]
  ) {
    merchandises(first: $first, after: $after, where: $where, order: $order) {
      edges {
        node {
          id
          description
          cargoType
          weight
          numberOfHeat
          note
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const MERCHANDISE_QUERY = /* GraphQL */ `
  query GetMerchandise($id: Int!) {
    merchandise(Id: $id) {
      id
      description
      cargoType
      weight
      numberOfHeat
      note
    }
  }
`;

interface MerchandisesConnection {
  merchandises: {
    edges: { node: RawMerchandiseNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

interface MerchandiseResult {
  merchandise: RawMerchandiseNode | null;
}

export interface MerchandisesPage {
  items: Merchandise[];
  hasNextPage: boolean;
  endCursor: string | null;
}

// HotChocolate's cost analyzer (HotChocolate.CostAnalysis) rejects any query whose
// computed field cost exceeds maxFieldCost (default 1000) — a `first: 100` page on
// this connection alone costs ~4237, well over budget. 20 stays comfortably inside
// the default budget; pair with `after` cursors (see loadMore in hooks.ts) instead of
// raising this further so the full catalog stays reachable without re-tuning costs.
const PAGE_SIZE = 20;

export async function fetchMerchandises(options: {
  search?: string;
  cargoType?: CargoType;
  after?: string | null;
  first?: number;
}): Promise<MerchandisesPage> {
  const filters: Record<string, unknown>[] = [];
  if (options.search?.trim()) {
    filters.push({ description: { contains: options.search.trim() } });
  }
  if (options.cargoType) {
    filters.push({ cargoType: { eq: toGraphQLEnum(options.cargoType) } });
  }

  const where =
    filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { and: filters };

  const data = await fetchGraphQL<MerchandisesConnection>(MERCHANDISES_QUERY, {
    first: options.first ?? PAGE_SIZE,
    after: options.after ?? undefined,
    where,
    order: [{ description: "ASC" }],
  });

  return {
    items: data.merchandises.edges.map((e) => mapMerchandise(e.node)),
    hasNextPage: data.merchandises.pageInfo.hasNextPage,
    endCursor: data.merchandises.pageInfo.endCursor,
  };
}

export async function fetchMerchandise(id: number): Promise<Merchandise | null> {
  const data = await fetchGraphQL<MerchandiseResult>(MERCHANDISE_QUERY, { id });
  return data.merchandise ? mapMerchandise(data.merchandise) : null;
}
