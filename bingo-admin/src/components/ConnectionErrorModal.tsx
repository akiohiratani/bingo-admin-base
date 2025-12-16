import React from "react";

export type ConnectionErrorModalProps = {
  message: string;
  onRetry: () => void;
  onClose: () => void;
};

const ConnectionErrorModal: React.FC<ConnectionErrorModalProps> = ({
  message,
  onRetry,
  onClose,
}) => {
  if (!message) return null;

  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal__title">接続エラー</h2>
        <p className="modal__body">{message}</p>
        <div className="modal__footer">
          <button className="modal__action" type="button" onClick={onRetry}>
            再接続する
          </button>
          <button
            className="modal__action modal__action--secondary"
            type="button"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionErrorModal;
