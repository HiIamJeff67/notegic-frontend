import type { TutorialTranslation } from "./tutorial.en";

export const JapaneseTutorialTranslation = {
  navigation: {
    home: "ホーム",
    document: "ドキュメント",
    overview: "チュートリアル概要",
    overviewDescription: "API キー連携と Notegic のリソースモデル。",
    apiKeys: "API キー",
    apiKeysDescription: "連携キーを作成して安全に使用します。",
    keyManagement: "キー管理",
    keyManagementDescription: "キーの確認、ローテーション、取り消し。",
    model: "Notegic の構造",
    modelDescription: "リソース階層をひと目で確認します。",
    integrationPatterns: "連携パターン",
    integrationPatternsDescription:
      "API キーをサーバーに保管して公開 gateway を呼び出します。",
    qa: "Q&A",
    qaDescription: "Notegic 連携に関するよくある質問です。",
  },
  overview: {
    subtitle: "API キー連携と Notegic のリソースモデルに関する実践ガイドです。",
    intro:
      "まず API キーの流れを確認し、その後 Notegic の構造ガイドで連携が呼び出すべきリソースファミリーを理解します。",
  },
  apiKeys: {
    title: "最初の API キーを作成する",
    subtitle: "API キーは公開 API Gateway へのサーバー間通信を認証します。",
    intro:
      "API キーはブラウザーセッションの代わりにはならず、フロントエンドコードに含めて配布してはいけません。",
    step1: "アカウント設定を開き、API キーを選択します。",
    step2: "1 つの連携または環境用に名前付きキーを作成します。",
    step3:
      "完全なシークレットをすぐにコピーします。表示されるのは一度だけです。",
    step4: "サーバーのシークレット管理ツールに保存し、",
    step4Suffix: " として各リクエストに送信します。",
  },
  keyManagement: {
    title: "キーを管理・取り消す",
    subtitle:
      "作成後はキーのメタデータを確認できますが、シークレットが再び返されることはありません。",
    item1: "本番環境と開発環境には別々のキーを使用します。",
    item2: "所有者または環境が変わったらキーをローテーションします。",
    item3: "シークレットが漏えいした可能性があれば、すぐに取り消します。",
    item4: "生のシークレットをログ、URL、メトリクスに残さないでください。",
  },
  model: {
    title: "Notegic の構造を理解する",
    subtitle:
      "Notegic は組織、コンテンツ、実行を分離し、連携が必要なリソースファミリーだけを要求できるようにします。",
    diagram:
      "ルートシェルフ\n├─ サブシェルフ\n│  ├─ 素材\n│  └─ ブロックパック\n│     └─ ブロック\n└─ ステーション\n   └─ ルーティン\n      ├─ ルーティンタスク\n      └─ ルーティンタグ",
    intro: "以下の各リソースセクションでは境界を説明し、",
    documentLink: "ドキュメントページ",
  },
  domains: {
    structure: "構造",
    viewApiOperations: "{{title}} API 操作を見る",
    rootShelves: {
      title: "ルートシェルフ",
      summary:
        "ルートシェルフは Notegic コンテンツの最上位ワークスペース境界です。",
      structure: "ルートシェルフ → サブシェルフ → ブロックパック → ブロック",
      details:
        "チーム、プロジェクト、個人領域に固有のメンバー、所有権、権限が必要な場合はルートシェルフを使用します。広い範囲のアクセス判断をこのレベルに置き、入れ子になったリソースが明確なコンテキストを継承できるようにします。",
    },
    subShelves: {
      title: "サブシェルフ",
      summary:
        "サブシェルフは別のトップレベルワークスペースを作らずに、ルートシェルフを小さく移動しやすい領域へ分割します。",
      structure: "ルートシェルフ → サブシェルフ → 並び順付き項目",
      details:
        "プロジェクト、テーマ、作業段階にはサブシェルフを使用します。並び順とトラバーサルの endpoint により、client は Notegic と同じ階層を表示できます。",
    },
    materials: {
      title: "素材",
      summary:
        "素材はシェルフやドキュメントのコンテンツを支えるソースファイルと参照情報です。",
      structure: "素材 → メタデータ + コンテンツ参照 + 親の場所",
      details:
        "素材はドキュメントそのものではなく入力として扱います。メタデータを安定させ、適切な親に紐付け、復元が必要な場合は recovery endpoint を使用します。",
    },
    blockPacks: {
      title: "ブロックパック",
      summary:
        "ブロックパックは 1 つ以上のブロックで構成される共同編集ドキュメントのコンテナです。",
      structure:
        "ブロックパック → 並び順付きブロック → リアルタイム編集セッション",
      details:
        "ライフサイクルと権限にはブロックパック API を使用します。共同編集は別の private realtime ticket フローが担当するため、API キーはサーバーに保管してください。",
    },
    blocks: {
      title: "ブロック",
      summary: "ブロックはブロックパックを構成する小さなコンテンツ単位です。",
      structure: "ブロックパック → ブロック ID → コンテンツ + 並び順メタデータ",
      details:
        "可能な限り、所属するブロックパックを通してブロックを操作します。これにより認可と並び順の判断をドキュメント境界に結び付けられます。",
    },
    stations: {
      title: "ステーション",
      summary:
        "ステーションはルーティンとそのリソースをまとめる実行指向のワークスペースです。",
      structure: "ステーション → メンバー + 権限 + ルーティンリンク",
      details:
        "作業を実行する場所をモデル化するにはステーションを使用します。ステーションに依存する自動化を作成する前に、メンバーと権限の変更を管理してください。",
    },
    routines: {
      title: "ルーティン",
      summary:
        "ルーティンは繰り返し可能な自動化フローとそのスケジュールを定義します。",
      structure: "ルーティン → スケジュール → ルーティンタスク",
      details:
        "ルーティンは 1 回の実行ではなく定義です。ルーティンを安定させ、タスクリンクとライフサイクル操作でスケジュールされた作業を確認・変更します。",
    },
    routineTasks: {
      title: "ルーティンタスク",
      summary:
        "ルーティンタスクはルーティンから作成され、スケジューラーが取得する実行可能なステップです。",
      structure: "ルーティン → タスク payload → worker の取得 → 結果",
      details:
        "タスクは実行条件を満たすまで待機できます。月間実行クォータはバックエンドがタスクを取得した時点で消費されるため、client はローカル payload の見積もりだけでタスクを拒否してはいけません。",
    },
    routineTags: {
      title: "ルーティンタグ",
      summary:
        "ルーティンタグはルーティンタスクを分類・検索するための軽量なラベルです。",
      structure:
        "タグ → リンクされたルーティンタスク → 絞り込み済みタスクビュー",
      details:
        "ユーザー向けの整理とフィルタリングにはタグを使用します。タグは独立したリソースなので、タグの削除をラベル付けされたタスクの削除として扱わないでください。",
    },
  },
  integration: {
    title: "連携パターン",
    subtitle: "API キーをサーバーに保管して公開 gateway を呼び出します。",
    paragraph1:
      "API キーは backend、worker、または CLI プロセスに保管します。サービスが API Gateway を呼び出し、レスポンスを検証して、自分の client に必要なデータだけを公開します。",
    paragraph2:
      "Notegic の web app は HttpOnly JWT cookie を使う ClientGateway を使用します。API キーをブラウザーのストレージ、URL、フロントエンド環境変数、WebSocket frame に入れないでください。",
  },
  qa: {
    title: "Q&A",
    subtitle: "Notegic のリソースと連携に関するよくある質問です。",
    questions: {
      blockPack: {
        question: "ブロックパックとは何ですか？",
        answer:
          "ブロックパックは並び順付きブロックで構成される共同編集ドキュメントのコンテナです。ライフサイクルと権限には API を、共同編集には realtime フローを使用します。",
      },
      apiKeyStorage: {
        question: "API キーはどこに保管すべきですか？",
        answer:
          "backend、worker、CLI のシークレット管理ツール、またはデプロイ用シークレットに保管します。フロントエンド環境変数、ブラウザーストレージ、URL、ログ、WebSocket frame には入れないでください。",
      },
      separateEnvironments: {
        question: "すべての環境で同じ API キーを使うべきですか？",
        answer:
          "いいえ。開発、staging、本番用に別々のキーを作成し、環境ごとにローテーションや取り消しができるようにします。",
      },
      shelfDifference: {
        question: "ルートシェルフとサブシェルフの違いは何ですか？",
        answer:
          "ルートシェルフは所有権、メンバー、権限のためのトップレベルワークスペース境界です。サブシェルフはその境界内でコンテンツを整理し、別のワークスペースは作りません。",
      },
      station: {
        question: "ステーションはいつ使うべきですか？",
        answer:
          "メンバー、権限、ルーティンをまとめた実行指向のワークスペースが必要な場合にステーションを使用します。",
      },
      routineDifference: {
        question: "ルーティンとルーティンタスクの違いは何ですか？",
        answer:
          "ルーティンは繰り返し可能な自動化の定義とスケジュールです。ルーティンタスクはその定義から作られ、スケジューラーが取得する実行可能なステップです。",
      },
      routineQuota: {
        question: "ルーティンのクォータはいつ消費されますか？",
        answer:
          "バックエンドがルーティンタスクを実行のために取得した時点で消費されます。client はローカルの payload コスト見積もりだけでタスクを拒否しないでください。",
      },
      leakedApiKey: {
        question:
          "API キーが漏えいした可能性がある場合はどうすればよいですか？",
        answer:
          "すぐに取り消し、交換用キーを作成し、サーバー側のシークレットを更新して、古いキーがログやデプロイに露出していないか確認します。",
      },
    },
  },
} as const satisfies TutorialTranslation;
