import React from "react";

type OutcomeLabelInputsProps = {
  values: string[];
  onChange: (index: number, value: string) => void;
  showValidationMessage: boolean;
};

const inputConfigs = [
  { id: 1, placeholder: "例）大当たり1", colorClass: "outcome-label-inputs__label--1" },
  { id: 2, placeholder: "例）大当たり2", colorClass: "outcome-label-inputs__label--2" },
  { id: 3, placeholder: "例）罰ゲーム1", colorClass: "outcome-label-inputs__label--3" },
  { id: 4, placeholder: "例）罰ゲーム2", colorClass: "outcome-label-inputs__label--4" },
  { id: 5, placeholder: "例）罰ゲーム3", colorClass: "outcome-label-inputs__label--5" },
];

const OutcomeLabelInputs: React.FC<OutcomeLabelInputsProps> = ({
  values,
  onChange,
  showValidationMessage,
}) => {
  return (
    <section className="outcome-label-inputs" aria-label="結果ラベル設定">
      <span className="outcome-label-inputs__title">結果ラベル設定</span>
      <div className="outcome-label-inputs__row">
        {inputConfigs.map(({ id, placeholder, colorClass }, index) => {
          const hasValidationError = showValidationMessage && !values[index]?.trim();

          return (
            <div key={id} className="outcome-label-inputs__item">
              <label className={`outcome-label-inputs__label ${colorClass}`} htmlFor={`outcome-label-input-${id}`}>
                {id}
              </label>
              <input
                id={`outcome-label-input-${id}`}
                className={`outcome-label-inputs__field ${hasValidationError ? "outcome-label-inputs__field--error" : ""}`.trim()}
                type="text"
                placeholder={placeholder}
                aria-label={placeholder}
                value={values[index] ?? ""}
                onChange={(event) => onChange(index, event.target.value)}
                aria-invalid={hasValidationError}
                aria-describedby={hasValidationError ? `outcome-label-input-${id}-error` : undefined}
              />
              {hasValidationError ? (
                <span id={`outcome-label-input-${id}-error`} className="outcome-label-inputs__error" role="alert">
                  入力してください
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OutcomeLabelInputs;
