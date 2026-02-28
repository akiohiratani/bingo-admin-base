import React from "react";

export type UpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  updateUrl: string;
};

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, updateUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal modal--update" role="document">
        <button className="modal__close" aria-label="閉じる" onClick={onClose}>
          ×
        </button>
        <p className="modal__eyebrow">アップデートで解禁</p>
        <h2 className="modal__title">無料プレイはここまで。</h2>
        <div className="modal__body">
          <div className="modal__card">
            <p className="modal__highlight">イベントを“ちゃんと盛り上げ切る”方法は、この先にあります。</p>
          </div>
          <div className="modal__feature-grid">
            <div className="modal__feature">
              <span className="modal__feature-icon" aria-hidden="true">
                🕑
              </span>
              <div>
                <p className="modal__feature-title">回数無制限・確率調整</p>
                <p className="modal__feature-text">回数や確率を調整して、イベントの空気に合わせた抽選ができる。</p>
              </div>
            </div>
            <div className="modal__feature">
              <span className="modal__feature-icon" aria-hidden="true">
                😂
              </span>
              <div>
                <p className="modal__feature-title">図柄やリーチ演出を自由に選べる</p>
                <p className="modal__feature-text">好きな写真を図柄にして、会場が一気に盛り上がる。</p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <a
            className="modal__action"
            href={updateUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            アップデートして続ける
          </a>
          <button className="modal__action modal__action--secondary" type="button" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
