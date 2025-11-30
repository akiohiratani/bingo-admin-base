import React, { createContext, useContext, useEffect, useState } from "react";

export type RuntimeConfig = {
  websocketUrl: string;
  websocketSecret: string;
  cognitoUserPoolId: string;
  cognitoClientId: string;
  memberUrl: string;
};

const RuntimeConfigContext = createContext<RuntimeConfig | null>(null);

const isValidRuntimeConfig = (value: Partial<RuntimeConfig>): value is RuntimeConfig =>
  typeof value.websocketUrl === "string" &&
  typeof value.websocketSecret === "string" &&
  typeof value.cognitoUserPoolId === "string" &&
  typeof value.cognitoClientId === "string" &&
  typeof value.memberUrl === "string";

// eslint-disable-next-line react-refresh/only-export-components
export const useRuntimeConfig = (): RuntimeConfig => {
  const context = useContext(RuntimeConfigContext);

  if (!context) {
    throw new Error("Runtime config has not been loaded yet.");
  }

  return context;
};

export const RuntimeConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/runtime-config.sample.json", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to load runtime config: ${response.status}`);
        }

        const json = (await response.json()) as Partial<RuntimeConfig>;

        if (!isValidRuntimeConfig(json)) {
          throw new Error("Runtime config is missing required fields.");
        }

        setConfig(json);
      } catch (err) {
        console.error("Runtime config load error", err);
        setError("設定ファイルの読み込みに失敗しました。管理者に連絡してください。");
      }
    };

    loadConfig();
  }, []);

  if (error) {
    return (
      <div className="config-error" role="alert">
        {error}
      </div>
    );
  }

  if (!config) {
    return <div className="config-loading">Loading...</div>;
  }

  return (
    <RuntimeConfigContext.Provider value={config}>
      {children}
    </RuntimeConfigContext.Provider>
  );
};
