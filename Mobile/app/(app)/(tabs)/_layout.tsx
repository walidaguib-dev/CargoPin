import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import FloatingActionButton from "@/components/FloatingActionButton";

export default function TabsLayout() {
  console.log("hello")
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#0EA5E9",
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: {
            backgroundColor: "#1E293B",
            borderTopColor: "#334155",
          },
          headerStyle: { backgroundColor: "#1E293B" },
          headerTintColor: "#F8FAFC",
        }}
      >
        <Tabs.Screen
          name="nearby"
          options={{
            title: "Nearby",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="shipments"
          options={{
            title: "Shipments",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="assignments"
          options={{
            title: "My Work",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
