import type { ServerTranslation } from "./server.type";

export const KoreanServerTranslation = {
  error: {
    InternalServerError:
      "서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    InvalidDto: "제출한 정보 중 일부 형식이 올바르지 않습니다.",
    InvalidInput: "입력한 내용이 올바르지 않습니다.",
    InvalidRequest: "요청 내용이 올바르지 않습니다.",
    InvalidAuthenticationCode: "인증 코드가 유효하지 않거나 만료되었습니다.",
    TokenExchangeFailed: "로그인을 완료하지 못했습니다. 다시 시도해 주세요.",
    OAuthProviderUnavailable: "로그인 서비스를 일시적으로 사용할 수 없습니다.",
    ResponseReadFailed: "로그인 서비스의 응답을 읽지 못했습니다.",
    InvalidResponse: "로그인 서비스에서 잘못된 응답을 받았습니다.",
    WrongPassword: "비밀번호가 올바르지 않습니다.",
    WrongAuthCode: "인증 코드가 올바르지 않습니다.",
    LoginBlockedDueToTryingTooManyTimes:
      "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    AuthCodeBlockedDueToTryingTooManyTimes:
      "인증 코드 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    PermissionDeniedDueToUserRole:
      "계정 역할로는 이 작업을 수행할 수 없습니다.",
    PermissionDeniedDueToUserPlan:
      "현재 요금제로는 이 작업을 수행할 수 없습니다.",
    PermissionDeniedDueToInvalidRequestOriginDomain:
      "이 요청의 출처는 허용되지 않습니다.",
    PermissionDeniedDueToTooManyRequests:
      "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    TurnstileVerificationFailed:
      "사람 인증에 실패했습니다. 다시 시도해 주세요.",
    TurnstileProviderUnavailable:
      "사람 인증 서비스를 일시적으로 사용할 수 없습니다.",
    InvalidCSRFToken:
      "보안 토큰이 없거나 유효하지 않습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
    RefreshFailed: "세션을 갱신하지 못했습니다. 다시 로그인해 주세요.",
    SessionUnavailable: "현재 세션을 사용할 수 없습니다. 다시 로그인해 주세요.",
    InvalidSession: "세션이 유효하지 않습니다. 다시 로그인해 주세요.",
    Unauthorized: "계속하려면 로그인해 주세요.",
    PermissionDenied: "이 작업을 수행할 권한이 없습니다.",
    NotFound: "요청한 항목을 찾을 수 없습니다.",
    DuplicateName: "이미 사용 중인 이름입니다.",
    DuplicateEmail: "이미 사용 중인 이메일 주소입니다.",
    NoChanges: "변경 사항이 없습니다.",
    FailedToGet: "요청한 정보를 불러오지 못했습니다.",
    FailedToCreate: "항목을 만들지 못했습니다. 다시 시도해 주세요.",
    FailedToUpdate: "항목을 업데이트하지 못했습니다. 다시 시도해 주세요.",
    FailedToDelete: "항목을 삭제하지 못했습니다. 다시 시도해 주세요.",
    QueryFailed: "요청을 완료하지 못했습니다. 다시 시도해 주세요.",
    GenerationFailed: "요청한 항목을 생성하지 못했습니다.",
    FileTooLarge: "파일이 너무 큽니다.",
    InvalidType: "지원하지 않는 파일 형식입니다.",
    StorageUnavailable: "파일 저장소를 일시적으로 사용할 수 없습니다.",
    EmailServiceUnavailable: "이메일 서비스를 일시적으로 사용할 수 없습니다.",
    InvalidChannelPermission: "이 채널에 접근할 권한이 없습니다.",
    RoomAdmissionUnavailable:
      "실시간 연결을 설정하지 못했습니다. 다시 시도해 주세요.",
  },
} satisfies ServerTranslation;
