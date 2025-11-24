// App.tsx
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const WS_URL =
  "wss://kkblt3dovh.execute-api.ap-northeast-1.amazonaws.com/AkioHiratani?role=admin";
const SECRET = "20251124AkioHiratani";
const MAX_INDEX = 18;

type RoundStartMessage = {
  action: "roundStart";
  secret: string;
  winIndex: number;
};

type DrawModalState = {
  isOpen: boolean;
  isWaiting: boolean;
  winIndex: number | null;
};

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [lastWinIndex, setLastWinIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("接続前");
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [drawModalState, setDrawModalState] = useState<DrawModalState>({
    isOpen: false,
    isWaiting: false,
    winIndex: null,
  });
  const drawDelayTimer = useRef<number | null>(null);

  // WebSocket接続
  useEffect(() => {
    if (!isReady) return;

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
  }, [isReady]);

  useEffect(
    () => () => {
      if (drawDelayTimer.current) {
        window.clearTimeout(drawDelayTimer.current);
      }
    },
    []
  );

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
    if (drawModalState.isOpen) return;

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
      setDrawModalState({ isOpen: true, isWaiting: true, winIndex });
      drawDelayTimer.current = window.setTimeout(() => {
        setDrawModalState({ isOpen: true, isWaiting: false, winIndex });
      }, 10000);
    } catch (err) {
      console.error("送信エラー:", err);
      setStatusMessage("メッセージ送信中にエラーが発生しました");
    }
  };

  const remaining = MAX_INDEX - drawnNumbers.length;

  const handleWelcomeClose = () => {
    setIsWelcomeOpen(false);
    setIsReady(true);
    setStatusMessage("接続中...");
  };

  const handleDrawModalClose = () => {
    if (drawDelayTimer.current) {
      window.clearTimeout(drawDelayTimer.current);
    }
    setDrawModalState({ isOpen: false, isWaiting: false, winIndex: null });
  };

  const isDrawButtonDisabled =
    !isConnected || remaining === 0 || drawModalState.isOpen;

  return (
    <div className="app">
      <div className="sr-only" aria-live="polite">
        {`接続状態: ${isConnected ? "接続中" : "未接続"} / ${statusMessage}. 残り抽選可能数 ${remaining}。最後に配信した番号 ${lastWinIndex ?? "なし"}。`}
      </div>

      <div className="draw-panel">
        <div className="remaining-counter" aria-live="polite">
          残り {remaining} / {MAX_INDEX}
        </div>
        <button
          className="draw-button"
          onClick={handleDraw}
          disabled={isDrawButtonDisabled}
        >
          抽選開始
        </button>
      </div>

      {drawModalState.isOpen && (
        <div
          className="draw-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={drawModalState.isWaiting ? "抽選中" : "抽選結果"}
        >
          <div className="modal draw-modal">
            {drawModalState.isWaiting ? (
              <div className="draw-modal__spinner-wrapper">
                <div className="spinner" aria-hidden />
                <p className="modal__body draw-modal__message">
                  抽選結果を送信しています...
                </p>
              </div>
            ) : (
              <>
                <h2 className="modal__title">抽選結果</h2>
                <p className="modal__body">
                  送信した番号: {drawModalState.winIndex}
                </p>
                <button className="modal__action" onClick={handleDrawModalClose}>
                  閉じる
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isWelcomeOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="modal__title">Welcome</h2>
            <p className="modal__body">
              抽選を開始する前に接続を準備してください。モーダルを閉じると自動で接続が開始されます。
            </p>
            <button className="modal__action" onClick={handleWelcomeClose}>
              はじめる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
