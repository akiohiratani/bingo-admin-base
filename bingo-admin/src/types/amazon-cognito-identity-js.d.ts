declare module 'amazon-cognito-identity-js' {
  export class AuthenticationDetails {
    constructor(options: { Username: string; Password: string })
  }

  export class CognitoUserPool {
    constructor(options: { UserPoolId: string; ClientId: string })
  }

  export class CognitoUserSession {
    getIdToken(): { getJwtToken(): string }
  }

  export class CognitoUser {
    constructor(options: { Username: string; Pool: CognitoUserPool })
    authenticateUser(
      authenticationDetails: AuthenticationDetails,
      callbacks: {
        onSuccess: (session: CognitoUserSession) => void
        onFailure: (error: unknown) => void
        newPasswordRequired?: (...args: unknown[]) => void
      }
    ): void
  }
}
