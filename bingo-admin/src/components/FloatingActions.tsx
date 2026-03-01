import React from "react";
import ExternalLinkLabel from "./ExternalLinkLabel";

export type FloatingActionsProps = {
  onOpenQr: () => void;
  isQrButtonDisabled: boolean;
};

const FloatingActions: React.FC<FloatingActionsProps> = ({
  onOpenQr,
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
      <ExternalLinkLabel />
    </div>
  );
};

export default FloatingActions;
