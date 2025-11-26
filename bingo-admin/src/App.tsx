// App.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import {
  calculateRemainingCount,
  MAX_INDEX,
  pickNextNumber,
} from "./domain/drawLogic";
import { sendRoundStart, useAdminSocket } from "./infrastructure/adminSocket";
import WelcomeModal from "./components/WelcomeModal";

type DrawModalState = {
  isOpen: boolean;
  isWaiting: boolean;
  winIndex: number | null;
};

const App: React.FC = () => {
  // UI state management for the admin console
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [lastWinIndex, setLastWinIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("接続前");
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [hasDisplayedQrModal, setHasDisplayedQrModal] = useState(false);
  const [drawModalState, setDrawModalState] = useState<DrawModalState>({
    isOpen: false,
    isWaiting: false,
    winIndex: null,
  });
  const drawDelayTimer = useRef<number | null>(null);

  // Memoized callback so socket hook does not recreate the connection unnecessarily.
  const handleStatusChange = useCallback((message: string) => {
    setStatusMessage(message);
  }, []);

  // Infrastructure layer: WebSocket connection lifecycle
  const { socket, isConnected } = useAdminSocket(
    isReady,
    handleStatusChange
  );

  useEffect(() => {
    return () => {
      if (drawDelayTimer.current) {
        window.clearTimeout(drawDelayTimer.current);
      }
    };
  }, []);

  //抽選ボタン押下時
  const handleDraw = () => {
    if (drawModalState.isOpen) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatusMessage("WebSocket 未接続のため送信できません");
      return;
    }

    const winIndex = pickNextNumber(drawnNumbers);
    if (winIndex === null) {
      setStatusMessage("すべての数字が抽選済みです");
      return;
    }

    try {
      sendRoundStart(socket, winIndex);
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

  const remaining = calculateRemainingCount(drawnNumbers);

  const handleWelcomeClose = () => {
    setIsWelcomeOpen(false);
  };

  const handleWelcomeConnected = () => {
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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "このページを離れると接続が切断されます。続行しますか？";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!isWelcomeOpen && isConnected && !hasDisplayedQrModal) {
      setIsQrModalOpen(true);
      setHasDisplayedQrModal(true);
    }
  }, [hasDisplayedQrModal, isConnected, isWelcomeOpen]);

  const handleQrModalClose = () => {
    setIsQrModalOpen(false);
  };

  const handleQrModalOpen = () => {
    if (!isConnected) return;
    setIsQrModalOpen(true);
  };

  return (
    <div className="app">
      <div className="sr-only" aria-live="polite">
        {`接続状態: ${isConnected ? "接続中" : "未接続"} / ${statusMessage}. 残り抽選可能数 ${remaining}。最後に配信した番号 ${
          lastWinIndex ?? "なし"
        }。`}
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
                <figure className="draw-modal__result">
                  {drawModalState.winIndex !== null && (
                    <img
                      src={`/symbols/${drawModalState.winIndex}.png`}
                      alt={`送信した番号 ${drawModalState.winIndex}`}
                      className="draw-modal__image"
                    />
                  )}
                  <figcaption className="sr-only">
                    送信した番号: {drawModalState.winIndex}
                  </figcaption>
                </figure>
                <button className="modal__action" onClick={handleDrawModalClose}>
                  閉じる
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isQrModalOpen && (
        <div
          className="modal-backdrop qr-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="参加者用QRコード"
        >
          <div className="modal qr-modal">
            <h2 className="modal__title">参加用QRコード</h2>
            <p className="modal__body">
              このQRコードから参加者はビンゴゲームに参加できます。お手持ちの端末で読み取ってブラウザでアクセスしてください。
            </p>
            <figure className="qr-modal__figure">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=d3tb65evuppolf.cloudfront.net"
                alt="ビンゴ参加用QRコード"
                className="qr-modal__image"
              />
              <figcaption className="sr-only">リンク先: http://localhost:5173/</figcaption>
            </figure>
            <div className="modal__footer">
              <button className="modal__action modal__action--secondary" onClick={handleQrModalClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {isWelcomeOpen && (
        <WelcomeModal
          isOpen={isWelcomeOpen}
          onClose={handleWelcomeClose}
          onConnected={handleWelcomeConnected}
        />
      )}

      <div className="floating-actions" aria-live="polite">
        <button
          className="qr-open-button"
          type="button"
          onClick={handleQrModalOpen}
          disabled={!isConnected}
        >
          参加用QRコードを表示
        </button>
      </div>
    </div>
  );
};

export default App;
