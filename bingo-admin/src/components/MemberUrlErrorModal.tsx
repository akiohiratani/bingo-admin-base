import React from "react";

export type MemberUrlErrorModalProps = {
  message: string;
  onRetry: () => void;
  onClose: () => void;
};

const MemberUrlErrorModal: React.FC<MemberUrlErrorModalProps> = ({
  message,
  onRetry,
  onClose,
}) => {
  if (!message) return null;

  const lines = message.split("\n");

  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal__title">URL 取得エラー</h2>
        <p className="modal__body">
          {lines.map((line, index) => (
            <React.Fragment key={`${line}-${index}`}>
              {line}
              {index < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
        <div className="modal__footer">
          <button className="modal__action" type="button" onClick={onRetry}>
            もう一度
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

export default MemberUrlErrorModal;
