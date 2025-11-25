// Infrastructure layer for admin WebSocket communication
// Handles connection lifecycle and message formatting for external API.
import { useEffect, useState } from "react";

const WS_URL =
  "wss://kkblt3dovh.execute-api.ap-northeast-1.amazonaws.com/AkioHiratani?role=admin";
const SECRET = "20251124AkioHiratani";

export type RoundStartMessage = {
  action: "roundStart";
  secret: string;
  winIndex: number;
};

// Build message payload to start a new round.
export const buildRoundStartMessage = (winIndex: number): RoundStartMessage => ({
  action: "roundStart",
  secret: SECRET,
  winIndex,
});

export type UseAdminSocketResult = {
  socket: WebSocket | null;
  isConnected: boolean;
};

// Manage WebSocket connection lifecycle for the admin client.
export const useAdminSocket = (
  isReady: boolean,
  onStatusChange: (message: string) => void,
  onMessage?: (event: MessageEvent) => void
): UseAdminSocketResult => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const ws = new WebSocket(WS_URL);

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
  }, [isReady, onMessage, onStatusChange]);

  return { socket, isConnected };
};

// Send the round start message through an open WebSocket connection.
export const sendRoundStart = (socket: WebSocket, winIndex: number) => {
  const payload = buildRoundStartMessage(winIndex);
  socket.send(JSON.stringify(payload));
};
