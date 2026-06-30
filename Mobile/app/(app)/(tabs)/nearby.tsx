import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { apiRequest } from "@/lib/api";
import { DEFAULT_NEARBY_RADIUS } from "@/lib/constants";
import type { NearbyPosition } from "@/types";

type LocationState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "ready"; latitude: number; longitude: number };

async function fetchNearby(latitude: number, longitude: number): Promise<NearbyPosition[]> {
  return apiRequest<NearbyPosition[]>(
    `/positions/nearby?latitude=${latitude}&longitude=${longitude}&radius=${DEFAULT_NEARBY_RADIUS}`
  );
}

function openInMaps(latitude: number, longitude: number) {
  void Linking.openURL(`https://www.google.com/maps?q=${latitude},${longitude}`);
}

function NearbyCard({ item }: { item: NearbyPosition }) {
  const placedAt = new Date(item.placedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const locationLabel =
    item.areaName && item.zoneName
      ? `${item.areaName} · ${item.zoneName}`
      : item.areaName ?? item.zoneName ?? "Outside mapped areas";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.clientName} numberOfLines={1}>
          {item.clientName}
        </Text>
        {item.isEmergencyPlacement && (
          <Ionicons name="warning" size={14} color="#F59E0B" />
        )}
      </View>

      <Text style={styles.merchandise} numberOfLines={2}>
        {item.merchandiseDescription}
      </Text>

      <View style={styles.metaRow}>
        <Ionicons name="boat-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{item.vesselName}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{locationLabel}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={12} color="#475569" />
        <Text style={styles.metaText}>{placedAt}</Text>
      </View>

      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.mapsButton, pressed && styles.mapsButtonPressed]}
        onPress={() => openInMaps(item.latitude, item.longitude)}
      >
        <Ionicons name="map-outline" size={13} color="#0EA5E9" />
        <Text style={styles.mapsText}>View on Google Maps</Text>
      </Pressable>
    </View>
  );
}

export default function NearbyScreen() {
  const [locationState, setLocationState] = useState<LocationState>({ status: "loading" });
  const [positions, setPositions] = useState<NearbyPosition[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const acquire = useCallback(async (): Promise<{ latitude: number; longitude: number } | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationState({ status: "denied" });
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    setLocationState({ status: "ready", ...coords });
    return coords;
  }, []);

  const load = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsFetching(true);
    setFetchError(null);

    try {
      const coords = await acquire();
      if (!coords) return;
      const result = await fetchNearby(coords.latitude, coords.longitude);
      setPositions(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load nearby positions";
      setFetchError(message);
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }, [acquire]);

  useEffect(() => {
    void load();
  }, [load]);

  const renderItem = useCallback(
    ({ item }: { item: NearbyPosition }) => <NearbyCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: NearbyPosition) => String(item.id), []);

  if (locationState.status === "denied" && positions.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="location-outline" size={48} color="#334155" />
        <Text style={styles.centerTitle}>Location access denied</Text>
        <Text style={styles.centerHint}>
          Enable location permission in Settings to see nearby positions.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => void load()}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0EA5E9" size="large" />
        <Text style={styles.loadingText}>Finding nearby positions…</Text>
      </View>
    );
  }

  if (fetchError && positions.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color="#F87171" />
        <Text style={styles.errorText}>{fetchError}</Text>
        <Pressable style={styles.retryButton} onPress={() => void load()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {locationState.status === "ready" && (
        <View style={styles.locationBanner}>
          <Ionicons name="location" size={12} color="#10B981" />
          <Text style={styles.locationBannerText}>
            {locationState.latitude.toFixed(4)}, {locationState.longitude.toFixed(4)} ·{" "}
            {DEFAULT_NEARBY_RADIUS}m radius
          </Text>
        </View>
      )}

      <FlatList
        data={positions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          positions.length === 0 ? styles.listEmpty : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void load(true)}
            tintColor="#0EA5E9"
            colors={["#0EA5E9"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Ionicons name="radio-outline" size={48} color="#334155" />
            <Text style={styles.emptyTitle}>No positions nearby</Text>
            <Text style={styles.emptyHint}>
              No active cargo within {DEFAULT_NEARBY_RADIUS}m of your location.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0F2218",
    borderBottomWidth: 1,
    borderBottomColor: "#134D2E",
  },
  locationBannerText: {
    color: "#10B981",
    fontSize: 11,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listEmpty: {
    flex: 1,
    padding: 16,
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
  notes: {
    color: "#475569",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  mapsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  mapsButtonPressed: {
    opacity: 0.6,
  },
  mapsText: {
    color: "#0EA5E9",
    fontSize: 12,
    fontWeight: "500",
  },
  center: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  centerTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  centerHint: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
  },
  loadingText: {
    color: "#475569",
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1E3A5F",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  retryText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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
});
