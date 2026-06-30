import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

import { getGraphQLClient } from "@/lib/graphql";
import { Shipment } from "@/types";

const SEARCH_QUERY = `
  query SearchShipments($search: String!) {
    shipments(
      where: {
        or: [
          { client: { name: { contains: $search } } }
          { blNumbers: { some: { eq: $search } } }
        ]
      }
      first: 20
    ) {
      nodes {
        id
        blNumbers
        arrivalDate
        status
        client { id name }
        vessel { id name }
        merchandise { id description cargoType }
      }
    }
  }
`;

interface SearchResult {
  shipments: { nodes: Shipment[] };
}

async function searchShipments(search: string): Promise<Shipment[]> {
  const client = await getGraphQLClient();
  const data = await client.request<SearchResult>(SEARCH_QUERY, { search });
  return data.shipments.nodes;
}

function fromGraphQLStatus(raw: string): string {
  switch (raw) {
    case "AWAITING":
      return "Awaiting";
    case "STORED":
      return "Stored";
    case "PARTIALLY_STORED":
      return "Partially Stored";
    case "RELEASED":
      return "Released";
    default:
      return raw;
  }
}

const STATUS_COLORS: Record<string, string> = {
  AWAITING: "#64748B",
  STORED: "#10B981",
  PARTIALLY_STORED: "#F59E0B",
  RELEASED: "#3B82F6",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "#64748B";
  return (
    <View style={[styles.badge, { backgroundColor: color + "33", borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{fromGraphQLStatus(status)}</Text>
    </View>
  );
}

function ShipmentCard({
  shipment,
  onPress,
}: {
  shipment: Shipment;
  onPress: () => void;
}) {
  const arrivalDate = new Date(shipment.arrivalDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.clientName} numberOfLines={1}>
          {shipment.client.name}
        </Text>
        <StatusBadge status={shipment.status} />
      </View>

      <Text style={styles.merchandise} numberOfLines={2}>
        {shipment.merchandise.description}
      </Text>

      <View style={styles.cardMeta}>
        <Text style={styles.metaLabel}>Vessel</Text>
        <Text style={styles.metaValue}>{shipment.vessel.name}</Text>
      </View>

      {shipment.blNumbers.length > 0 && (
        <View style={styles.cardMeta}>
          <Text style={styles.metaLabel}>B/L</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {shipment.blNumbers.join(", ")}
          </Text>
        </View>
      )}

      <View style={styles.cardMeta}>
        <Text style={styles.metaLabel}>Arrival</Text>
        <Text style={styles.metaValue}>{arrivalDate}</Text>
      </View>
    </Pressable>
  );
}

export default function SelectShipmentScreen() {
  const [inputText, setInputText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((text: string) => {
    setInputText(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(text.trim());
    }, 300);
  }, []);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ["shipments-search", debouncedSearch],
    queryFn: () => searchShipments(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  const handleCardPress = useCallback((shipment: Shipment) => {
    router.push({
      pathname: "/(app)/assign",
      params: {
        shipmentId: String(shipment.id),
        clientName: shipment.client.name,
        merchandiseDescription: shipment.merchandise.description,
        vesselName: shipment.vessel.name,
        blNumbers: JSON.stringify(shipment.blNumbers),
      },
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Shipment }) => (
      <ShipmentCard shipment={item} onPress={() => handleCardPress(item)} />
    ),
    [handleCardPress]
  );

  const keyExtractor = useCallback((item: Shipment) => String(item.id), []);

  const showEmpty =
    !isLoading && !isError && debouncedSearch.length >= 2 && (!data || data.length === 0);
  const showPrompt = debouncedSearch.length < 2;

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Client name or B/L number..."
            placeholderTextColor="#475569"
            value={inputText}
            onChangeText={handleChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoFocus
          />
        </View>
      </View>

      {isLoading && debouncedSearch.length >= 2 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load shipments.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : showPrompt ? (
        <View style={styles.center}>
          <Text style={styles.promptText}>Enter at least 2 characters to search</Text>
        </View>
      ) : showEmpty ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No shipments found</Text>
          <Text style={styles.emptySubText}>Try a different client name or B/L number</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#3B82F6"
              colors={["#3B82F6"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  inputWrapper: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  input: {
    color: "#F1F5F9",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    gap: 6,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  clientName: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  merchandise: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  metaLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
    width: 44,
  },
  metaValue: {
    color: "#CBD5E1",
    fontSize: 12,
    flex: 1,
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  promptText: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubText: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    color: "#F87171",
    fontSize: 15,
    marginBottom: 12,
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
