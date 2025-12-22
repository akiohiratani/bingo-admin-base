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
      <div className="modal" role="document">
        <button className="modal__close" aria-label="閉じる" onClick={onClose}>
          ×
        </button>
        <h2 className="modal__title">アップデートでできること</h2>
        <div className="modal__body">
          <p>アップデート版では以下の機能が利用可能です。</p>
          <ul className="modal__list">
            <li>抽選回数が無制限になる</li>
            <li>抽選確率を変更できる</li>
            <li>好きな画像を使用して図柄を変更できる</li>
          </ul>
        </div>
        <div className="modal__footer">
          <a
            className="modal__action"
            href={updateUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            アップデート内容を確認する
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
