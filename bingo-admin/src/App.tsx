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
import { useRuntimeConfig } from "./config/runtimeConfig";

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
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [drawModalState, setDrawModalState] = useState<DrawModalState>({
    isOpen: false,
    isWaiting: false,
    winIndex: null,
  });
  const [historyResendModal, setHistoryResendModal] = useState({
    isOpen: false,
    isWaiting: false,
    winIndex: null as number | null,
  });
  const drawDelayTimer = useRef<number | null>(null);
  const copyMessageTimer = useRef<number | null>(null);
  const historyResendTimer = useRef<number | null>(null);
  const isWelcomeOpenRef = useRef(isWelcomeOpen);
  const hasDisplayedQrModalRef = useRef(hasDisplayedQrModal);
  const runtimeConfig = useRuntimeConfig();
  const memberUrl = runtimeConfig.memberUrl;
  const memberQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${memberUrl}`;
  // Memoized callback so socket hook does not recreate the connection unnecessarily.
  const handleStatusChange = useCallback((message: string) => {
    setStatusMessage(message);
    if (message === "WebSocket 接続済み") {
      setConnectionError(null);
      if (!isWelcomeOpenRef.current && !hasDisplayedQrModalRef.current) {
        setIsQrModalOpen(true);
        setHasDisplayedQrModal(true);
        hasDisplayedQrModalRef.current = true;
      }
    }
  }, []);

  const handleConnectionError = useCallback((message: string) => {
    setConnectionError(message);
  }, []);

  // Infrastructure layer: WebSocket connection lifecycle
  const { socket, isConnected, retryConnection } = useAdminSocket(
    isReady,
    {
      websocketSecret: runtimeConfig.websocketSecret,
      websocketUrl: runtimeConfig.websocketUrl,
    },
    handleStatusChange,
    undefined,
    handleConnectionError
  );

  useEffect(() => {
    return () => {
      if (drawDelayTimer.current) {
        window.clearTimeout(drawDelayTimer.current);
      }

      if (copyMessageTimer.current) {
        window.clearTimeout(copyMessageTimer.current);
      }

      if (historyResendTimer.current) {
        window.clearTimeout(historyResendTimer.current);
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
      sendRoundStart(socket, winIndex, {
        websocketSecret: runtimeConfig.websocketSecret,
        websocketUrl: runtimeConfig.websocketUrl,
      });
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

  const handleRetryConnection = () => {
    setConnectionError(null);
    setStatusMessage("再接続中...");
    retryConnection();
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
    isWelcomeOpenRef.current = isWelcomeOpen;
  }, [isWelcomeOpen]);

  useEffect(() => {
    hasDisplayedQrModalRef.current = hasDisplayedQrModal;
  }, [hasDisplayedQrModal]);

  const handleQrModalClose = () => {
    if (copyMessageTimer.current) {
      window.clearTimeout(copyMessageTimer.current);
    }

    setCopyMessage(null);
    setIsQrModalOpen(false);
  };

  const handleQrModalOpen = () => {
    if (!isConnected) return;
    setIsQrModalOpen(true);
  };

  const handleHistoryOpen = () => {
    if (!isConnected) return;
    setIsHistoryOpen(true);
  };

  const handleHistoryClose = () => {
    setIsHistoryOpen(false);
  };

  const handleHistoryItemClick = (winIndex: number) => {
    setHistoryResendModal({ isOpen: true, isWaiting: false, winIndex });
  };

  const handleHistoryResendClose = () => {
    if (historyResendTimer.current) {
      window.clearTimeout(historyResendTimer.current);
    }
    setHistoryResendModal({ isOpen: false, isWaiting: false, winIndex: null });
  };

  const handleHistoryResendConfirm = () => {
    if (historyResendTimer.current) {
      window.clearTimeout(historyResendTimer.current);
    }

    if (historyResendModal.winIndex === null) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatusMessage("WebSocket 未接続のため送信できません");
      return;
    }

    const winIndex = historyResendModal.winIndex;

    try {
      sendRoundStart(socket, winIndex, {
        websocketSecret: runtimeConfig.websocketSecret,
        websocketUrl: runtimeConfig.websocketUrl,
      });
      setStatusMessage(`winIndex=${winIndex} を再送信しました`);
      setHistoryResendModal({ isOpen: true, isWaiting: true, winIndex });
      historyResendTimer.current = window.setTimeout(() => {
        setHistoryResendModal({ isOpen: false, isWaiting: false, winIndex: null });
        historyResendTimer.current = null;
      }, 10000);
    } catch (err) {
      console.error("送信エラー:", err);
      setStatusMessage("メッセージ送信中にエラーが発生しました");
    }
  };

  const handleCopyMemberLink = async () => {
    if (copyMessageTimer.current) {
      window.clearTimeout(copyMessageTimer.current);
    }

    try {
      await navigator.clipboard.writeText(memberUrl);
      setCopyMessage("リンクをコピーしました");
    } catch (error) {
      console.error("コピーに失敗しました", error);
      setCopyMessage("コピーに失敗しました。URLを手動でコピーしてください。");
    }

    copyMessageTimer.current = window.setTimeout(() => {
      setCopyMessage(null);
    }, 3000);
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
                src={memberQrCodeUrl}
                alt="ビンゴ参加用QRコード"
                className="qr-modal__image"
              />
              <figcaption className="sr-only">リンク先: {memberUrl}</figcaption>
            </figure>
            <div className="modal__footer">
              <button className="modal__action" onClick={handleCopyMemberLink} type="button">
                リンクをコピー
              </button>
              <button className="modal__action modal__action--secondary" onClick={handleQrModalClose}>
                閉じる
              </button>
            </div>
            {copyMessage && (
              <p className="qr-modal__copy-feedback" role="status" aria-live="polite">
                {copyMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="抽選履歴">
          <div className="modal history-modal">
            <button
              className="modal__close"
              type="button"
              aria-label="履歴ダイアログを閉じる"
              onClick={handleHistoryClose}
            >
              ×
            </button>
            <h2 className="modal__title">抽選履歴</h2>
            <p className="modal__body">これまでに抽選で選ばれた図柄を確認できます。</p>
            {drawnNumbers.length === 0 ? (
              <p className="modal__body">まだ抽選結果がありません。</p>
            ) : (
              <div className="history-grid" role="list">
                {drawnNumbers.map((number, index) => (
                  <button
                    className="history-item"
                    role="listitem"
                    type="button"
                    key={`${number}-${index}`}
                    onClick={() => handleHistoryItemClick(number)}
                    aria-label={`図柄 ${number} を再送信する`}
                  >
                    <img
                      src={`/symbols/${number}.png`}
                      alt={`選ばれた図柄 ${number}`}
                      className="history-item__image"
                    />
                    <span className="sr-only">選ばれた図柄 {number}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {historyResendModal.isOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="再送信の確認">
          <div className="modal history-resend-modal">
            <button
              className="modal__close"
              type="button"
              aria-label="再送信確認ダイアログを閉じる"
              onClick={handleHistoryResendClose}
            >
              ×
            </button>
            {historyResendModal.isWaiting ? (
              <div className="draw-modal__spinner-wrapper">
                <div className="spinner" aria-hidden />
                <p className="modal__body draw-modal__message">再送信しています...</p>
              </div>
            ) : (
              <>
                <h2 className="modal__title">再送信の確認</h2>
                {historyResendModal.winIndex !== null && (
                  <figure className="history-resend-modal__figure">
                    <img
                      src={`/symbols/${historyResendModal.winIndex}.png`}
                      alt={`再送信する図柄 ${historyResendModal.winIndex}`}
                      className="history-resend-modal__image"
                    />
                  </figure>
                )}
                <p className="modal__body">再度送信しますか？</p>
                <div className="modal__footer">
                  <button className="modal__action" type="button" onClick={handleHistoryResendConfirm}>
                    はい
                  </button>
                  <button
                    className="modal__action modal__action--secondary"
                    type="button"
                    onClick={handleHistoryResendClose}
                  >
                    いいえ
                  </button>
                </div>
              </>
            )}
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

      {connectionError && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal">
            <h2 className="modal__title">接続エラー</h2>
            <p className="modal__body">{connectionError}</p>
            <div className="modal__footer">
              <button className="modal__action" type="button" onClick={handleRetryConnection}>
                再接続する
              </button>
              <button
                className="modal__action modal__action--secondary"
                type="button"
                onClick={() => setConnectionError(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="floating-actions" aria-live="polite">
        <button
          className="history-open-button"
          type="button"
          onClick={handleHistoryOpen}
          disabled={!isConnected}
        >
          履歴確認
        </button>
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
