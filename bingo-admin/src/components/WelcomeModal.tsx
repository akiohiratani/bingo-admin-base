import React from "react";

export type WelcomeModalProps = {
  isOpen: boolean;
  onConnect: () => void;
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onConnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal__title">Welcome</h2>
        <p className="modal__body">接続を開始するにはタップしてください。</p>

        <button className="modal__action" type="button" onClick={onConnect}>
          接続を開始
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
