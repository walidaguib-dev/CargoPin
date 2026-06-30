import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { getGraphQLClient } from "@/lib/graphql";
import { useAuth } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";

// TallymanId is a filterable scalar on MerchandiseAreaPosition.
// MerchandiseAreaPositionFilterType only ignores Location and the Tallyman
// *navigation property* — the TallymanId FK string is auto-exposed.
const MY_ASSIGNMENTS_QUERY = `
  query GetMyAssignments($tallymanId: String!) {
    positions(
      where: {
        tallymanId: { eq: $tallymanId }
        isActive: { eq: true }
      }
      order: [{ placedAt: DESC }]
    ) {
      nodes {
        id
        placedAt
        isEmergencyPlacement
        notes
        state
        latitude
        longitude
        shipment {
          id
          blNumbers
          client { name }
          merchandise { description }
          vessel { name }
        }
        area { name }
        zone { name }
      }
    }
  }
`;

interface AssignmentNode {
  id: number;
  placedAt: string;
  isEmergencyPlacement: boolean;
  notes: string | null;
  state: string;
  latitude: number;
  longitude: number;
  shipment: {
    id: number;
    blNumbers: string[];
    client: { name: string };
    merchandise: { description: string };
    vessel: { name: string };
  };
  area: { name: string } | null;
  zone: { name: string } | null;
}

interface AssignmentsResult {
  positions: { nodes: AssignmentNode[] };
}

async function fetchMyAssignments(tallymanId: string): Promise<AssignmentNode[]> {
  try {
    const client = await getGraphQLClient();
    const data = await client.request<AssignmentsResult>(MY_ASSIGNMENTS_QUERY, { tallymanId });
    return data.positions.nodes;
  } catch (err) {
    console.error("[Assignments] fetchMyAssignments error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

function stateLabel(raw: string): string {
  switch (raw) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return raw;
  }
}

function AssignmentCard({ item }: { item: AssignmentNode }) {
  const placedAt = new Date(item.placedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const location =
    item.area?.name && item.zone?.name
      ? `${item.area.name} · ${item.zone.name}`
      : item.area?.name ?? item.zone?.name ?? "Outside mapped areas";

  const isActive = item.state === "ACTIVE";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName} numberOfLines={1}>
          {item.shipment.client.name}
        </Text>
        <View
          style={[
            styles.stateDot,
            { backgroundColor: isActive ? "#10B981" : "#64748B" },
          ]}
        />
      </View>

      <Text style={styles.merchandise} numberOfLines={2}>
        {item.shipment.merchandise.description}
      </Text>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{location}</Text>
      </View>

      {item.shipment.blNumbers.length > 0 && (
        <View style={styles.metaRow}>
          <Ionicons name="document-outline" size={12} color="#475569" />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.shipment.blNumbers.join(", ")}
          </Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{placedAt}</Text>
      </View>

      {item.isEmergencyPlacement && (
        <View style={styles.emergencyBadge}>
          <Ionicons name="warning-outline" size={11} color="#F59E0B" />
          <Text style={styles.emergencyText}>Emergency placement</Text>
        </View>
      )}

      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}
    </View>
  );
}

export default function AssignmentsScreen() {
  const { userId } = useAuth();
  const { onPositionCreated } = useSignalR();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ["my-assignments", userId],
    queryFn: () => fetchMyAssignments(userId!),
    enabled: userId !== null,
  });

  // SignalR: invalidate on any PositionCreated event.
  // The payload does NOT include tallymanId (backend gap — see PositionCreatedNotification.cs),
  // so we can't filter to only "my" events client-side. A full refetch is the safe fallback.
  useEffect(() => {
    const unsub = onPositionCreated(() => {
      void queryClient.invalidateQueries({ queryKey: ["my-assignments", userId] });
    });
    return unsub;
  }, [onPositionCreated, queryClient, userId]);

  const renderItem = useCallback(
    ({ item }: { item: AssignmentNode }) => <AssignmentCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: AssignmentNode) => String(item.id), []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0EA5E9" size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : String(error)}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="list-outline" size={48} color="#334155" />
        <Text style={styles.emptyTitle}>No active assignments</Text>
        <Text style={styles.emptyHint}>Tap + to search and assign a shipment</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor="#0EA5E9"
          colors={["#0EA5E9"]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  clientName: {
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  merchandise: {
    color: "#94A3B8",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#64748B",
    fontSize: 12,
    flex: 1,
  },
  emergencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#2D1F00",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#78350F",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  emergencyText: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "500",
  },
  notes: {
    color: "#475569",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  emptyTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  emptyHint: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    color: "#F87171",
    fontSize: 15,
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: "#1E3A5F",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
});
