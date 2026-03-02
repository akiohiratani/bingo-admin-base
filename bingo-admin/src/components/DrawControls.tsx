import React, { useState } from "react";

import OutcomeLabelInputs from "./OutcomeLabelInputs";

const OUTCOME_INPUT_COUNT = 5;
const WIN_INDEX_OPTIONS = Array.from({ length: 10 }, (_, index) => (index + 1) * 10);

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
  const [outcomeLabels, setOutcomeLabels] = useState<string[]>(
    Array.from({ length: OUTCOME_INPUT_COUNT }, () => ""),
  );
  const isSystemDisabled = isDrawButtonDisabled;

  const handleOutcomeLabelChange = (index: number, value: string) => {
    setOutcomeLabels((currentLabels) => currentLabels.map((label, i) => (i === index ? value : label)));
  };

  const handleWinIndexChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    onWinIndexChange(Number(event.target.value));
  };

  return (
    <div className="draw-panel">
      <button
        className="draw-button"
        onClick={onDraw}
        disabled={isSystemDisabled}
        aria-disabled={isSystemDisabled}
        type="button"
      >
        抽選開始
      </button>
      <label className="win-index-selector" htmlFor="win-index-combobox">
        <span className="win-index-selector__label">大当たり確率 (%)</span>
        <select
          id="win-index-combobox"
          className="win-index-selector__input"
          value={winIndex}
          onChange={handleWinIndexChange}
          aria-label="大当たり確率の選択"
        >
          {WIN_INDEX_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <OutcomeLabelInputs
        values={outcomeLabels}
        onChange={handleOutcomeLabelChange}
      />
    </div>
  );
};

export default DrawControls;
