import { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getGraphQLClient } from "@/lib/graphql";
import ShipmentFilterModal, {
  buildShipmentWhere,
  EMPTY_FILTERS,
  type ShipmentFilters,
} from "@/components/ShipmentFilterModal";

// Extended types — include contact/IMO fields fetched only in this screen
interface ShipmentClient {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
}

interface ShipmentVessel {
  id: number;
  name: string;
  imoNumber: string | null;
}

interface ShipmentMerchandise {
  id: number;
  description: string;
  cargoType: string;
}

interface ShipmentDetail {
  id: number;
  blNumbers: string[];
  arrivalDate: string;
  status: string;
  note: string | null;
  client: ShipmentClient;
  vessel: ShipmentVessel;
  merchandise: ShipmentMerchandise;
}

const SHIPMENTS_FIELDS = `
  id
  blNumbers
  arrivalDate
  status
  note
  client { id name contactPerson phone email }
  vessel { id name imoNumber }
  merchandise { id description cargoType }
`;

// Single parameterised query replaces the old BROWSE_QUERY + SEARCH_QUERY pair.
// $where is optional — omitting it returns all shipments (browse mode).
const FILTERED_QUERY = `
  query GetShipments($where: ShipmentFilterInput, $first: Int!) {
    shipments(where: $where, first: $first, order: [{ arrivalDate: DESC }]) {
      nodes { ${SHIPMENTS_FIELDS} }
    }
  }
`;

interface QueryResult {
  shipments: { nodes: ShipmentDetail[] };
}

async function queryShipments(
  filters: ShipmentFilters,
): Promise<ShipmentDetail[]> {
  try {
    const where = buildShipmentWhere("", filters);
    const client = await getGraphQLClient();
    const variables: Record<string, unknown> = { first: 20 };
    if (Object.keys(where).length > 0) variables.where = where;
    const data = await client.request<QueryResult>(FILTERED_QUERY, variables);
    return data.shipments.nodes;
  } catch (err) {
    console.error("[Shipments] queryShipments error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

function fromGraphQLStatus(raw: string): string {
  switch (raw) {
    case "AWAITING": return "Awaiting";
    case "STORED": return "Stored";
    case "PARTIALLY_STORED": return "Partially Stored";
    case "RELEASED": return "Released";
    default: return raw;
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
  shipment: ShipmentDetail;
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

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ShipmentDetailModal({
  shipment,
  onClose,
}: {
  shipment: ShipmentDetail | null;
  onClose: () => void;
}) {
  if (!shipment) return null;

  const arrivalDate = new Date(shipment.arrivalDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Modal
      visible={shipment !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle} numberOfLines={1}>
            {shipment.client.name}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color="#64748B" />
          </Pressable>
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetSection}>
            <Text style={styles.sheetSectionLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              <StatusBadge status={shipment.status} />
            </View>
          </View>

          <View style={styles.sheetSection}>
            <Text style={styles.sheetSectionLabel}>CARGO</Text>
            <View style={styles.sheetCard}>
              <DetailRow label="Description" value={shipment.merchandise.description} />
              <DetailRow label="Type" value={shipment.merchandise.cargoType} />
              <DetailRow label="Arrival" value={arrivalDate} />
              {shipment.note ? <DetailRow label="Note" value={shipment.note} /> : null}
            </View>
          </View>

          {shipment.blNumbers.length > 0 && (
            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionLabel}>BILL OF LADING</Text>
              <View style={styles.sheetCard}>
                {shipment.blNumbers.map((bl) => (
                  <Text key={bl} style={styles.blNumber}>
                    {bl}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <View style={styles.sheetSection}>
            <Text style={styles.sheetSectionLabel}>VESSEL</Text>
            <View style={styles.sheetCard}>
              <DetailRow label="Name" value={shipment.vessel.name} />
              <DetailRow label="IMO" value={shipment.vessel.imoNumber} />
            </View>
          </View>

          <View style={styles.sheetSection}>
            <Text style={styles.sheetSectionLabel}>CLIENT</Text>
            <View style={styles.sheetCard}>
              <DetailRow label="Name" value={shipment.client.name} />
              <DetailRow label="Contact" value={shipment.client.contactPerson} />
              <DetailRow label="Phone" value={shipment.client.phone} />
              <DetailRow label="Email" value={shipment.client.email} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ShipmentsScreen() {
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDetail | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ShipmentFilters>(EMPTY_FILTERS);

  const handleApplyFilters = useCallback((filters: ShipmentFilters) => {
    setActiveFilters(filters);
  }, []);

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== "").length;
  const hasActiveFilters = activeFilterCount > 0;

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setFilterModalVisible(true)}
          style={{ marginRight: 16, position: "relative" }}
        >
          <Ionicons
            name={activeFilterCount > 0 ? "options" : "options-outline"}
            size={22}
            color={activeFilterCount > 0 ? "#0EA5E9" : "#94A3B8"}
          />
          {activeFilterCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#0EA5E9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      ),
    });
  }, [activeFilterCount, navigation]);

  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ["shipments", activeFilters],
    queryFn: () => queryShipments(activeFilters),
  });

  const renderItem = useCallback(
    ({ item }: { item: ShipmentDetail }) => (
      <ShipmentCard shipment={item} onPress={() => setSelectedShipment(item)} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: ShipmentDetail) => String(item.id), []);

  const showEmpty = !isLoading && !isError && (!data || data.length === 0);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0EA5E9" size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : String(error)}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : showEmpty ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color="#334155" />
          <Text style={styles.emptyTitle}>
            {hasActiveFilters ? "No shipments found" : "No shipments yet"}
          </Text>
          {hasActiveFilters && (
            <Text style={styles.emptyHint}>Try adjusting your filters</Text>
          )}
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
              tintColor="#0EA5E9"
              colors={["#0EA5E9"]}
            />
          }
        />
      )}

      <ShipmentDetailModal
        shipment={selectedShipment}
        onClose={() => setSelectedShipment(null)}
      />

      <ShipmentFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
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
  emptyTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyHint: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
  },
  errorText: {
    color: "#F87171",
    fontSize: 15,
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
  // Detail modal / bottom sheet
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderColor: "#334155",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#334155",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  sheetTitle: {
    color: "#F1F5F9",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  sheetSection: {
    gap: 8,
  },
  sheetSectionLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  statusRow: {
    alignSelf: "flex-start",
  },
  sheetCard: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
    width: 70,
    flexShrink: 0,
  },
  detailValue: {
    color: "#CBD5E1",
    fontSize: 13,
    flex: 1,
  },
  blNumber: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
});
