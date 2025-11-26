// Infrastructure layer for admin WebSocket communication
// Handles connection lifecycle and message formatting for external API.
import { useEffect, useState } from "react";

export type AdminSocketConfig = {
  websocketUrl: string;
  websocketSecret: string;
};

export type RoundStartMessage = {
  action: "roundStart";
  secret: string;
  winIndex: number;
};

// Build message payload to start a new round.
export const buildRoundStartMessage = (
  winIndex: number,
  { websocketSecret }: AdminSocketConfig
): RoundStartMessage => ({
  action: "roundStart",
  secret: websocketSecret,
  winIndex,
});

export type UseAdminSocketResult = {
  socket: WebSocket | null;
  isConnected: boolean;
};

// Manage WebSocket connection lifecycle for the admin client.
export const useAdminSocket = (
  isReady: boolean,
  config: AdminSocketConfig,
  onStatusChange: (message: string) => void,
  onMessage?: (event: MessageEvent) => void
): UseAdminSocketResult => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const ws = new WebSocket(config.websocketUrl);

    ws.onopen = () => {
      setIsConnected(true);
      onStatusChange("WebSocket 接続済み");
    };

    ws.onclose = () => {
      setIsConnected(false);
      onStatusChange("WebSocket 切断");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
      onStatusChange("WebSocket エラーが発生しました");
    };

    ws.onmessage = (event) => {
      if (onMessage) {
        onMessage(event);
      }
      console.log("受信:", event.data);
    };

    setSocket(ws);
    return () => ws.close();
  }, [config.websocketUrl, isReady, onMessage, onStatusChange]);

  return { socket, isConnected };
};

// Send the round start message through an open WebSocket connection.
export const sendRoundStart = (
  socket: WebSocket,
  winIndex: number,
  config: AdminSocketConfig
) => {
  const payload = buildRoundStartMessage(winIndex, config);
  socket.send(JSON.stringify(payload));
};
