import React, { useState } from "react";

import OutcomeLabelInputs from "./OutcomeLabelInputs";

const OUTCOME_INPUT_COUNT = 5;

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
  const [hasAttemptedDrawWithEmptyLabel, setHasAttemptedDrawWithEmptyLabel] = useState(false);

  const hasEmptyOutcomeLabel = outcomeLabels.some((label) => !label.trim());
  const isSystemDisabled = isDrawButtonDisabled;
  const isDrawActionBlocked = isSystemDisabled || hasEmptyOutcomeLabel;

  const handleOutcomeLabelChange = (index: number, value: string) => {
    setOutcomeLabels((currentLabels) => currentLabels.map((label, i) => (i === index ? value : label)));
  };

  const handleWinIndexChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const parsedValue = Number(event.target.value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    onWinIndexChange(Math.min(100, Math.max(0, parsedValue)));
  };

  const handleDrawClick = () => {
    if (hasEmptyOutcomeLabel) {
      setHasAttemptedDrawWithEmptyLabel(true);
      return;
    }

    onDraw();
  };

  return (
    <div className="draw-panel">
      <button
        className={`draw-button ${hasEmptyOutcomeLabel ? "draw-button--blocked" : ""}`.trim()}
        onClick={handleDrawClick}
        disabled={isSystemDisabled}
        aria-disabled={isDrawActionBlocked}
        type="button"
      >
        抽選開始
      </button>
      <label className="win-index-selector" htmlFor="win-index-input">
        <span className="win-index-selector__label">大当たり確率 (%)</span>
        <input
          id="win-index-input"
          className="win-index-selector__input"
          type="number"
          min={0}
          max={100}
          step={1}
          value={winIndex}
          onChange={handleWinIndexChange}
          aria-label="大当たり確率の入力"
        />
      </label>
      <OutcomeLabelInputs
        values={outcomeLabels}
        onChange={handleOutcomeLabelChange}
        showValidationMessage={hasAttemptedDrawWithEmptyLabel && hasEmptyOutcomeLabel}
      />
    </div>
  );
};

export default DrawControls;
