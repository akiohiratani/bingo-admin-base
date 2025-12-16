import React from "react";

export type DrawControlsProps = {
  onDraw: () => void;
  isDrawButtonDisabled: boolean;
  winIndex: number;
  onWinIndexChange: (value: number) => void;
};

const DrawControls: React.FC<DrawControlsProps> = ({
  onDraw,
  isDrawButtonDisabled,
  winIndex,
  onWinIndexChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = Number(event.target.value);
    onWinIndexChange(selectedValue);
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

      <label className="win-index-selector">
        <span className="win-index-selector__label">大当たり確率 (%)</span>
        <select
          className="win-index-selector__control"
          value={winIndex}
          onChange={handleChange}
          aria-label="winIndex の選択"
        >
          {Array.from({ length: 100 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default DrawControls;
