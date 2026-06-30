import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import { apiRequest } from "@/lib/api";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest<void>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, role: "Tallyman" }),
      });
      router.replace("/(auth)/login");
    } catch {
      setError("Could not create account — check your details and try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>CargoPin</Text>
        <Text style={styles.subtitle}>Port Cargo Positioning</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing]}
          placeholder="Email"
          placeholderTextColor="#64748B"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, styles.inputSpacing]}
          placeholder="Password"
          placeholderTextColor="#64748B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, styles.buttonSpacing]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: "#0EA5E9",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    borderWidth: 1,
    color: "#F8FAFC",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
  },
  inputSpacing: {
    marginTop: 12,
  },
  error: {
    color: "#F87171",
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#0EA5E9",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonSpacing: {
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  link: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
});
