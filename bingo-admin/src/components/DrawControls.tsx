import React from "react";

export type DrawControlsProps = {
  onDraw: () => void;
  isDrawButtonDisabled: boolean;
  winIndex: number;
};

const DrawControls: React.FC<DrawControlsProps> = ({
  onDraw,
  isDrawButtonDisabled,
  winIndex,
}) => {
  return (
    <div className="draw-panel">
      <button
        className="draw-button"
        onClick={onDraw}
        disabled={isDrawButtonDisabled}
        type="button"
      >
        抽選開始
      </button>

      <label className="win-index-selector">
        <span className="win-index-selector__label">大当たり確率 (%)</span>
        <span className="win-index-selector__value" aria-label="winIndex の表示">
          {winIndex}
        </span>
      </label>
    </div>
  );
};

export default DrawControls;
