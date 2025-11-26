import { CognitoUserPool } from "amazon-cognito-identity-js";

export type CognitoPoolConfig = {
  userPoolId: string;
  clientId: string;
};

export const createUserPool = ({ clientId, userPoolId }: CognitoPoolConfig) =>
  new CognitoUserPool({
    ClientId: clientId,
    UserPoolId: userPoolId,
  });