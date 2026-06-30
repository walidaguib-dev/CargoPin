import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#0EA5E9" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
});
