import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface ShipmentFilters {
  vesselName: string;
  clientName: string;
  merchandiseDescription: string;
  arrivalDateFrom: string;
  arrivalDateTo: string;
}

export const EMPTY_FILTERS: ShipmentFilters = {
  vesselName: "",
  clientName: "",
  merchandiseDescription: "",
  arrivalDateFrom: "",
  arrivalDateTo: "",
};

// Build the HotChocolate ShipmentFilterInput object from search text + filter panel state.
// search is only applied when length >= 2; empty filter strings are skipped entirely.
// Uses `some` for blNumbers list filter (HotChocolate v15 — not `any`).
export function buildShipmentWhere(
  search: string,
  filters: ShipmentFilters,
): Record<string, unknown> {
  const conditions: object[] = [];

  if (search.length >= 2) {
    conditions.push({
      or: [
        { client: { name: { contains: search } } },
        { blNumbers: { some: { eq: search } } },
      ],
    });
  }

  if (filters.vesselName.trim()) {
    conditions.push({ vessel: { name: { contains: filters.vesselName.trim() } } });
  }

  if (filters.clientName.trim()) {
    conditions.push({ client: { name: { contains: filters.clientName.trim() } } });
  }

  if (filters.merchandiseDescription.trim()) {
    conditions.push({
      merchandise: { description: { contains: filters.merchandiseDescription.trim() } },
    });
  }

  if (filters.arrivalDateFrom.trim()) {
    conditions.push({ arrivalDate: { gte: filters.arrivalDateFrom.trim() } });
  }

  if (filters.arrivalDateTo.trim()) {
    conditions.push({ arrivalDate: { lte: filters.arrivalDateTo.trim() } });
  }

  return conditions.length > 0 ? { and: conditions } : {};
}

function isValidDateOrEmpty(str: string): boolean {
  if (!str.trim()) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) return false;
  const d = new Date(str.trim());
  return !isNaN(d.getTime());
}

export interface ShipmentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ShipmentFilters) => void;
  currentFilters: ShipmentFilters;
}

export default function ShipmentFilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: ShipmentFilterModalProps) {
  const [draft, setDraft] = useState<ShipmentFilters>(currentFilters);
  const [dateFromError, setDateFromError] = useState("");
  const [dateToError, setDateToError] = useState("");

  // Sync draft to currentFilters each time the modal opens
  useEffect(() => {
    if (visible) {
      setDraft(currentFilters);
      setDateFromError("");
      setDateToError("");
    }
  }, [visible, currentFilters]);

  function setField<K extends keyof ShipmentFilters>(key: K, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (key === "arrivalDateFrom") setDateFromError("");
    if (key === "arrivalDateTo") setDateToError("");
  }

  function handleApply() {
    let valid = true;
    if (!isValidDateOrEmpty(draft.arrivalDateFrom)) {
      setDateFromError("Use format YYYY-MM-DD");
      valid = false;
    }
    if (!isValidDateOrEmpty(draft.arrivalDateTo)) {
      setDateToError("Use format YYYY-MM-DD");
      valid = false;
    }
    if (!valid) return;
    onApply(draft);
    onClose();
  }

  function handleClearAll() {
    setDraft(EMPTY_FILTERS);
    setDateFromError("");
    setDateToError("");
    onApply(EMPTY_FILTERS);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Filter Shipments</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>VESSEL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bao Nico"
              placeholderTextColor="#475569"
              value={draft.vesselName}
              onChangeText={(v) => setField("vesselName", v)}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.label}>CLIENT</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Houdna Metal"
              placeholderTextColor="#475569"
              value={draft.clientName}
              onChangeText={(v) => setField("clientName", v)}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.label}>MERCHANDISE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Steel Coils"
              placeholderTextColor="#475569"
              value={draft.merchandiseDescription}
              onChangeText={(v) => setField("merchandiseDescription", v)}
              autoCapitalize="sentences"
              returnKeyType="next"
            />

            <Text style={styles.label}>ARRIVAL DATE</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputFlat,
                    dateFromError ? styles.inputErr : null,
                  ]}
                  placeholder="From YYYY-MM-DD"
                  placeholderTextColor="#475569"
                  value={draft.arrivalDateFrom}
                  onChangeText={(v) => setField("arrivalDateFrom", v)}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                  maxLength={10}
                />
                {dateFromError ? (
                  <Text style={styles.fieldError}>{dateFromError}</Text>
                ) : null}
              </View>
              <View style={styles.dateField}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputFlat,
                    dateToError ? styles.inputErr : null,
                  ]}
                  placeholder="To YYYY-MM-DD"
                  placeholderTextColor="#475569"
                  value={draft.arrivalDateTo}
                  onChangeText={(v) => setField("arrivalDateTo", v)}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  maxLength={10}
                />
                {dateToError ? (
                  <Text style={styles.fieldError}>{dateToError}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.clearButton} onPress={handleClearAll}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  sheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#475569",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  label: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 8,
    color: "#F8FAFC",
    padding: 12,
    fontSize: 14,
    marginTop: 6,
  },
  inputFlat: {
    marginTop: 0,
  },
  inputErr: {
    borderColor: "#EF4444",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 11,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  dateField: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    marginBottom: 8,
  },
  clearButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 13,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#0EA5E9",
    paddingVertical: 13,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
