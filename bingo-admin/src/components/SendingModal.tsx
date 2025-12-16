import React from "react";

export type SendingModalProps = {
  isOpen: boolean;
};

const SendingModal: React.FC<SendingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-label="送信中">
      <div className="modal sending-modal" aria-live="polite">
        <div className="sending-modal__content">
          <div className="spinner" aria-hidden="true" />
          <p className="sending-modal__message">送信中</p>
        </div>
      </div>
    </div>
  );
};

export default SendingModal;
