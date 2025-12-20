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
   * userId を使用せず、暫定的に固定 URL を返す
   */
  public async getUrl(): Promise<string> {
    if (this.cachedUrl) {
      return this.cachedUrl;
    }

    this.cachedUrl = "smoke.net";

    return this.cachedUrl;
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
