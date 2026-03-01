import React from "react";

const EXTERNAL_LINK_URL = "https://coconala.com/services/3988880";

const ExternalLinkLabel: React.FC = () => {
  return (
    <a
      className="external-link-label"
      href={EXTERNAL_LINK_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      オリジナルの図柄を使用する。
    </a>
  );
};

export default ExternalLinkLabel;
