import React, { useEffect, useState } from "react";

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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!showTooltip) {
      return undefined;
    }

    const timerId = window.setTimeout(() => setShowTooltip(false), 2000);

    return () => window.clearTimeout(timerId);
  }, [showTooltip]);

  const handleTooltip = () => setShowTooltip(true);

  const handleKeyDown: React.KeyboardEventHandler<HTMLLabelElement> = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTooltip();
    }
  };

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
      <label
        className="win-index-selector"
        onClick={handleTooltip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="大当たり確率は固定されています"
      >
        <span className="win-index-selector__label">大当たり確率 (%)</span>
        <span className="win-index-selector__value" aria-label="winIndex の表示">
          {winIndex}
        </span>
        {showTooltip ? (
          <div className="win-index-selector__tooltip" role="status">
            お使いのバージョンでは変更できません。
          </div>
        ) : null}
      </label>
    </div>
  );
};

export default DrawControls;
