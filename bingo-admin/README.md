# React + TypeScript + Vite

## Runtime configuration

機密情報をソースコードから分離するため、アプリケーションは起動時に `public/runtime-config.json` を読み込みます。S3/CloudFront へ配信する際は、ビルド成果物と一緒にこのファイルを配置してください。

設定ファイルの例: `public/runtime-config.sample.json`

```json
{
  "websocketUrl": "wss://example.execute-api.ap-northeast-1.amazonaws.com/Prod?role=admin",
  "websocketSecret": "replace-with-admin-secret",
  "cognitoUserPoolId": "ap-northeast-1_example",
  "cognitoClientId": "exampleclientid1234567890"
}
```

デプロイ環境では上記の例を複製して `public/runtime-config.json` を作成し、実際の WebSocket エンドポイント・シークレット・Cognito の情報を入力してください。 `.gitignore` でこのファイルは除外されるため、機密情報がリポジトリに含まれません。
