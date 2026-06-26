"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

import { useAuth } from "@/context/AuthContext";
import {
  getPositionsHubUrl,
  type PositionCreatedPayload,
  type PositionReleasedPayload,
} from "@/lib/map/signalr";

interface SignalRContextType {
  isConnected: boolean;
  onPositionCreated: (handler: (data: PositionCreatedPayload) => void) => () => void;
  onPositionReleased: (handler: (data: PositionReleasedPayload) => void) => () => void;
}

const SignalRContext = createContext<SignalRContextType | null>(null);

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const createdHandlersRef = useRef<Set<(data: PositionCreatedPayload) => void>>(new Set());
  const releasedHandlersRef = useRef<Set<(data: PositionReleasedPayload) => void>>(new Set());

  useEffect(() => {
    if (!accessToken) return;

    // PositionsHub still has no [Authorize] on the backend, and the "AllowAll"
    // CORS policy uses AllowAnyOrigin() without AllowCredentials() — a
    // credentialed negotiate request against a wildcard-origin policy is
    // rejected by the browser before it reaches the server. withCredentials:
    // false avoids that regardless of the accessTokenFactory below.
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(getPositionsHubUrl(), {
        transport: signalR.HttpTransportType.LongPolling,
        withCredentials: false,
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("PositionCreated", (data: PositionCreatedPayload) => {
      createdHandlersRef.current.forEach((handler) => handler(data));
    });

    connection.on("PositionReleased", (data: PositionReleasedPayload) => {
      releasedHandlersRef.current.forEach((handler) => handler(data));
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log("SignalR connected");
      })
      .catch((err) => console.error("SignalR failed:", err));

    connectionRef.current = connection;

    return () => {
      connectionRef.current = null;
      setIsConnected(false);
      connection.stop();
    };
  }, [accessToken]);

  // Stable identities across re-renders (e.g. when isConnected toggles) so
  // consumers depending on these in a useEffect array don't re-subscribe
  // on every provider render.
  const onPositionCreated = useCallback((handler: (data: PositionCreatedPayload) => void) => {
    createdHandlersRef.current.add(handler);
    return () => {
      createdHandlersRef.current.delete(handler);
    };
  }, []);

  const onPositionReleased = useCallback((handler: (data: PositionReleasedPayload) => void) => {
    releasedHandlersRef.current.add(handler);
    return () => {
      releasedHandlersRef.current.delete(handler);
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ isConnected, onPositionCreated, onPositionReleased }}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR(): SignalRContextType {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error("useSignalR must be used inside SignalRProvider");
  return ctx;
}
