"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection with explicit URL to ensure correct connection
    const socketInstance = io(window.location.origin, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000, // Increased timeout
      transports: ['websocket', 'polling'] // Try both transports
    });

    console.log("Initializing socket connection...");

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected with ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setIsConnected(false);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    socketInstance.on("reconnect_error", (err) => {
      console.error("Socket reconnection error:", err.message);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("Socket failed to reconnect after maximum attempts");
    });

    // Ping/pong to keep connection alive
    const interval = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit("ping");
      }
    }, 25000);

    // Save the socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket connection");
      clearInterval(interval);
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}