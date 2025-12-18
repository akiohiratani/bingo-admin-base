import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export type QrModalProps = {
  isOpen: boolean;
  memberQrCodeUrl: string;
  memberUrl: string;
  copyMessage: string | null;
  onCopyMemberLink: () => void;
  onClose: () => void;
};

const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  memberQrCodeUrl,
  memberUrl,
  copyMessage,
  onCopyMemberLink,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop qr-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="参加者用QRコード"
    >
      <div className="modal qr-modal">
        <p className="modal__body">
          このQRコードから参加者はビンゴゲームに参加できます。お手持ちの端末で読み取ってブラウザでアクセスしてください。
        </p>
        <figure className="qr-modal__figure">
          <QRCodeCanvas
            value={memberQrCodeUrl}
            size={240}
            includeMargin={true}
            level="M"
          />
          <figcaption className="sr-only">リンク先: {memberUrl}</figcaption>
        </figure>
        <div className="modal__footer">
          <button className="modal__action" onClick={onCopyMemberLink} type="button">
            リンクをコピー
          </button>
          <button className="modal__action modal__action--secondary" onClick={onClose} type="button">
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
  );
};

export default QrModal;
