import { ZONE_TYPES, type Zone, type ZoneType } from "./types";

// Backend/API/Program.cs mounts HotChocolate at app.MapGraphQL(), which defaults to
// "/graphql" off the app root — NOT under "/api" like the REST endpoints. Same
// derivation used by every other entity's graphql.ts in this codebase.
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ??
  `${(process.env.NEXT_PUBLIC_API_URI ?? "").replace(/\/api\/?$/, "")}/graphql`;

// HotChocolate's default enum naming convention renders C# PascalCase enum members as
// SCREAMING_SNAKE_CASE GraphQL enum values (e.g. ZoneType.Hangar -> HANGAR) — same
// assumption already proven correct for Vessel/Shipment/Area.
function toGraphQLEnum(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

function fromGraphQLEnum(value: string): ZoneType {
  const pascal = value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join("");
  return (ZONE_TYPES as readonly string[]).includes(pascal)
    ? (pascal as ZoneType)
    : (value as ZoneType);
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

interface RawZoneNode {
  id: number;
  name: string;
  code: string;
  type: string;
  designatedMerchandise: { description: string } | null;
}

function mapZone(raw: RawZoneNode): Zone {
  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    type: fromGraphQLEnum(raw.type),
    designatedMerchandiseDescription: raw.designatedMerchandise?.description ?? null,
  };
}

// [UsePaging][UseFiltering(ZoneFilterType)][UseSorting(ZoneSortType)] on
// ZonesQuery.GetZones produces a Relay-style connection field. HotChocolate strips
// the "Get" prefix from resolver method names by default, so GetZones -> field
// `zones`. ZoneFilterType only ignores Boundary, so name/type/designatedMerchandise
// all filter normally. Kept shallow on purpose — only
// `designatedMerchandise.description`, no further nesting (no `areas` relation).
const ZONES_QUERY = /* GraphQL */ `
  query GetZones(
    $first: Int
    $after: String
    $where: ZoneFilterInput
    $order: [ZoneSortInput!]
  ) {
    zones(first: $first, after: $after, where: $where, order: $order) {
      edges {
        node {
          id
          name
          code
          type
          designatedMerchandise {
            description
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface ZonesConnection {
  zones: {
    edges: { node: RawZoneNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface ZonesPage {
  items: Zone[];
  hasNextPage: boolean;
  endCursor: string | null;
}

// Same cost-analyzer budget every other list query in this codebase stays under.
const PAGE_SIZE = 20;

export async function fetchZones(options: {
  search?: string;
  type?: ZoneType;
  after?: string | null;
  first?: number;
}): Promise<ZonesPage> {
  const filters: Record<string, unknown>[] = [];
  if (options.search?.trim()) {
    filters.push({ name: { contains: options.search.trim() } });
  }
  if (options.type) {
    filters.push({ type: { eq: toGraphQLEnum(options.type) } });
  }

  const where =
    filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { and: filters };

  const data = await fetchGraphQL<ZonesConnection>(ZONES_QUERY, {
    first: options.first ?? PAGE_SIZE,
    after: options.after ?? undefined,
    where,
    order: [{ name: "ASC" }],
  });

  return {
    items: data.zones.edges.map((e) => mapZone(e.node)),
    hasNextPage: data.zones.pageInfo.hasNextPage,
    endCursor: data.zones.pageInfo.endCursor,
  };
}
