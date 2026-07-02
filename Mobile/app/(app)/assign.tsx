import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { apiRequest } from "@/lib/api";

interface AssignParams {
  shipmentId: string;
  clientName: string;
  merchandiseDescription: string;
  vesselName: string;
  blNumbers: string;
}

interface CreatePositionResult {
  id: number;
  areaId: number | null;
  zoneId: number | null;
  areaName: string | null;
  zoneName: string | null;
  isEmergencyPlacement: boolean;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: CreatePositionResult }
  | { status: "error"; message: string };

function accuracyColor(acc: number): string {
  if (acc <= 30) return "#10B981";
  if (acc <= 100) return "#F59E0B";
  return "#F87171";
}

export default function AssignScreen() {

  const params = useLocalSearchParams();
  const shipmentId = params.shipmentId as string
  const clientName = params.clientName as string
  const merchandiseDescription = params.merchandiseDescription as string
  const vesselName = params.vesselName as string
  const blNumbers: string[] = params.blNumbers
    ? JSON.parse(params.blNumbers as string)
    : []

  const [isCapturing, setIsCapturing] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const captureLocation = useCallback(async () => {
    setIsCapturing(true)
    setPermissionDenied(false)
    setGpsStatus('Acquiring GPS signal...')
    setLatitude(null)
    setLongitude(null)
    setAccuracy(null)

    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Location access is required to assign positions')
      setPermissionDenied(true)
      setIsCapturing(false)
      return
    }

    // Collect all readings into a plain array (no closure issues)
    const readings: Location.LocationObject[] = []

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => {
        readings.push(location)
        const acc = location.coords.accuracy ?? 999
        setGpsStatus(`Collecting... ±${acc.toFixed(0)}m`)
      }
    )

    // Collect readings for 8 seconds
    await new Promise<void>((resolve) => setTimeout(resolve, 8000))
    subscription.remove()

    if (readings.length === 0) {
      setGpsStatus(null)
      Alert.alert(
        'GPS Error',
        'Could not get location. Make sure GPS is enabled and try again outdoors.'
      )
      setIsCapturing(false)
      return
    }

    // Pick the reading with the best (lowest) accuracy value
    const best = readings.reduce((prev, curr) => {
      const prevAcc = prev.coords.accuracy ?? 999
      const currAcc = curr.coords.accuracy ?? 999
      return currAcc < prevAcc ? curr : prev
    })

    setLatitude(best.coords.latitude)
    setLongitude(best.coords.longitude)
    setAccuracy(best.coords.accuracy ?? null)
    setGpsStatus(`±${(best.coords.accuracy ?? 0).toFixed(0)}m accuracy`)
    setIsCapturing(false)
  }, [])

  useEffect(() => {
    void captureLocation();
  }, [captureLocation]);

  const handleSubmit = useCallback(async () => {
    console.log('Submit called with:', { latitude, longitude })

    if (latitude === null || longitude === null) {
      Alert.alert('Error', 'GPS location not captured yet')
      return
    }

    setSubmitState({ status: "submitting" });
    try {
      const result = await apiRequest<CreatePositionResult>("/positions/create", {
        method: "POST",
        body: JSON.stringify({
          shipmentId: Number(params.shipmentId),
          latitude,
          longitude,
          notes: notes.trim() || null,
        }),
      });
      setSubmitState({ status: "success", result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to assign position";
      setSubmitState({ status: "error", message });
    }
  }, [latitude, longitude, params.shipmentId, notes]);

  const handleDone = useCallback(() => {
    router.dismissAll();
    // One tick lets the navigation state settle after dismissAll before replace fires.
    setTimeout(() => {
      router.replace("/assignments");
    }, 50);
  }, []);

  if (submitState.status === "success") {
    const { result } = submitState;
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Position Assigned</Text>
        <Text style={styles.successSub}>
          {result.areaName && result.zoneName
            ? `Placed in ${result.areaName}, ${result.zoneName}`
            : result.areaName
              ? `Placed in ${result.areaName}`
              : result.zoneName
                ? `Placed in ${result.zoneName}`
                : "Placed outside mapped areas"}
        </Text>
        {result.isEmergencyPlacement && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="warning" size={14} color="#F59E0B" />
            <Text style={styles.emergencyText}>Emergency placement</Text>
          </View>
        )}
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done — View My Work</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Shipment Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SHIPMENT</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{params.clientName}</Text>
          <Text style={styles.cardSub}>{params.merchandiseDescription}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Vessel</Text>
            <Text style={styles.metaValue}>{params.vesselName}</Text>
          </View>
          {blNumbers.length > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>B/L</Text>
              <Text style={styles.metaValue}>{blNumbers.join(", ")}</Text>
            </View>
          )}
        </View>
      </View>

      {/* GPS Location */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>YOUR LOCATION</Text>
        <View style={styles.card}>
          {isCapturing ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator color="#0EA5E9" size="small" />
              <Text style={styles.locationLoadingText}>
                {gpsStatus ?? "Acquiring GPS signal..."}
              </Text>
            </View>
          ) : permissionDenied ? (
            <View style={styles.locationDenied}>
              <Ionicons name="location-outline" size={20} color="#F87171" />
              <Text style={styles.locationDeniedText}>Location access denied</Text>
              <Pressable style={styles.retryButton} onPress={captureLocation}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : latitude !== null && longitude !== null ? (
            <View style={styles.locationReady}>
              <Ionicons name="location" size={18} color="#10B981" />
              <View style={styles.locationCoords}>
                <Text style={styles.coordText}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </Text>
                {gpsStatus !== null && accuracy !== null && (
                  <Text style={[styles.accuracyText, { color: accuracyColor(accuracy) }]}>
                    {gpsStatus}
                  </Text>
                )}
              </View>
              <Pressable onPress={captureLocation}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.locationLoading}>
              <ActivityIndicator color="#0EA5E9" size="small" />
              <Text style={styles.locationLoadingText}>Acquiring GPS signal...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any notes about this placement…"
          placeholderTextColor="#475569"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical="top"
        />
      </View>

      {/* Error */}
      {submitState.status === "error" && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
          <Text style={styles.errorText}>{submitState.message}</Text>
        </View>
      )}

      {/* Submit */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          (isCapturing || latitude === null || submitState.status === "submitting") &&
          styles.submitButtonDisabled,
          pressed && styles.submitButtonPressed,
        ]}
        onPress={handleSubmit}
        disabled={isCapturing || latitude === null || submitState.status === "submitting"}
      >
        {submitState.status === "submitting" ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="pin" size={18} color="#FFFFFF" />
            <Text style={styles.submitText}>Confirm Assignment</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "600",
  },
  cardSub: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  metaLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
    width: 44,
    paddingTop: 1,
  },
  metaValue: {
    color: "#CBD5E1",
    fontSize: 12,
    flex: 1,
  },
  locationLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  locationLoadingText: {
    color: "#64748B",
    fontSize: 14,
  },
  locationDenied: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationDeniedText: {
    color: "#F87171",
    fontSize: 14,
    flex: 1,
  },
  locationReady: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationCoords: {
    flex: 1,
  },
  coordText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  accuracyText: {
    fontSize: 12,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  retryButton: {
    backgroundColor: "#1E3A5F",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  retryText: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "600",
  },
  notesInput: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#F1F5F9",
    fontSize: 14,
    padding: 14,
    minHeight: 90,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2D1A1A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7F1D1D",
    padding: 12,
  },
  errorText: {
    color: "#F87171",
    fontSize: 13,
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#1E3A4A",
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Success state
  successContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  successIcon: {
    marginBottom: 8,
  },
  successTitle: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "700",
  },
  successSub: {
    color: "#94A3B8",
    fontSize: 15,
    textAlign: "center",
  },
  emergencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2D1F00",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#78350F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  emergencyText: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "500",
  },
  doneButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
