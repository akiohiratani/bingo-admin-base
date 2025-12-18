/**
 * UserUrlService
 *
 * ・シングルトンとして動作する
 * ・userId に紐づく URL を API から取得する
 * ・一度取得した URL はフィールドに保持し、以降は API を叩かない
 */
class UserUrlService {

    /** 取得済みURLのキャッシュ */
  private cachedUrl: string | null = null;

  /** シングルトン用インスタンス */
  private static instance: UserUrlService;

  /**
   * コンストラクタは外部から呼ばせない
   */
  private constructor() {
  }

  /**
   * シングルトンインスタンスを取得する
   */
  public static getInstance(): UserUrlService {
    if (!UserUrlService.instance) {
      UserUrlService.instance = new UserUrlService();
    }
    return UserUrlService.instance;
  }

  /**
   * userId に紐づく URL を取得する
   *
   * ・cachedUrl が存在する場合 → それを返す
   * ・存在しない場合 → API を叩いて取得し、キャッシュして返す
   */
  public async getUrl(userId: string, key: string, url: string): Promise<string> {
    // すでに取得済みなら API を叩かず返す
    if (this.cachedUrl) {
      return this.cachedUrl;
    }

    // API リクエスト
    const response = await fetch(
      `${url}/users/${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": key,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const data: { userId: string; url: string } = await response.json();

    // フィールドにキャッシュ
    this.cachedUrl = data.url;

    return data.url;
  }

  /**
   * キャッシュを明示的にクリアしたい場合用
   * （ログアウト時などに使える）
   */
  public clearCache(): void {
    this.cachedUrl = null;
  }
}

export default UserUrlService;
