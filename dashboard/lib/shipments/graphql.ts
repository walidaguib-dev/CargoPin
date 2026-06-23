import { SHIPMENT_STATUSES, type Shipment, type ShipmentStatus } from "./types";

// Backend/API/Program.cs mounts HotChocolate at app.MapGraphQL(), which defaults to
// "/graphql" off the app root — NOT under "/api" like the REST endpoints. Same
// derivation used by every other entity's graphql.ts in this codebase.
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URI ??
  `${(process.env.NEXT_PUBLIC_API_URI ?? "").replace(/\/api\/?$/, "")}/graphql`;

// HotChocolate's default enum naming convention renders C# PascalCase enum members as
// SCREAMING_SNAKE_CASE GraphQL enum values (e.g. ShipmentStatus.PartiallyStored ->
// PARTIALLY_STORED) — same assumption proven correct for Vessel/Merchandise.
function toGraphQLEnum(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
}

function fromGraphQLEnum(value: string): ShipmentStatus {
  const pascal = value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join("");
  return (SHIPMENT_STATUSES as readonly string[]).includes(pascal)
    ? (pascal as ShipmentStatus)
    : (value as ShipmentStatus);
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

interface RawShipmentNode {
  id: number;
  blNumbers: string[];
  arrivalDate: string;
  status: string;
  note: string | null;
  clientId: number;
  vesselId: number;
  merchandiseId: number;
  client: { name: string } | null;
  vessel: { name: string } | null;
  merchandise: { description: string } | null;
}

function mapShipment(raw: RawShipmentNode): Shipment {
  return {
    id: raw.id,
    blNumbers: raw.blNumbers,
    arrivalDate: raw.arrivalDate,
    status: fromGraphQLEnum(raw.status),
    note: raw.note,
    clientId: raw.clientId,
    clientName: raw.client?.name ?? "—",
    vesselId: raw.vesselId,
    vesselName: raw.vessel?.name ?? "—",
    merchandiseId: raw.merchandiseId,
    merchandiseDescription: raw.merchandise?.description ?? "—",
  };
}

// [UsePaging][UseFiltering][UseSorting] on ShipmentsQuery.GetShipments produces a
// Relay-style connection field. HotChocolate strips the "Get" prefix from resolver
// method names by default, so GetShipments -> field `shipments`. Kept shallow on
// purpose — only `name`/`description` off the three relations, no further nesting —
// per the cost-analyzer lesson from Merchandise/Vessel.
const SHIPMENTS_QUERY = /* GraphQL */ `
  query GetShipments(
    $first: Int
    $after: String
    $where: ShipmentFilterInput
    $order: [ShipmentSortInput!]
  ) {
    shipments(first: $first, after: $after, where: $where, order: $order) {
      edges {
        node {
          id
          blNumbers
          arrivalDate
          status
          note
          clientId
          vesselId
          merchandiseId
          client {
            name
          }
          vessel {
            name
          }
          merchandise {
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

interface ShipmentsConnection {
  shipments: {
    edges: { node: RawShipmentNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface ShipmentsPage {
  items: Shipment[];
  hasNextPage: boolean;
  endCursor: string | null;
}

// Same cost-analyzer budget every other list query in this codebase stays under.
const PAGE_SIZE = 20;

export async function fetchShipments(options: {
  clientSearch?: string;
  vesselSearch?: string;
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string; // "YYYY-MM-DD"
  status?: ShipmentStatus;
  after?: string | null;
}): Promise<ShipmentsPage> {
  const filters: Record<string, unknown>[] = [];
  if (options.clientSearch?.trim()) {
    filters.push({ client: { name: { contains: options.clientSearch.trim() } } });
  }
  if (options.vesselSearch?.trim()) {
    filters.push({ vessel: { name: { contains: options.vesselSearch.trim() } } });
  }
  if (options.dateFrom) {
    filters.push({ arrivalDate: { gte: `${options.dateFrom}T00:00:00.000Z` } });
  }
  if (options.dateTo) {
    filters.push({ arrivalDate: { lte: `${options.dateTo}T23:59:59.999Z` } });
  }
  if (options.status) {
    filters.push({ status: { eq: toGraphQLEnum(options.status) } });
  }

  const where =
    filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { and: filters };

  const data = await fetchGraphQL<ShipmentsConnection>(SHIPMENTS_QUERY, {
    first: PAGE_SIZE,
    after: options.after ?? undefined,
    where,
    order: [{ arrivalDate: "DESC" }],
  });

  return {
    items: data.shipments.edges.map((e) => mapShipment(e.node)),
    hasNextPage: data.shipments.pageInfo.hasNextPage,
    endCursor: data.shipments.pageInfo.endCursor,
  };
}

// Same field selection as SHIPMENTS_QUERY, single record. GetShipment -> field
// `shipment`; arg name is capitalized ("Id") to match the resolver's C# parameter
// name, same quirk already seen on Merchandise's single-record query.
const SHIPMENT_QUERY = /* GraphQL */ `
  query GetShipment($id: Int!) {
    shipment(Id: $id) {
      id
      blNumbers
      arrivalDate
      status
      note
      clientId
      vesselId
      merchandiseId
      client {
        name
      }
      vessel {
        name
      }
      merchandise {
        description
      }
    }
  }
`;

interface ShipmentResult {
  shipment: RawShipmentNode | null;
}

// Used by EditShipmentModal to refresh against the live record when the modal
// opens, instead of trusting the list query's possibly-stale row snapshot for the
// pre-filled client/vessel/merchandise names.
export async function fetchShipment(id: number): Promise<Shipment | null> {
  const data = await fetchGraphQL<ShipmentResult>(SHIPMENT_QUERY, { id });
  return data.shipment ? mapShipment(data.shipment) : null;
}
