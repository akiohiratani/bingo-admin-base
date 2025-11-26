import React, { useState } from "react";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import { userPool } from "../domain/cognitoConfig";

export type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!userId || !password) {
      setError("ID またはパスワードが正しくありません。");
      return;
    }

    setIsLoading(true);

    const authenticationDetails = new AuthenticationDetails({
      Username: userId.trim(),
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: userId.trim(),
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result: CognitoUserSession) => {
        const idToken = result.getIdToken().getJwtToken();
        localStorage.setItem("idToken", idToken);
        setIsLoading(false);
        onClose();
        onConnected();
      },
      onFailure: () => {
        setError("ID またはパスワードが正しくありません。");
        setIsLoading(false);
      },
      newPasswordRequired: () => {
        setError("ID またはパスワードが正しくありません。");
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal__title">Welcome</h2>
        <p className="modal__body">
          抽選を開始する前に接続を準備してください。ログイン後に自動で接続が開始されます。
        </p>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="modal__field">
            <span className="modal__label">ユーザーID</span>
            <input
              type="text"
              className="modal__input"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="modal__field">
            <span className="modal__label">パスワード</span>
            <input
              type="password"
              className="modal__input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="modal__error" role="alert">
              {error}
            </p>
          )}

          <button className="modal__action" type="submit" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;
