import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/AuthContext";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1E293B" },
        headerTintColor: "#F8FAFC",
        contentStyle: { backgroundColor: "#0F172A" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="select-shipment"
        options={{ presentation: "modal", title: "Search Shipment" }}
      />
      <Stack.Screen
        name="assign"
        options={{ presentation: "modal", title: "Assign Position" }}
      />
    </Stack>
  );
}
