import type { ServerTranslation } from "./server.type";

export const JapaneseServerTranslation = {
  error: {
    ZodParsingFailed:
      "一部のデータ形式が正しくありません。確認して再度お試しください。",
    DefinitionConflict:
      "このルーティンは変更されました。保存する前に最新のバージョンを確認してください。",
    RescheduleRequired:
      "このルーティンを有効にする前に、未来の実行時刻を設定してください。",
    QuotaExceeded: "現在のプランの利用上限に達しました。",
    MissingNetwork: "ネットワークに接続できません。",
    InternalServerError:
      "サーバーで問題が発生しました。しばらくしてからもう一度お試しください。",
    InvalidDto: "送信した情報の一部が正しくありません。",
    InvalidInput: "入力内容が正しくありません。",
    InvalidRequest: "リクエストの内容が正しくありません。",
    InvalidAuthenticationCode: "認証コードが無効か、有効期限が切れています。",
    TokenExchangeFailed:
      "サインインを完了できませんでした。もう一度お試しください。",
    OAuthProviderUnavailable: "サインインサービスは一時的に利用できません。",
    ResponseReadFailed: "サインインサービスの応答を読み取れませんでした。",
    InvalidResponse: "サインインサービスから無効な応答が返されました。",
    WrongPassword: "パスワードが正しくありません。",
    XAccountNotLinked:
      "X のメールアドレスはすでに Notegic アカウントで使われています。普段の方法でログインし、アカウント設定で X を連携してください。",
    DiscordAccountNotLinked:
      "この Discord アカウントは Notegic と連携されていません。いつもの方法でログインし、アカウント設定から Discord を連携してください。",
    XEmailRequired:
      "X で Notegic アカウントを作成するには、X でメールアドレスを確認し、もう一度 Notegic にそのアドレスへのアクセスを許可してください。",
    DiscordEmailRequired:
      "アカウントを作成するには、Discord でメールアドレスを認証し、Notegic にアクセスを許可してください。",
    GoogleCredentialAlreadyBound:
      "Notegic アカウントにはすでに Google アカウントが連携されています。",
    GithubCredentialAlreadyBound:
      "Notegic アカウントにはすでに GitHub アカウントが連携されています。",
    XCredentialAlreadyBound:
      "Notegic アカウントにはすでに X アカウントが連携されています。",
    DiscordCredentialAlreadyBound:
      "Notegic アカウントにはすでに Discord アカウントが連携されています。",
    WrongAuthCode: "認証コードが正しくありません。",
    LoginBlockedDueToTryingTooManyTimes:
      "サインインの試行回数が多すぎます。しばらくしてからお試しください。",
    AuthCodeBlockedDueToTryingTooManyTimes:
      "認証コードのリクエストが多すぎます。しばらくしてからお試しください。",
    OAuthPasswordSetupRequired:
      "最後のログイン方法の連携を解除する前に、パスワードを設定してください。",
    PermissionDeniedDueToUserRole:
      "この操作には Normal 以上のアカウントロールが必要です。「アカウント設定 → セキュリティ」でメールアドレスを確認してから、もう一度お試しください。",
    PermissionDeniedDueToUserPlan: "現在のプランではこの操作を実行できません。",
    PermissionDeniedDueToInvalidRequestOriginDomain:
      "このリクエスト元は許可されていません。",
    PermissionDeniedDueToTooManyRequests:
      "リクエストが多すぎます。時間をおいてもう一度お試しください。",
    TurnstileVerificationFailed:
      "人間確認に失敗しました。もう一度お試しください。",
    TurnstileProviderUnavailable: "人間確認サービスは一時的に利用できません。",
    InvalidCSRFToken:
      "セキュリティトークンがないか無効です。ページを再読み込みしてお試しください。",
    RefreshFailed:
      "セッションを更新できませんでした。もう一度サインインしてください。",
    SessionUnavailable:
      "現在のセッションを利用できません。もう一度サインインしてください。",
    InvalidSession: "セッションが無効です。もう一度サインインしてください。",
    Unauthorized: "続行するにはサインインしてください。",
    PermissionDenied: "この操作を行う権限がありません。",
    NotFound: "指定された項目が見つかりません。",
    DuplicateName: "この名前はすでに使用されています。",
    DuplicateEmail: "このメールアドレスはすでに使用されています。",
    NoChanges: "変更はありませんでした。",
    FailedToGet: "情報を読み込めませんでした。",
    FailedToCreate: "項目を作成できませんでした。もう一度お試しください。",
    FailedToUpdate: "項目を更新できませんでした。もう一度お試しください。",
    FailedToDelete: "項目を削除できませんでした。もう一度お試しください。",
    QueryFailed: "リクエストを完了できませんでした。もう一度お試しください。",
    GenerationFailed: "項目を生成できませんでした。",
    FileTooLarge: "ファイルサイズが大きすぎます。",
    InvalidType: "このファイル形式には対応していません。",
    StorageUnavailable: "ファイルストレージは一時的に利用できません。",
    EmailServiceUnavailable: "メールサービスは一時的に利用できません。",
    InvalidChannelPermission: "このチャンネルにアクセスする権限がありません。",
    RoomAdmissionUnavailable:
      "リアルタイム接続を確立できませんでした。もう一度お試しください。",
  },
} satisfies ServerTranslation;
