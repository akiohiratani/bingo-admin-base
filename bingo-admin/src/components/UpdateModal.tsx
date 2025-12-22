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
          <p className="modal__lead">
            このままでは、抽選を続けることはできません。
          </p>
          <div className="modal__card">
            <p className="modal__subtitle">でも――</p>
            <p className="modal__highlight">友達の写真が、そのまま“罰ゲーム”になる。</p>
          </div>
          <div className="modal__feature-grid">
            <div className="modal__feature">
              <span className="modal__feature-icon" aria-hidden="true">
                🎯
              </span>
              <div>
                <p className="modal__feature-title">好きな写真を図柄にして回せる</p>
                <p className="modal__feature-text">推しの一枚で、ワクワク感をプラス。</p>
              </div>
            </div>
            <div className="modal__feature">
              <span className="modal__feature-icon" aria-hidden="true">
                💥
              </span>
              <div>
                <p className="modal__feature-title">誰に当たるかわからないドキドキが倍増</p>
                <p className="modal__feature-text">仕掛けた人も、見ている人も、最後まで目が離せない。</p>
              </div>
            </div>
            <div className="modal__feature">
              <span className="modal__feature-icon" aria-hidden="true">
                😂
              </span>
              <div>
                <p className="modal__feature-title">当たった瞬間、全員が一斉に笑う</p>
                <p className="modal__feature-text">盛り上がりがピークに。ゲームが一気に本番へ。</p>
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
