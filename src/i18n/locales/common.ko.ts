import { CommonTranslation } from "./common.type";

export const KoreanCommonTranslation: CommonTranslation = {
  syntax: {
    separator: "",
  },
  common: {
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    cancel: "취소",
    confirm: "확인",
    create: "생성",
    save: "저장",
    delete: "삭제",
    edit: "편집",
    choose: "선택하다",
    send: "보내기",
    close: "닫기",
    more: "더 보기",
    toggleSidebar: "사이드바 전환",
    sidebar: "사이드바",
    mobileSidebarDescription: "모바일 사이드바를 표시합니다.",
    commandPalette: "명령 팔레트",
    searchCommands: "실행할 명령 검색...",
    breadcrumb: "이동 경로",
  },
  navigation: {
    home: "홈",
    documents: "문서",
    settings: "설정",
    profile: "프로필",
  },
  homePage: {
    mainTitle: "Notegic",
    secondaryTitle: "보다 인간적인 AI 기반 노트 애플리케이션",
    subtitle: "당신의 디지털 노트 파트너",
    getStarted: "시작하기",
    viewDocs: "문서 보기",
    switchTheme: "테마 전환",
  },
  auth: {
    login: "로그인",
    register: "회원가입",
    resetPassword: "비밀번호 재설정",
    switchAccount: "계정 전환",
    logout: "로그아웃",
    account: "계정",
    name: "이름",
    email: "이메일",
    password: "비밀번호",
    confirmPassword: "비밀번호 확인",
    newPassword: "새 비밀번호",
    confirmNewPassword: "새 비밀번호 확인",
    authCode: "인증 코드",
    accountExample: "예: example123@email.com 또는 myName123",
    nameExample: "예: myName123",
    emailExample: "예: example123@email.com",
    passwordExample: "예: example-password123(&@#$",
    authCodeExample: "예: 123456",
    userRole: "사용자 역할",
    userPlan: "사용자 플랜",
    forgetPassword: "비밀번호를 잊으셨나요?",
    haveNotRegisterAnAccount: "아직 계정을 등록하지 않으셨나요？",
    alreadyHaveAnAccount: "이미 계정이 있으신가요？",
    authenticationPanelSubtitle: "인증 패널",
    oopsIForgotMyAccount: "앗! 제 계정을 잊어버렸어요..",
    pleaseInputValidName:
      "유효한 이름을 입력해 주세요. 영문자와 숫자를 포함하며 최소 8자여야 합니다.",
    pleaseInputValidEmail: "유효한 이메일을 입력해 주세요.",
    pleaseInputValidAccount:
      "유효한 계정을 입력해 주세요. 이름 또는 이메일이어야 합니다",
    pleaseInputValidAuthCode: "유효한 인증 코드를 입력해 주세요",
    pleaseInputStrongPassword: "강력한 비밀번호를",
    pleaseMakeSurePasswordAndConfirmPasswordAreMatch:
      "비밀번호와 비밀번호 확인이 일치하는지 확인해 주세요.",
  },
  themes: {
    theme: "테마",
    defaultDark: "기본 다크",
    defaultLight: "기본 라이트",
    defaultNeon: "기본 네온",
    defaultOcean: "기본 오션",
    defaultStandard: "기본 스탠다드",
    defaultForest: "기본 포레스트",
    defaultPhoenix: "기본 피닉스",
    defaultPearl: "기본 펄",
    defaultSakura: "기본 사쿠라",
    defaultCitrus: "기본 시트러스",
  },
  languages: {
    language: "언어",
    english: "영어",
    traditionalChinese: "번체 중국어",
    simpleChinese: "간체 중국어",
    japanese: "일본어",
    korean: "한국어",
  },
  error: {
    encounterUnknownError: "알 수 없는 오류가 발생했습니다",
    urlNotFound: "URL을 찾을 수 없습니다",
    unauthorized: "권한 없음",
    permissionDeniedDueTo: "다음 이유로 권한이 거부되었습니다:",
    apiError: {
      register: {
        failedToRegister:
          "등록에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
        duplicateName:
          "이 이름은 이미 등록되어 있습니다. 다른 이름을 선택해 주세요",
        duplicateEmail:
          "이 이메일은 이미 등록되어 있습니다. 다른 이메일을 선택해 주세요",
      },
      login: {
        failedToLogin:
          "로그인에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
        wrongPassword: "비밀번호가 틀렸습니다. 다시 시도해 주세요",
      },
      logout: {
        failedToLogout:
          "로그아웃에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
      },
      getUser: {
        failedToGetUser:
          "사용자 정보 가져오기에 실패했습니다. 잠시 후 다시 시도하거나 문의해 주세요",
      },
    },
    localDatabaseError:
      "로컬 데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도하거나 저희에게 문의해 주세요",
  },
  settings: {
    accountSettings: "계정 설정",
    preferences: "환경설정",
  },
};
