import { VESSEL_STATUSES, type Vessel, type VesselStatus } from "./types";

// Backend/API/Program.cs mounts HotChocolate at app.MapGraphQL(), which defaults to
// "/graphql" off the app root — NOT under "/api" like the REST endpoints. Same
// derivation used for Merchandise: strip a trailing "/api" off NEXT_PUBLIC_API_URI,
// with an explicit NEXT_PUBLIC_GRAPHQL_URI override available if that's wrong.
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ??
  `${(process.env.NEXT_PUBLIC_API_URI ?? "").replace(/\/api\/?$/, "")}/graphql`;

// HotChocolate's default enum naming convention renders C# PascalCase enum members as
// SCREAMING_SNAKE_CASE GraphQL enum values (e.g. VesselStatus.Departed -> DEPARTED).
// Verify against the live schema if this doesn't match — same assumption as Merchandise's
// CargoType mapping in lib/merchandises/graphql.ts.
function toGraphQLEnum(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

function fromGraphQLEnum(value: string): VesselStatus {
  const pascal = value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join("");
  return (VESSEL_STATUSES as readonly string[]).includes(pascal)
    ? (pascal as VesselStatus)
    : (value as VesselStatus);
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

interface RawVesselNode {
  id: number;
  name: string;
  imoNumber: string | null;
  status: string;
}

function mapVessel(raw: RawVesselNode): Vessel {
  return {
    id: raw.id,
    name: raw.name,
    imoNumber: raw.imoNumber,
    status: fromGraphQLEnum(raw.status),
  };
}

// [UsePaging][UseProjection][UseFiltering][UseSorting] on VesselsQuery.GetVessels
// produces a Relay-style connection field. HotChocolate strips the "Get" prefix from
// resolver method names by default, so GetVessels -> field `vessels`, GetVessel ->
// field `vessel`. Kept shallow on purpose (scalars only, no `clients` relation) —
// per the cost-analyzer lesson from Merchandise, deep/nested selections blow the
// default maxFieldCost budget fast.
//
// Note: IMONumber correctly maps to `imoNumber` here — HotChocolate's naming
// convention handles the acronym properly, unlike a naive "lowercase first letter
// only" transform. (An earlier version of this file assumed it'd produce
// `iMONumber` and aliased around it; the live schema proved that assumption wrong.)
const VESSELS_QUERY = /* GraphQL */ `
  query GetVessels(
    $first: Int
    $after: String
    $where: VesselFilterInput
    $order: [VesselSortInput!]
  ) {
    vessels(first: $first, after: $after, where: $where, order: $order) {
      edges {
        node {
          id
          name
          imoNumber
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface VesselsConnection {
  vessels: {
    edges: { node: RawVesselNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface VesselsPage {
  items: Vessel[];
  hasNextPage: boolean;
  endCursor: string | null;
}

// Same cost-analyzer ceiling Merchandise hit (HotChocolate.CostAnalysis, default
// maxFieldCost: 1000) — 20 stayed inside budget there, so starting from the same
// number here rather than re-discovering the limit by trial and error.
const PAGE_SIZE = 20;

export async function fetchVessels(options: {
  search?: string;
  status?: VesselStatus;
  after?: string | null;
  first?: number;
}): Promise<VesselsPage> {
  const filters: Record<string, unknown>[] = [];
  if (options.search?.trim()) {
    filters.push({ name: { contains: options.search.trim() } });
  }
  if (options.status) {
    filters.push({ status: { eq: toGraphQLEnum(options.status) } });
  }

  const where =
    filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { and: filters };

  const data = await fetchGraphQL<VesselsConnection>(VESSELS_QUERY, {
    first: options.first ?? PAGE_SIZE,
    after: options.after ?? undefined,
    where,
    order: [{ name: "ASC" }],
  });

  return {
    items: data.vessels.edges.map((e) => mapVessel(e.node)),
    hasNextPage: data.vessels.pageInfo.hasNextPage,
    endCursor: data.vessels.pageInfo.endCursor,
  };
}
