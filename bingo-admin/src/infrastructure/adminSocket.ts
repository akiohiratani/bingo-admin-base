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
  roomId: string;
  winIndex: number;
};

// The default value broadcast at the start of each round. Kept in the infrastructure layer.
export const DEFAULT_WIN_INDEX = 20;
let configuredWinIndex = DEFAULT_WIN_INDEX;

export const setConfiguredWinIndex = (value: number) => {
  configuredWinIndex = value;
};

export const getConfiguredWinIndex = () => configuredWinIndex;

// Build message payload to start a new round.
export const buildRoundStartMessage = (
  winIndex: number,
  roomId: string,
  { websocketSecret }: AdminSocketConfig
): RoundStartMessage => ({
  action: "roundStart",
  secret: websocketSecret,
  roomId,
  winIndex,
});

export type UseAdminSocketResult = {
  socket: WebSocket | null;
  isConnected: boolean;
  retryConnection: () => void;
};

// Manage WebSocket connection lifecycle for the admin client.
export const useAdminSocket = (
  isReady: boolean,
  config: AdminSocketConfig,
  onStatusChange: (message: string) => void,
  onMessage?: (event: MessageEvent) => void,
  onConnectionError?: (message: string) => void
): UseAdminSocketResult => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  const retryConnection = () => {
    if (socket) {
      socket.close();
    }
    setConnectionAttempt((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isReady) return;

    const ws = new WebSocket(config.websocketUrl);

    ws.onopen = () => {
      setIsConnected(true);
      onStatusChange("WebSocket 接続済み");
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      onStatusChange("WebSocket 切断");
      if (!event.wasClean) {
        onConnectionError?.("WebSocket が予期せず切断されました。再接続を実行してください。");
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
      onStatusChange("WebSocket エラーが発生しました");
      onConnectionError?.("WebSocket 接続に失敗しました。再度接続を試してください。");
    };

    ws.onmessage = (event) => {
      if (onMessage) {
        onMessage(event);
      }
      console.log("受信:", event.data);
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(ws);
    return () => ws.close();
  }, [config.websocketUrl, isReady, onConnectionError, onMessage, onStatusChange, connectionAttempt]);

  return { socket, isConnected, retryConnection };
};

// Send the round start message through an open WebSocket connection.
export const sendRoundStart = (
  socket: WebSocket,
  winIndex: number,
  roomId: string,
  config: AdminSocketConfig
) => {
  const payload = buildRoundStartMessage(winIndex, roomId, config);
  socket.send(JSON.stringify(payload));
};
