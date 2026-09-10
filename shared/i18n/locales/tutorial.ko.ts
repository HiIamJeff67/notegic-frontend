import type { TutorialTranslation } from "./tutorial.en";

export const KoreanTutorialTranslation = {
  navigation: {
    home: "홈",
    document: "문서",
    overview: "튜토리얼 개요",
    overviewDescription: "API 키 통합과 Notegic 리소스 모델입니다.",
    apiKeys: "API 키",
    apiKeysDescription: "통합 키를 만들고 안전하게 사용합니다.",
    keyManagement: "키 관리",
    keyManagementDescription: "키를 확인하고 교체하거나 취소합니다.",
    model: "Notegic 구조",
    modelDescription: "리소스 계층을 한눈에 확인합니다.",
    integrationPatterns: "통합 패턴",
    integrationPatternsDescription:
      "API 키를 서버에 보관하고 공개 gateway를 호출합니다.",
    qa: "Q&A",
    qaDescription: "Notegic 통합에 대한 자주 묻는 질문입니다.",
  },
  overview: {
    subtitle: "API 키 통합과 Notegic 리소스 모델을 위한 실용적인 안내입니다.",
    intro:
      "먼저 API 키 흐름을 확인한 뒤 Notegic 구조 안내를 통해 통합에서 호출해야 할 리소스 계열을 이해하세요.",
  },
  apiKeys: {
    title: "첫 번째 API 키 만들기",
    subtitle: "API 키는 공개 API Gateway에 대한 서버 간 호출을 인증합니다.",
    intro:
      "API 키는 브라우저 세션을 대신하지 않으며 프런트엔드 코드에 포함해 배포해서는 안 됩니다.",
    step1: "계정 설정을 열고 API 키를 선택합니다.",
    step2: "하나의 통합 또는 환경을 위한 이름 있는 키를 만듭니다.",
    step3: "전체 시크릿을 즉시 복사합니다. 한 번만 표시됩니다.",
    step4: "서버 시크릿 관리자에 저장하고 다음 형식으로 각 요청에 전송합니다:",
    step4Suffix: "",
  },
  keyManagement: {
    title: "키 관리 및 취소",
    subtitle:
      "생성 후에는 키 메타데이터를 볼 수 있지만 시크릿은 다시 반환되지 않습니다.",
    item1: "운영 환경과 개발 환경에는 서로 다른 키를 사용합니다.",
    item2: "소유자나 환경이 변경되면 키를 교체합니다.",
    item3: "시크릿이 유출되었을 가능성이 있으면 즉시 취소합니다.",
    item4: "원본 시크릿을 로그, URL, metrics에 남기지 않습니다.",
  },
  model: {
    title: "Notegic 구조 이해하기",
    subtitle:
      "Notegic은 조직, 콘텐츠, 실행을 분리하여 통합에서 필요한 리소스 계열만 요청할 수 있게 합니다.",
    diagram:
      "루트 선반\n├─ 하위 선반\n│  ├─ 자료\n│  └─ 블록 팩\n│     └─ 블록\n└─ 스테이션\n   └─ 루틴\n      ├─ 루틴 작업\n      └─ 루틴 태그",
    intro: "아래의 각 리소스 섹션에서 경계를 설명하고",
    documentLink: "문서 페이지",
  },
  domains: {
    structure: "구조",
    viewApiOperations: "{{title}} API 작업 보기",
    rootShelves: {
      title: "루트 선반",
      summary: "루트 선반은 Notegic 콘텐츠 모음의 최상위 작업 공간 경계입니다.",
      structure: "루트 선반 → 하위 선반 → 블록 팩 → 블록",
      details:
        "팀, 프로젝트 또는 개인 영역에 고유한 구성원, 소유권, 권한이 필요할 때 루트 선반을 사용합니다. 넓은 접근 권한 결정은 이 수준에 두어 중첩된 모든 리소스가 명확한 맥락을 이어받게 하세요.",
    },
    subShelves: {
      title: "하위 선반",
      summary:
        "하위 선반은 또 다른 최상위 작업 공간을 만들지 않고 루트 선반을 더 작고 탐색하기 쉬운 영역으로 나눕니다.",
      structure: "루트 선반 → 하위 선반 → 정렬된 항목",
      details:
        "프로젝트, 주제 또는 작업 단계에는 하위 선반을 사용합니다. 정렬 및 탐색 endpoint를 통해 client는 Notegic에서 사용자가 보는 것과 같은 계층을 표시할 수 있습니다.",
    },
    materials: {
      title: "자료",
      summary:
        "자료는 선반이나 문서에 저장된 콘텐츠를 지원하는 소스 파일과 참고 자료입니다.",
      structure: "자료 → metadata + 콘텐츠 참조 + 상위 위치",
      details:
        "자료를 문서 자체가 아니라 입력으로 다룹니다. metadata를 안정적으로 유지하고 적절한 상위 항목에 연결하며, 복원이 필요할 때 recovery endpoint를 사용하세요.",
    },
    blockPacks: {
      title: "블록 팩",
      summary:
        "블록 팩은 하나 이상의 블록으로 구성된 공동 작업 문서 컨테이너입니다.",
      structure: "블록 팩 → 정렬된 블록 → 실시간 편집 세션",
      details:
        "수명 주기와 권한에는 블록 팩 API를 사용합니다. 공동 편집은 별도의 private realtime ticket 흐름이 담당하므로 API 키는 서버에 보관해야 합니다.",
    },
    blocks: {
      title: "블록",
      summary: "블록은 블록 팩을 구성하는 작은 콘텐츠 단위입니다.",
      structure: "블록 팩 → 블록 ID → 콘텐츠 + 정렬 metadata",
      details:
        "가능하면 포함된 블록 팩을 통해 블록을 다룹니다. 이렇게 하면 인증과 정렬 결정을 문서 경계에 연결할 수 있습니다.",
    },
    stations: {
      title: "스테이션",
      summary:
        "스테이션은 루틴과 관련 리소스를 함께 연결하는 실행 중심 작업 공간입니다.",
      structure: "스테이션 → 구성원 + 권한 + 루틴 연결",
      details:
        "작업이 실행되는 위치를 모델링할 때 스테이션을 사용합니다. 스테이션에 의존하는 자동화를 만들기 전에 구성원과 권한 변경을 관리하세요.",
    },
    routines: {
      title: "루틴",
      summary: "루틴은 반복 가능한 자동화 흐름과 일정을 정의합니다.",
      structure: "루틴 → 일정 → 루틴 작업",
      details:
        "루틴은 한 번의 실행이 아니라 정의입니다. 루틴을 안정적으로 유지하고 작업 연결 및 수명 주기 작업으로 예약된 작업을 확인하거나 변경하세요.",
    },
    routineTasks: {
      title: "루틴 작업",
      summary:
        "루틴 작업은 루틴에서 생성되고 스케줄러가 처리하는 실행 가능한 단계입니다.",
      structure: "루틴 → 작업 payload → worker 처리 → 결과",
      details:
        "작업은 실행 조건을 충족할 때까지 유휴 상태일 수 있습니다. 월간 실행 할당량은 백엔드가 작업을 처리할 때 소비되므로 client는 로컬 payload 추정값만으로 작업을 거부해서는 안 됩니다.",
    },
    routineTags: {
      title: "루틴 태그",
      summary:
        "루틴 태그는 루틴 작업을 분류하고 찾기 위한 가벼운 레이블입니다.",
      structure: "태그 → 연결된 루틴 작업 → 필터링된 작업 보기",
      details:
        "사용자 중심의 정리와 필터링에는 태그를 사용합니다. 태그는 독립 리소스이므로 태그 삭제를 해당 태그가 표시한 작업의 삭제로 취급하지 마세요.",
    },
  },
  integration: {
    title: "통합 패턴",
    subtitle: "API 키를 서버에 보관하고 공개 gateway를 호출합니다.",
    paragraph1:
      "API 키는 backend, worker 또는 CLI 프로세스에 보관합니다. 서비스가 API Gateway를 호출하고 응답을 검증한 뒤 자체 client에 필요한 데이터만 노출합니다.",
    paragraph2:
      "Notegic 웹 앱은 HttpOnly JWT cookie를 사용하는 ClientGateway를 사용합니다. API 키를 브라우저 저장소, URL, 프런트엔드 환경 변수 또는 WebSocket frame에 넣지 마세요.",
  },
  qa: {
    title: "Q&A",
    subtitle: "Notegic 리소스와 통합에 대한 자주 묻는 질문입니다.",
    questions: {
      blockPack: {
        question: "블록 팩이란 무엇인가요?",
        answer:
          "블록 팩은 정렬된 블록으로 구성된 공동 작업 문서 컨테이너입니다. 수명 주기와 권한에는 API를 사용하고 공동 편집에는 realtime 흐름을 사용하세요.",
      },
      apiKeyStorage: {
        question: "API 키는 어디에 저장해야 하나요?",
        answer:
          "backend, worker, CLI 시크릿 관리자 또는 배포 시크릿에 저장하세요. 프런트엔드 환경 변수, 브라우저 저장소, URL, 로그 또는 WebSocket frame에는 넣지 마세요.",
      },
      separateEnvironments: {
        question: "모든 환경에서 하나의 API 키를 사용해야 하나요?",
        answer:
          "아니요. 개발, staging, production 환경마다 별도의 키를 만들어 환경별로 교체하거나 취소할 수 있게 하세요.",
      },
      shelfDifference: {
        question: "루트 선반과 하위 선반의 차이는 무엇인가요?",
        answer:
          "루트 선반은 소유권, 구성원, 권한을 위한 최상위 작업 공간 경계입니다. 하위 선반은 그 경계 안에서 콘텐츠를 정리하며 다른 작업 공간을 만들지 않습니다.",
      },
      station: {
        question: "스테이션은 언제 사용해야 하나요?",
        answer:
          "구성원, 권한, 루틴을 하나로 묶은 실행 중심 작업 공간이 필요할 때 스테이션을 사용하세요.",
      },
      routineDifference: {
        question: "루틴과 루틴 작업의 차이는 무엇인가요?",
        answer:
          "루틴은 반복 가능한 자동화 정의와 일정입니다. 루틴 작업은 그 정의에서 생성되고 스케줄러가 처리하는 실행 가능한 단계입니다.",
      },
      routineQuota: {
        question: "루틴 할당량은 언제 소비되나요?",
        answer:
          "백엔드가 루틴 작업을 실행하기 위해 처리할 때 소비됩니다. client는 로컬 payload 비용 추정만으로 작업을 거부하지 않아야 합니다.",
      },
      leakedApiKey: {
        question: "API 키가 유출되었을 가능성이 있다면 어떻게 해야 하나요?",
        answer:
          "즉시 취소하고 교체 키를 만든 다음 서버 측 시크릿을 업데이트하세요. 기존 키가 로그나 배포에 노출되었는지도 검토하세요.",
      },
    },
  },
} as const satisfies TutorialTranslation;
