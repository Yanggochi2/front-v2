import { ApiError } from "@/lib/apiClient";

// 오류 코드(docs/API.md)를 사용자에게 보여 줄 한국어 문구로 바꾼다. 코드별 문구가 없으면 fallback.
const MESSAGES: Record<string, string> = {
  API_NOT_CONFIGURED: "서버에 연결하지 못했어요. 서버 주소를 확인해 주세요.",
  UNAUTHENTICATED: "로그인이 필요해요.",
  VALIDATION_ERROR: "입력한 내용을 다시 확인해 주세요.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 맞지 않아요.",
  ACCOUNT_DISABLED: "사용할 수 없는 계정이에요.",
  EMAIL_ALREADY_EXISTS: "이미 가입한 이메일이에요. 로그인해 주세요.",
  MEMBERSHIP_ALREADY_EXISTS: "이미 만든 병동이 있어요.",
  FORBIDDEN: "이 작업을 할 권한이 없어요.",
  RESOURCE_NOT_FOUND: "대상을 찾을 수 없어요.",
  RATE_LIMITED: "시도가 너무 많아요. 잠시 후에 다시 해 주세요.",
  INVALID_STAFFING: "하루 필요 인원을 다시 확인해 주세요.",
  REASON_REQUIRED: "사유를 입력해 주세요.",
  HARD_VIOLATIONS_EXIST: "규칙 위반을 먼저 고쳐 주세요.",
  INVALID_SCHEDULE_STATE: "근무표 상태가 바뀌었어요. 새로고침해 주세요.",
  // 서버 코드가 아니라 자동 생성 시작 전에 프론트가 확정본을 걸러 낼 때 쓴다 (generationApi)
  SCHEDULE_CONFIRMED: "확정된 근무표는 확정을 취소한 뒤 다시 짤 수 있어요.",
  VERSION_CONFLICT: "다른 곳에서 수정됐어요. 새로고침해 주세요.",
  INTERNAL_ERROR: "서버에 문제가 생겼어요. 잠시 후에 다시 해 주세요.",
};

export function toErrorMessage(error: unknown, fallback = "요청에 실패했어요. 잠시 후에 다시 해 주세요."): string {
  if (error instanceof ApiError) {
    const first = error.fieldErrors?.[0];
    return MESSAGES[error.code] ?? first?.reason ?? fallback;
  }
  return fallback;
}
