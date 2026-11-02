// 수간호사 관리 링크의 비밀값(관리 토큰). 10/26 계약(백엔드 docs/client-1026-api.md 1장)에서 로그인 대신 쓴다.
// 관리 API에는 `Authorization: Bearer <토큰>`으로 보낸다. 백엔드는 쿠키를 읽지 않는다.
// 서버 컴포넌트도 같은 토큰으로 API를 불러야 해서 이 프론트 출처의 쿠키에 두고, apiClient가 헤더로 옮긴다.
// SameSite=Strict라 다른 사이트에서 들어온 요청에는 붙지 않는다.
export const MANAGEMENT_TOKEN_COOKIE = "OTTUGI_MANAGEMENT_TOKEN";

// 브라우저가 허용하는 최대 보관 기간(약 400일). 관리 링크로 다시 들어오면 새로 저장된다.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

export function readManagementToken(cookieHeader: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${MANAGEMENT_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function saveManagementToken(token: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${MANAGEMENT_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Strict${secure}`;
}

export function clearManagementToken() {
  document.cookie = `${MANAGEMENT_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`;
}

// 백엔드가 주는 managementPath(`/manage#token=…`)는 프론트 상대 경로라 지금 주소의 출처를 붙여 보여 준다.
export function toManagementUrl(managementPath: string) {
  return `${window.location.origin}${managementPath}`;
}
