// App.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  DEFAULT_WIN_INDEX,
  sendRoundStart,
  setConfiguredWinIndex,
  useAdminSocket,
} from "./infrastructure/adminSocket";
import UserUrlService from "./infrastructure/UserUrlService";
import WelcomeModal from "./components/WelcomeModal";
import { useRuntimeConfig } from "./config/runtimeConfig";
import { buildMemberUrlWithRoomId, generateRoomId } from "./domain/roomId";
import DrawControls from "./components/DrawControls";
import QrModal from "./components/QrModal";
import ConnectionErrorModal from "./components/ConnectionErrorModal";
import SendingModal from "./components/SendingModal";

const App: React.FC = () => {
  // UI state management for the admin console
  const [lastWinIndex, setLastWinIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("接続前");
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [hasDisplayedQrModal, setHasDisplayedQrModal] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [memberBaseUrl, setMemberBaseUrl] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [winIndex, setWinIndex] = useState(DEFAULT_WIN_INDEX);

  const copyMessageTimer = useRef<number | null>(null);
  const sendingCooldownTimer = useRef<number | null>(null);
  const isWelcomeOpenRef = useRef(isWelcomeOpen);
  const hasDisplayedQrModalRef = useRef(hasDisplayedQrModal);
  const runtimeConfig = useRuntimeConfig();

  const memberUrl = useMemo(() => {
    if (!memberBaseUrl) {
      return "";
    }

    if (!roomId) {
      return memberBaseUrl;
    }

    return buildMemberUrlWithRoomId(memberBaseUrl, roomId);
  }, [memberBaseUrl, roomId]);

  const memberQrCodeUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
        `https://${memberUrl}`
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
      if (sendingCooldownTimer.current) {
        window.clearTimeout(sendingCooldownTimer.current);
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

    if (sendingCooldownTimer.current) {
      window.clearTimeout(sendingCooldownTimer.current);
    }

    try {
      setIsSending(true);
      sendingCooldownTimer.current = window.setTimeout(() => {
        setIsSending(false);
        sendingCooldownTimer.current = null;
      }, 10000);
      sendRoundStart(socket, winIndex, roomId, {
        websocketSecret: runtimeConfig.websocketSecret,
        websocketUrl: runtimeConfig.websocketUrl,
      });
      setLastWinIndex(winIndex);
      setStatusMessage(`winIndex=${winIndex} を配信しました`);
    } catch (err) {
      console.error("送信エラー:", err);
      setStatusMessage("メッセージ送信中にエラーが発生しました");
    }
  };

  const handleWinIndexChange = (nextWinIndex: number) => {
    setWinIndex(nextWinIndex);
    setConfiguredWinIndex(nextWinIndex);
  };

  const handleWelcomeClose = () => {
    setIsWelcomeOpen(false);
  };

  const handleWelcomeConnected = (userId: string) => {
    const newRoomId = generateRoomId();
    setAuthenticatedUserId(userId);
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

  const handleConnectionErrorClose = () => {
    setConnectionError(null);
  };

  const isDrawButtonDisabled = !isConnected || !roomId || isSending;

  useEffect(() => {
    let isMounted = true;

    const fetchMemberUrl = async () => {
      if (!authenticatedUserId) {
        setMemberBaseUrl(null);
        return;
      }

      try {
        const userUrlService = UserUrlService.getInstance();
        const fetchedMemberUrl = await userUrlService.getUrl(
          authenticatedUserId,
          runtimeConfig.memberUrlApiKey,
          runtimeConfig.memberUrlApi
        );

        if (isMounted) {
          setMemberBaseUrl(fetchedMemberUrl);
        }
      } catch (error) {
        console.error("共有用URLの取得に失敗しました", error);
        if (isMounted) {
          setMemberBaseUrl(null);
        }
      }
    };

    fetchMemberUrl();

    return () => {
      isMounted = false;
    };
  }, [authenticatedUserId, runtimeConfig.memberUrlApi, runtimeConfig.memberUrlApiKey]);

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
    if (!isConnected || !memberUrl) return;
    setIsQrModalOpen(true);
  };

  const handleCopyMemberLink = async () => {
    if (copyMessageTimer.current) {
      window.clearTimeout(copyMessageTimer.current);
    }

    if (!memberUrl) {
      setCopyMessage("共有用URLの取得中です。しばらくお待ちください。");
      copyMessageTimer.current = window.setTimeout(() => {
        setCopyMessage(null);
      }, 3000);
      return;
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
        <QrModal
          isOpen={isQrModalOpen}
          memberQrCodeUrl={memberQrCodeUrl}
          memberUrl={memberUrl}
          copyMessage={copyMessage}
          onCopyMemberLink={handleCopyMemberLink}
          onClose={handleQrModalClose}
        />
      )}

      {isWelcomeOpen && (
        <WelcomeModal
          isOpen={isWelcomeOpen}
          onClose={handleWelcomeClose}
          onConnected={handleWelcomeConnected}
        />
      )}

      {connectionError && (
        <ConnectionErrorModal
          message={connectionError}
          onRetry={handleRetryConnection}
          onClose={handleConnectionErrorClose}
        />
      )}

      <div className="floating-actions" aria-live="polite">
        <button
          className="qr-open-button"
          type="button"
          onClick={handleQrModalOpen}
          disabled={!isConnected || !memberUrl}
        >
          参加用QRコードを表示
        </button>
      </div>

      <SendingModal isOpen={isSending} />
    </div>
  );
};

export default App;
