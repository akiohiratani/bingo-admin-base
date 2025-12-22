import React from "react";

export type FloatingActionsProps = {
  onOpenQr: () => void;
  onOpenUpdate: () => void;
  isQrButtonDisabled: boolean;
};

const FloatingActions: React.FC<FloatingActionsProps> = ({
  onOpenQr,
  onOpenUpdate,
  isQrButtonDisabled,
}) => {
  return (
    <div className="floating-actions" aria-live="polite">
      <button
        className="qr-open-button"
        type="button"
        onClick={onOpenQr}
        disabled={isQrButtonDisabled}
      >
        参加用QRコードを表示
      </button>

      <button
        className="update-open-button"
        type="button"
        onClick={onOpenUpdate}
      >
        アップデート
      </button>
    </div>
  );
};

export default FloatingActions;
