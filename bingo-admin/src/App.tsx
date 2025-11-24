// App.tsx
import React, { useEffect, useState } from "react";

const WS_URL =
  "wss://kkblt3dovh.execute-api.ap-northeast-1.amazonaws.com/AkioHiratani?role=admin";
const SECRET = "20251124AkioHiratani";
const MAX_INDEX = 18;

type RoundStartMessage = {
  action: "roundStart";
  secret: string;
  winIndex: number;
};

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [lastWinIndex, setLastWinIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("接続中...");

  // WebSocket接続
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      setStatusMessage("WebSocket 接続済み");
    };

    ws.onclose = () => {
      setIsConnected(false);
      setStatusMessage("WebSocket 切断");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setIsConnected(false);
      setStatusMessage("WebSocket エラーが発生しました");
    };

    ws.onmessage = (event) => {
      console.log("受信:", event.data);
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  // まだ抽選されていない数字をランダムに選択
  const getNextRandomIndex = (): number | null => {
    const remaining = Array.from(
      { length: MAX_INDEX },
      (_, i) => i + 1
    ).filter((n) => !drawnNumbers.includes(n));

    if (remaining.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * remaining.length);
    return remaining[randomIndex];
  };

  // 抽選ボタン押下時
  const handleDraw = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatusMessage("WebSocket 未接続のため送信できません");
      return;
    }

    const winIndex = getNextRandomIndex();
    if (winIndex === null) {
      setStatusMessage("すべての数字が抽選済みです");
      return;
    }

    const message: RoundStartMessage = {
      action: "roundStart",
      secret: SECRET,
      winIndex,
    };

    try {
      socket.send(JSON.stringify(message));
      setDrawnNumbers((prev) => [...prev, winIndex]);
      setLastWinIndex(winIndex);
      setStatusMessage(`winIndex=${winIndex} を配信しました`);
    } catch (err) {
      console.error("送信エラー:", err);
      setStatusMessage("メッセージ送信中にエラーが発生しました");
    }
  };

  const remaining = MAX_INDEX - drawnNumbers.length;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🎯 ビンゴ開催者画面</h1>

      <p>
        状態：
        <strong style={{ color: isConnected ? "green" : "red" }}>
          {isConnected ? "接続中" : "未接続"}
        </strong>
      </p>
      <p>{statusMessage}</p>

      <button
        onClick={handleDraw}
        disabled={!isConnected || remaining === 0}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor:
            !isConnected || remaining === 0 ? "not-allowed" : "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 6,
        }}
      >
        抽選する（winIndex送信）
      </button>

      <div style={{ marginTop: 20 }}>
        <p>
          残り抽選可能数：<strong>{remaining}</strong> / {MAX_INDEX}
        </p>
        <p>
          最後に配信した番号：<strong>{lastWinIndex ?? "なし"}</strong>
        </p>
        <p>
          抽選済み：
          {drawnNumbers.length > 0 ? drawnNumbers.join(", ") : "未抽選"}
        </p>
      </div>
    </div>
  );
};

export default App;
