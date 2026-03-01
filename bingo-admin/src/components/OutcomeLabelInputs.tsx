import React from "react";

const placeholders = [
  "例）大当たり1",
  "例）大当たり2",
  "例）罰ゲーム1",
  "例）罰ゲーム2",
  "例）罰ゲーム3",
];

const OutcomeLabelInputs: React.FC = () => {
  return (
    <section className="outcome-label-inputs" aria-label="結果ラベル設定">
      <span className="outcome-label-inputs__title">結果ラベル設定</span>
      <div className="outcome-label-inputs__row">
        {placeholders.map((placeholder) => (
          <input
            key={placeholder}
            className="outcome-label-inputs__field"
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
          />
        ))}
      </div>
    </section>
  );
};

export default OutcomeLabelInputs;
