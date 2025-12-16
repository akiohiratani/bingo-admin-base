// App.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  DEFAULT_WIN_INDEX,
  sendRoundStart,
  setConfiguredWinIndex,
  useAdminSocket,
} from "./infrastructure/adminSocket";
import WelcomeModal from "./components/WelcomeModal";
import { useRuntimeConfig } from "./config/runtimeConfig";
import { buildMemberUrlWithRoomId, generateRoomId } from "./domain/roomId";
import DrawControls from "./components/DrawControls";

const App: React.FC = () => {
  // UI state management for the admin console
  const [lastWinIndex, setLastWinIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("接続前");
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [hasDisplayedQrModal, setHasDisplayedQrModal] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [winIndex, setWinIndex] = useState(DEFAULT_WIN_INDEX);

  const copyMessageTimer = useRef<number | null>(null);
  const isWelcomeOpenRef = useRef(isWelcomeOpen);
  const hasDisplayedQrModalRef = useRef(hasDisplayedQrModal);
  const runtimeConfig = useRuntimeConfig();

  const memberUrl = useMemo(() => {
    if (!roomId) {
      return runtimeConfig.memberUrl;
    }

    return buildMemberUrlWithRoomId(runtimeConfig.memberUrl, roomId);
  }, [roomId, runtimeConfig.memberUrl]);

  const memberQrCodeUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
        memberUrl
      )}`,
    [memberUrl]
  );

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
      if (copyMessageTimer.current) {
        window.clearTimeout(copyMessageTimer.current);
      }
    };
  }, []);

  //抽選ボタン押下時
  const handleDraw = () => {
    if (isSending) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setStatusMessage("WebSocket 未接続のため送信できません");
      return;
    }

    if (!roomId) {
      setStatusMessage("ルームIDが生成されていません");
      return;
    }

    try {
      setIsSending(true);
      sendRoundStart(socket, winIndex, roomId, {
        websocketSecret: runtimeConfig.websocketSecret,
        websocketUrl: runtimeConfig.websocketUrl,
      });
      setLastWinIndex(winIndex);
      setStatusMessage(`winIndex=${winIndex} を配信しました`);
    } catch (err) {
      console.error("送信エラー:", err);
      setStatusMessage("メッセージ送信中にエラーが発生しました");
    } finally {
      setIsSending(false);
    }
  };

  const handleWinIndexChange = (nextWinIndex: number) => {
    setWinIndex(nextWinIndex);
    setConfiguredWinIndex(nextWinIndex);
  };

  const handleWelcomeClose = () => {
    setIsWelcomeOpen(false);
  };

  const handleWelcomeConnected = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsWelcomeOpen(false);
    setIsReady(true);
    setStatusMessage("接続中...");
  };

  const handleRetryConnection = () => {
    setConnectionError(null);
    setStatusMessage("再接続中...");
    retryConnection();
  };

  const isDrawButtonDisabled = !isConnected || !roomId || isSending;

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
        {`接続状態: ${isConnected ? "接続中" : "未接続"} / ${statusMessage}. 最後に配信した番号 ${
          lastWinIndex ?? "なし"
        }。`}
      </div>

      <div className="draw-panel">
        <DrawControls
          onDraw={handleDraw}
          isDrawButtonDisabled={isDrawButtonDisabled}
          winIndex={winIndex}
          onWinIndexChange={handleWinIndexChange}
        />
      </div>

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
