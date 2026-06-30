import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import { AuthProvider } from "@/context/AuthContext";
import { SignalRProvider } from "@/context/SignalRContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SignalRProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SignalRProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
