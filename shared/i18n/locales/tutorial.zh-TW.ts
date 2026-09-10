import type { TutorialTranslation } from "./tutorial.en";

export const TraditionalChineseTutorialTranslation = {
  navigation: {
    home: "首頁",
    document: "文件",
    overview: "教學概覽",
    overviewDescription: "API 金鑰整合與 Notegic 資源模型。",
    apiKeys: "API 金鑰",
    apiKeysDescription: "建立並安全使用整合金鑰。",
    keyManagement: "金鑰管理",
    keyManagementDescription: "檢視、輪替與撤銷金鑰。",
    model: "Notegic 結構",
    modelDescription: "快速了解資源階層。",
    integrationPatterns: "整合模式",
    integrationPatternsDescription:
      "將 API 金鑰保留在伺服器並呼叫公開 gateway。",
    qa: "問答",
    qaDescription: "Notegic 整合常見問題的解答。",
  },
  overview: {
    subtitle: "API 金鑰整合與 Notegic 資源模型的實用指南。",
    intro:
      "先從 API 金鑰流程開始，再透過 Notegic 結構指南了解你的整合應該呼叫哪一類資源。",
  },
  apiKeys: {
    title: "建立你的第一把 API 金鑰",
    subtitle: "API 金鑰用來驗證伺服器對伺服器的公開 API Gateway 呼叫。",
    intro: "API 金鑰不能取代瀏覽器工作階段，也絕對不能隨前端程式碼一起發布。",
    step1: "開啟帳戶設定並選擇 API 金鑰。",
    step2: "為單一整合或環境建立一把有名稱的金鑰。",
    step3: "立即複製完整密鑰；它只會顯示一次。",
    step4: "將它儲存在伺服器的密鑰管理工具中，並使用",
    step4Suffix: " 傳送每一個請求。",
  },
  keyManagement: {
    title: "管理與撤銷金鑰",
    subtitle: "建立後可以查看金鑰 metadata，但密鑰不會再次返回。",
    item1: "為正式環境與開發環境使用不同的金鑰。",
    item2: "當擁有者或環境變更時輪替金鑰。",
    item3: "如果密鑰可能洩漏，請立即撤銷。",
    item4: "不要將原始密鑰放入日誌、網址或 metrics。",
  },
  model: {
    title: "了解 Notegic 結構",
    subtitle: "Notegic 將組織、內容與執行分開，讓整合只需請求需要的資源類型。",
    diagram:
      "根層架\n├─ 子層架\n│  ├─ 素材\n│  └─ 區塊包\n│     └─ 區塊\n└─ 工作站\n   └─ 流程\n      ├─ 流程任務\n      └─ 流程標籤",
    intro: "下方的每個資源區塊都會說明其邊界，並連結到",
    documentLink: "文件頁面",
  },
  domains: {
    structure: "結構",
    viewApiOperations: "查看 {{title}} API 操作",
    rootShelves: {
      title: "根層架",
      summary: "根層架是 Notegic 內容集合最上層的工作區邊界。",
      structure: "根層架 → 子層架 → 區塊包 → 區塊",
      details:
        "當團隊、專案或個人區域需要自己的成員、擁有權與權限時，請使用根層架。將廣泛的存取決策放在這一層，讓所有巢狀資源都能繼承清楚的上下文。",
    },
    subShelves: {
      title: "子層架",
      summary:
        "子層架能將根層架分成更小且容易導覽的區域，而不會建立另一個頂層工作區。",
      structure: "根層架 → 子層架 → 已排序項目",
      details:
        "使用子層架整理專案、主題或工作階段。排序與巡覽 endpoints 讓 client 能呈現使用者在 Notegic 中看到的相同階層。",
    },
    materials: {
      title: "素材",
      summary: "素材是支援層架或文件內容的來源檔案與參考資料。",
      structure: "素材 → metadata + 內容參照 + 父層位置",
      details:
        "將素材視為輸入，而不是文件本身。保持 metadata 穩定、將素材附加到適當的父層，並在使用者需要復原時使用 recovery endpoints。",
    },
    blockPacks: {
      title: "區塊包",
      summary: "區塊包是由一個或多個區塊組成的協作文件容器。",
      structure: "區塊包 → 已排序區塊 → 即時編輯工作階段",
      details:
        "使用區塊包 API 管理生命週期與權限。獨立的 private realtime ticket 流程負責協作編輯；API 金鑰應保留在你的伺服器上。",
    },
    blocks: {
      title: "區塊",
      summary: "區塊是組成區塊包的細小內容單位。",
      structure: "區塊包 → 區塊 ID → 內容 + 排序 metadata",
      details:
        "如果可以，請透過所屬的區塊包操作區塊，讓授權與排序決策都維持在文件邊界內。",
    },
    stations: {
      title: "工作站",
      summary: "工作站是讓流程與其資源匯集在一起、以執行為導向的工作區。",
      structure: "工作站 → 成員 + 權限 + 流程連結",
      details:
        "使用工作站描述工作執行的位置。在建立依賴工作站的自動化之前，先管理成員與權限變更。",
    },
    routines: {
      title: "流程",
      summary: "流程描述可重複的自動化流程與其排程。",
      structure: "流程 → 排程 → 流程任務",
      details:
        "流程是定義，不是單次執行。保持流程穩定，並使用任務連結與生命週期操作檢視或變更它安排的工作。",
    },
    routineTasks: {
      title: "流程任務",
      summary: "流程任務是由流程建立、並由排程器領取的可執行步驟。",
      structure: "流程 → 任務 payload → worker 領取 → 結果",
      details:
        "任務在符合執行條件前可以保持閒置。每月執行配額會在後端領取任務時消耗，因此 client 不應只依據本地 payload 預估值拒絕任務。",
    },
    routineTags: {
      title: "流程標籤",
      summary: "流程標籤是用來分類與尋找流程任務的輕量標籤。",
      structure: "標籤 → 已連結流程任務 → 篩選後的任務檢視",
      details:
        "使用標籤進行使用者導向的整理與篩選。標籤是獨立資源，因此刪除標籤不應被視為刪除它標記的任務。",
    },
  },
  integration: {
    title: "整合模式",
    subtitle: "將 API 金鑰保留在伺服器並呼叫公開 gateway。",
    paragraph1:
      "將 API 金鑰保留在你的 backend、worker 或 CLI 程序中。你的服務呼叫 API Gateway、驗證回應，並只向自己的 client 暴露需要的資料。",
    paragraph2:
      "Notegic web app 使用帶有 HttpOnly JWT cookies 的 ClientGateway。不要將 API 金鑰加入瀏覽器儲存空間、網址、前端環境變數或 WebSocket frame。",
  },
  qa: {
    title: "問答",
    subtitle: "Notegic 資源與整合的常見問題。",
    questions: {
      blockPack: {
        question: "什麼是區塊包？",
        answer:
          "區塊包是由已排序區塊組成的協作文件容器。使用 API 管理生命週期與權限，並使用 realtime 流程進行協作編輯。",
      },
      apiKeyStorage: {
        question: "API 金鑰應該儲存在哪裡？",
        answer:
          "將它儲存在 backend、worker、CLI 密鑰管理工具或部署密鑰中。不要放入前端環境變數、瀏覽器儲存空間、網址、日誌或 WebSocket frame。",
      },
      separateEnvironments: {
        question: "所有環境都應該使用同一把 API 金鑰嗎？",
        answer:
          "不應該。請為開發、staging 與 production 建立不同金鑰，讓每個環境都能獨立輪替或撤銷。",
      },
      shelfDifference: {
        question: "根層架與子層架有什麼不同？",
        answer:
          "根層架是負責擁有權、成員與權限的頂層工作區邊界。子層架則在這個邊界內整理內容，不會建立另一個工作區。",
      },
      station: {
        question: "什麼時候應該使用工作站？",
        answer:
          "當你需要將成員、權限與流程結合成一個以執行為導向的工作區時，請使用工作站。",
      },
      routineDifference: {
        question: "流程與流程任務有什麼不同？",
        answer:
          "流程是可重複的自動化定義與排程；流程任務則是由該定義建立、並由排程器領取的可執行步驟。",
      },
      routineQuota: {
        question: "流程配額什麼時候會消耗？",
        answer:
          "配額會在後端領取流程任務執行時消耗。client 不應只根據本地 payload 成本估算拒絕任務。",
      },
      leakedApiKey: {
        question: "如果 API 金鑰可能洩漏，我該怎麼做？",
        answer:
          "立即撤銷它、建立替代金鑰、更新伺服器端密鑰，並檢查日誌或部署內容中是否暴露過舊密鑰。",
      },
    },
  },
} as const satisfies TutorialTranslation;
