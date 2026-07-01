import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getGraphQLClient } from "@/lib/graphql";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";

// MerchandiseAreaPositionFilterType only ignores Location and Tallyman nav-prop.
// Shipment → Client → Name is filterable. Pass clientName="" to match all clients.
const MY_ASSIGNMENTS_QUERY = `
  query GetMyAssignments($tallymanId: String!, $clientName: String!) {
    positions(
      where: {
        tallymanId: { eq: $tallymanId }
        isActive: { eq: true }
        shipment: {
          client: {
            name: { contains: $clientName }
          }
        }
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

interface ActiveFilters {
  clientName: string;
}

interface UpdatePositionVars {
  id: number;
  notes: string;
  state: string;
}

async function fetchMyAssignments(
  tallymanId: string,
  clientName: string,
): Promise<AssignmentNode[]> {
  try {
    const client = await getGraphQLClient();
    const data = await client.request<AssignmentsResult>(MY_ASSIGNMENTS_QUERY, {
      tallymanId,
      clientName,
    });
    return data.positions.nodes;
  } catch (err) {
    console.error("[Assignments] fetchMyAssignments error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface AssignmentCardProps {
  item: AssignmentNode;
  onEdit: (item: AssignmentNode) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function AssignmentCard({ item, onEdit, onDelete, isDeleting }: AssignmentCardProps) {
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
      {/* Header: client + state dot + action buttons */}
      <View style={styles.cardHeader}>
        <Text style={styles.clientName} numberOfLines={1}>
          {item.shipment.client.name}
        </Text>
        <View style={styles.cardActions}>
          <View
            style={[styles.stateDot, { backgroundColor: isActive ? "#10B981" : "#64748B" }]}
          />
          <Pressable
            onPress={() => onEdit(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={isDeleting}
          >
            <Ionicons name="pencil-outline" size={20} color="#0EA5E9" />
          </Pressable>
          <Pressable
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size={16} color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Merchandise · Vessel */}
      <Text style={styles.merchandiseVessel} numberOfLines={1}>
        {item.shipment.merchandise.description} · {item.shipment.vessel.name}
      </Text>

      {/* Area / Zone */}
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{location}</Text>
      </View>

      {/* B/L Numbers */}
      {item.shipment.blNumbers.length > 0 && (
        <View style={styles.metaRow}>
          <Ionicons name="document-outline" size={12} color="#475569" />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.shipment.blNumbers.join(", ")}
          </Text>
        </View>
      )}

      {/* Emergency badge */}
      {item.isEmergencyPlacement && (
        <View style={styles.emergencyBadge}>
          <Ionicons name="warning-outline" size={11} color="#F59E0B" />
          <Text style={styles.emergencyText}>Emergency placement</Text>
        </View>
      )}

      {/* Notes */}
      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}

      {/* Date */}
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{placedAt}</Text>
      </View>

      {/* Google Maps */}
      <Pressable
        onPress={() =>
          void Linking.openURL(
            `https://www.google.com/maps?q=${item.latitude},${item.longitude}`,
          )
        }
        style={styles.mapsLink}
      >
        <Ionicons name="map-outline" size={12} color="#0EA5E9" />
        <Text style={styles.mapsLinkText}>View on Google Maps →</Text>
      </Pressable>
    </View>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

interface EditModalProps {
  position: AssignmentNode | null;
  notes: string;
  state: string;
  onNotesChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function EditModal({
  position,
  notes,
  state,
  onNotesChange,
  onStateChange,
  onSave,
  onCancel,
  isSaving,
}: EditModalProps) {
  return (
    <Modal
      visible={position !== null}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.modalBackdrop} onPress={onCancel} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Position</Text>

          <Text style={styles.modalLabel}>STATUS</Text>
          <View style={styles.stateToggle}>
            {(["ACTIVE", "INACTIVE"] as const).map((s) => (
              <Pressable
                key={s}
                style={[styles.stateOption, state === s && styles.stateOptionActive]}
                onPress={() => onStateChange(s)}
              >
                <Text
                  style={[
                    styles.stateOptionText,
                    state === s && styles.stateOptionTextActive,
                  ]}
                >
                  {s === "ACTIVE" ? "Active" : "Inactive"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.modalLabel}>NOTES</Text>
          <TextInput
            style={styles.editNotesInput}
            value={notes}
            onChangeText={onNotesChange}
            placeholder="Add notes about this placement…"
            placeholderTextColor="#475569"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{notes.length}/500</Text>

          <View style={styles.modalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.saveButton}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

interface FilterModalProps {
  visible: boolean;
  draftClientName: string;
  onDraftChange: (v: string) => void;
  hasActive: boolean;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterModal({
  visible,
  draftClientName,
  onDraftChange,
  hasActive,
  onApply,
  onClear,
  onClose,
}: FilterModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filter Assignments</Text>

          <Text style={styles.modalLabel}>CLIENT NAME</Text>
          <TextInput
            style={styles.filterInput}
            value={draftClientName}
            onChangeText={onDraftChange}
            placeholder="Search by client name..."
            placeholderTextColor="#475569"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={onApply}
          />

          <View style={styles.modalActions}>
            {hasActive && (
              <Pressable style={styles.clearButton} onPress={onClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            )}
            <Pressable style={[styles.saveButton, styles.saveButtonFlex]} onPress={onApply}>
              <Text style={styles.saveButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AssignmentsScreen() {
  const { userId } = useAuth();
  const { onPositionCreated } = useSignalR();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ clientName: "" });
  const [filterDraft, setFilterDraft] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const hasActiveFilters = activeFilters.clientName.trim().length > 0;

  // Edit state
  const [editingPosition, setEditingPosition] = useState<AssignmentNode | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editState, setEditState] = useState("");

  // Query — queryKey includes filter so React Query re-fetches when filter changes.
  // Invalidations use the ["my-assignments"] prefix to hit all filter variants.
  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery({
    queryKey: ["my-assignments", userId, activeFilters.clientName],
    queryFn: () => fetchMyAssignments(userId!, activeFilters.clientName),
    enabled: userId !== null,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest<void>(`/positions/delete/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete position. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, notes, state }: UpdatePositionVars) =>
      apiRequest<void>(`/positions/update/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes: notes.trim() || null, state }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      setEditingPosition(null);
    },
    onError: () => {
      Alert.alert("Error", "Failed to update position. Please try again.");
    },
  });

  // SignalR — invalidate all my-assignments variants on any PositionCreated event
  useEffect(() => {
    const unsub = onPositionCreated(() => {
      void queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
    });
    return unsub;
  }, [onPositionCreated, queryClient]);

  // Header filter button
  const handleOpenFilter = useCallback(() => {
    setFilterDraft(activeFilters.clientName);
    setIsFilterModalOpen(true);
  }, [activeFilters.clientName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleOpenFilter}
          style={styles.headerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View>
            <Ionicons
              name={hasActiveFilters ? "options" : "options-outline"}
              size={22}
              color={hasActiveFilters ? "#0EA5E9" : "#64748B"}
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </View>
        </Pressable>
      ),
    });
  }, [navigation, hasActiveFilters, handleOpenFilter]);

  // Card handlers
  const handleEdit = useCallback((item: AssignmentNode) => {
    setEditingPosition(item);
    setEditNotes(item.notes ?? "");
    setEditState(item.state);
  }, []);

  const handleDeletePress = useCallback(
    (id: number) => {
      Alert.alert(
        "Delete Position",
        "Are you sure you want to delete this position?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMutation.mutate(id),
          },
        ],
      );
    },
    [deleteMutation],
  );

  // Filter handlers
  const handleApplyFilter = useCallback(() => {
    setActiveFilters({ clientName: filterDraft.trim() });
    setIsFilterModalOpen(false);
  }, [filterDraft]);

  const handleClearFilter = useCallback(() => {
    setFilterDraft("");
    setActiveFilters({ clientName: "" });
    setIsFilterModalOpen(false);
  }, []);

  // Edit handlers
  const handleSave = useCallback(() => {
    if (!editingPosition) return;
    updateMutation.mutate({ id: editingPosition.id, notes: editNotes, state: editState });
  }, [editingPosition, editNotes, editState, updateMutation]);

  const handleCancelEdit = useCallback(() => {
    setEditingPosition(null);
  }, []);

  // List render
  const renderItem = useCallback(
    ({ item }: { item: AssignmentNode }) => (
      <AssignmentCard
        item={item}
        onEdit={handleEdit}
        onDelete={handleDeletePress}
        isDeleting={deleteMutation.isPending && deleteMutation.variables === item.id}
      />
    ),
    [handleEdit, handleDeletePress, deleteMutation.isPending, deleteMutation.variables],
  );

  const keyExtractor = useCallback((item: AssignmentNode) => String(item.id), []);

  // ── Render ──

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

  const isEmpty = !data || data.length === 0;

  return (
    <>
      {isEmpty ? (
        <View style={styles.center}>
          <Ionicons name="list-outline" size={48} color="#334155" />
          <Text style={styles.emptyTitle}>
            {hasActiveFilters ? "No matching assignments" : "No active assignments"}
          </Text>
          <Text style={styles.emptyHint}>
            {hasActiveFilters
              ? "Try clearing your filters"
              : "Tap + to search and assign a shipment"}
          </Text>
        </View>
      ) : (
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
      )}

      <EditModal
        position={editingPosition}
        notes={editNotes}
        state={editState}
        onNotesChange={setEditNotes}
        onStateChange={setEditState}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        isSaving={updateMutation.isPending}
      />

      <FilterModal
        visible={isFilterModalOpen}
        draftClientName={filterDraft}
        onDraftChange={setFilterDraft}
        hasActive={hasActiveFilters}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // List
  list: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  // States
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
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
    textAlign: "center",
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
  // Card
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
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  merchandiseVessel: {
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
  mapsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  mapsLinkText: {
    color: "#0EA5E9",
    fontSize: 12,
  },
  // Header
  headerButton: {
    marginRight: 16,
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0EA5E9",
  },
  // Shared modal
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalSheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#475569",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 13,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#0EA5E9",
    paddingVertical: 13,
    alignItems: "center",
  },
  saveButtonFlex: {
    flex: 1,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  clearButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  // Edit modal
  stateToggle: {
    flexDirection: "row",
    gap: 8,
  },
  stateOption: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 10,
    alignItems: "center",
  },
  stateOptionActive: {
    borderColor: "#0EA5E9",
    backgroundColor: "#0C2A3E",
  },
  stateOptionText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  stateOptionTextActive: {
    color: "#0EA5E9",
    fontWeight: "600",
  },
  editNotesInput: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#F1F5F9",
    fontSize: 14,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
  },
  charCount: {
    color: "#475569",
    fontSize: 11,
    textAlign: "right",
    marginTop: -4,
  },
  // Filter modal
  filterInput: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#F1F5F9",
    fontSize: 14,
    padding: 12,
    height: 48,
  },
});
