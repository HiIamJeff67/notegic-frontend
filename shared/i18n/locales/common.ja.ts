import { CommonTranslation } from "./common.type";

export const JapaneseCommonTranslation: CommonTranslation = {
  syntax: {
    separator: "",
  },
  common: {
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    cancel: "キャンセル",
    confirm: "確認",
    create: "作成",
    save: "保存",
    delete: "削除",
    edit: "編集",
    choose: "選択",
    send: "送信",
    close: "閉じる",
    more: "その他",
    toggleSidebar: "サイドバーを切り替える",
    sidebar: "サイドバー",
    mobileSidebarDescription: "モバイル用サイドバーを表示します。",
    commandPalette: "コマンドパレット",
    searchCommands: "実行するコマンドを検索...",
    breadcrumb: "パンくずリスト",
  },
  navigation: {
    home: "ホーム",
    documents: "ドキュメント",
    settings: "設定",
    profile: "プロフィール",
  },
  homePage: {
    mainTitle: "Notegic",
    secondaryTitle: "より人間的な AI 駆動ノートアプリケーション",
    subtitle: "あなたのデジタルノートパートナー",
    getStarted: "始める",
    viewDocs: "ドキュメントを見る",
    switchTheme: "テーマ切替",
  },
  validation: {
    userPublicId: "有効なユーザーPublic ID（UUID）を入力してください。",
    invalidInput: "入力内容を確認して、もう一度お試しください。",
    invalidResponse:
      "操作を完了できません。しばらくしてから再度お試しください。",
    nameRequired: "名前またはタイトルを入力してください。",
    nameTooLong: "名前またはタイトルは128文字以内にしてください。",
    description: "説明は1024文字以内にしてください。",
    backgroundUrl:
      "有効な背景画像URLを入力してください。例：https://example.com/image.jpg",
    authCode: "6桁の数字の認証コードを入力してください。",
    displayNameLength: "表示名は6～32文字にしてください。",
    displayNameFormat:
      "表示名には文字と数字の両方を含め、空白や記号は使わないでください。",
    phone: "電話番号は1～15桁の数字で入力してください。",
    headline: "見出しは64文字以内にしてください。",
    introduction: "自己紹介は256文字以内にしてください。",
    birthDate: "未来の日付ではない有効な誕生日を選択してください。",
    timeout: "タイムアウトは1～60分の整数にしてください。",
    priority: "優先度は0～100の整数にしてください。",
    maxAttempts: "最大試行回数は1～20の整数にしてください。",
    startDescription: "開始ノードの説明は1024文字以内にしてください。",
    apiKeyName: "APIキー名は1～64文字にしてください。",
    feedbackTitle:
      "フィードバックのタイトルは前後の空白を除いて1～200文字にしてください。",
    feedbackDescription:
      "フィードバックの説明は前後の空白を除いて1～10,000文字にしてください。",
    payloadObject: "タスクの内容はJSONオブジェクトで入力してください。",
    payloadVersion:
      "このバージョンには対応していません。内容エディターを開き直して更新してください。",
    payloadPurpose: "タスクとその内容で同じ操作を選択してください。",
    patternBinding: "パターンの設定と対象を確認してください。",
    patternSource: "対応するパターンのソースを選択してください。",
    blockId: "有効なBlock IDを入力してください。",
    blockPackId: "有効なBlockPack IDを入力してください。",
    subShelfRequired: "対象のサブシェルフを選択してください。",
    rootShelfName: "ルートシェルフを選択し、サブシェルフ名を入力してください。",
    templateRequired:
      "対象のサブシェルフと名前を指定し、テンプレートブロックを1つ以上追加してください。",
    templateContent: "内容エディターでブロックの内容を確認してください。",
    blockCount: "ブロックは1～1000個にしてください。",
    routineRequired: "対象のルーティンを選択してください。",
    stationTitle:
      "ステーションを選択し、ルーティンのタイトルを入力してください。",
    materialRequired: "対象の素材を選択してください。",
    materialContent:
      "親サブシェルフを選択し、素材名とコンテンツキーを指定してください。",
  },
  auth: {
    validation: {
      invalidInput: "入力内容を確認して、もう一度お試しください。",
      nameLength: "名前は6～32文字で入力してください。",
      nameFormat:
        "名前には文字と数字の両方を使用し、空白や記号を含めないでください。",
      emailFormat:
        "name@example.com のような有効なメールアドレスを入力してください。",
      accountRequired: "アカウント名またはメールアドレスを入力してください。",
      accountFormat:
        "有効なメールアドレス、または英字と数字の両方を含むアカウント名を入力してください。",
      passwordRequired: "パスワードを入力してください。",
      passwordTooShort: "パスワードは8文字以上で入力してください。",
      passwordTooLong: "パスワードは1024文字以内で入力してください。",
      passwordStrength:
        "パスワードには英大文字・英小文字・数字・記号を含めてください。",
      passwordMismatch: "パスワードが一致しません。",
      oauthCodeInvalid:
        "ログインを完了できませんでした。もう一度お試しください。",
      invalidResponse:
        "操作を完了できませんでした。しばらくしてからお試しください。",
    },
    login: "ログイン",
    register: "登録",
    resetPassword: "パスワード再設定",
    logout: "ログアウト",
    account: "アカウント",
    name: "名前",
    email: "メール",
    password: "パスワード",
    confirmPassword: "パスワード確認",
    newPassword: "新しいパスワード",
    confirmNewPassword: "新しいパスワードの確認",
    authCode: "認証コード",
    accountExample: "例: example123@email.com または myName123",
    nameExample: "例: myName123",
    emailExample: "例: example123@email.com",
    passwordExample: "例: example-password123(&@#$",
    authCodeExample: "例: 123456",
    userRole: "ユーザーの役割",
    userPlan: "ユーザープラン",
    forgetPassword: "パスワードを忘れた？",
    haveNotRegisterAnAccount: "まだアカウントを登録していませんか？",
    alreadyHaveAnAccount: "すでにアカウントをお持ちですか？",
    authenticationPanelSubtitle: "認証パネル",
    oopsIForgotMyAccount: "しまった！アカウントを忘れてしまいました..",
    pleaseInputValidName:
      "有効な名前を入力してください。英数字を含み、8文字以上である必要があります。",
    pleaseInputValidEmail: "有効なメールアドレスを入力してください。",
    pleaseInputValidAccount:
      "有効なアカウントを入力してください。名前またはメールアドレスである必要があります",
    pleaseInputValidAuthCode: "有効な認証コードを入力してください",
    pleaseInputStrongPassword: "強力なパスワードを入力してください",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "パスワードと確認用パスワードが一致していることを確認してください。",
    turnstileRequired: "人間であることの確認を完了してください",
    turnstileUnavailable:
      "人間確認を一時的に利用できません。後でもう一度お試しください",
  },
  themes: {
    theme: "テーマ",
    defaultDark: "デフォルトダーク",
    defaultLight: "デフォルトライト",
    defaultNeon: "デフォルトネオン",
    defaultOcean: "デフォルトオーシャン",
    defaultStandard: "デフォルトスタンダード",
    defaultForest: "デフォルトフォレスト",
    defaultPhoenix: "デフォルトフェニックス",
    defaultPearl: "デフォルトパール",
    defaultSakura: "デフォルトサクラ",
    defaultCitrus: "デフォルトシトラス",
  },
  languages: {
    language: "言語",
    english: "英語",
    traditionalChinese: "繁体字中国語",
    simpleChinese: "簡体字中国語",
    japanese: "日本語",
    korean: "韓国語",
  },
  error: {
    encounterUnknownError: "不明なエラーが発生しました",
    urlNotFound: "URLが見つかりません",
    unauthorized: "認証されていません",
    permissionDeniedDueTo: "次の理由で許可されません:",
    apiError: {
      register: {
        failedToRegister:
          "登録に失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
        duplicateName:
          "この名前は既に登録されています。別の名前を選択してください",
        duplicateEmail:
          "このメールアドレスは既に登録されています。別のメールアドレスを選択してください",
      },
      login: {
        failedToLogin:
          "ログインに失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
        wrongPassword: "パスワードが間違っています。再度お試しください",
      },
      logout: {
        failedToLogout:
          "ログアウトに失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
      },
      getUser: {
        failedToGetUser:
          "ユーザー情報の取得に失敗しました。しばらく待ってからもう一度お試しいただくか、お問い合わせください",
      },
    },
    localDatabaseError:
      "ローカルデータベースに接続できません。しばらくしてからもう一度お試しいただくか、お問い合わせください",
  },
  localDBRecovery: {
    title: "ローカルデータの復旧が必要です",
    description:
      "ローカルデータは保持されています。破壊的な自動リセットは実行されていません。",
    technicalDetails: "技術的な詳細",
    phases: {
      workerConnectionPending: "ローカルデータベースワーカーを待機しています",
      workerConnected: "ローカルデータベースワーカーに接続しました",
      migrationLockPending: "マイグレーションロックを待機しています",
      migrationLockAcquired: "マイグレーションロックを取得しました",
      readingVersion: "ローカルデータベースのバージョンを読み取っています",
      freezingLocalWrites: "ローカルデータの変更を一時停止しています",
      waitingForLocalOperations: "ローカル操作の完了を待機しています",
      checkingTransactionQueue: "保留中のローカル変更を確認しています",
      flushingYjs: "保留中のドキュメント変更を保存しています",
      checkingRebuildability:
        "ローカルデータを安全に再構築できるか確認しています",
      exportingLocalData: "ローカルデータをエクスポートしています",
      clearingLocalStorage: "再構築可能なローカルデータを消去しています",
      rebuilding: "ローカルデータベースを再構築しています",
      bootstrapping: "ローカルデータベースを作成しています",
      migrating: "ローカルデータベースのマイグレーションを適用しています",
      verifying: "ローカルデータベースを検証しています",
      verifyingSchema: "ローカルデータベースのスキーマを検証しています",
      resynchronizing: "ローカルデータを再同期しています",
      ready: "ローカルデータベースの準備が完了しました",
      failed: "ローカルデータベースの初期化に失敗しました",
      needsAction: "ローカルデータに対応が必要です",
      manualRecovery: "ローカルデータベースの手動復旧が必要です",
    },
    labels: {
      currentPhase: "現在のフェーズ",
      recoveryResult: "復旧結果",
      recoverability: "復旧可能性",
      databaseVersion: "データベースバージョン",
      targetVersion: "目標バージョン",
    },
    results: {
      success: "成功",
      retryable: "再試行できます",
      needsAction: "対応が必要です",
      safeToRebuild: "安全に再構築できます",
      manualRecovery: "手動復旧が必要です",
    },
    actions: {
      retry: "再試行",
      reconnect: "再接続",
      exportDiagnostics: "診断情報をエクスポート",
      exportLocalData: "ローカルデータをエクスポート",
      checkRebuildEligibility: "再構築条件を確認",
      continueReadOnly: "読み取り専用で続行",
      rebuildLocalData: "ローカルデータを再構築",
    },
    confirmExport:
      "このエクスポートにはノートや個人ワークスペースのデータが含まれる場合があります。続行しますか？",
    errors: {
      retryFailed: "再試行が完了しませんでした。",
      exportFailed: "ローカルデータのエクスポートに失敗しました。",
      readOnlyUnavailable:
        "ローカルデータベースの状態を確認できないため、読み取り専用モードは利用できません。",
      rebuildFailed: "ローカルデータの再構築に失敗しました。",
      preflightFailed: "再構築の安全確認に失敗しました。",
    },
  },
  settings: {
    accountSettings: "アカウント設定",
    preferences: "設定",
  },
};
