import { apiRequest } from "@/lib/apiClient";
import type { LoginRequest, MeResponse, SignupRequest, UserSummary } from "@/types/authApi.type";

// 수간호사 로그인·회원가입 화면(/login, /signup)에서 쓴다. 일반 간호사는 계정이 없고 공유 링크로 본다 (10/26 계약).
// Figma 시안은 아직 없다.
// 토큰은 서버가 내려주는 HttpOnly 쿠키로만 다룬다 (본문·저장소에 두지 않는다).

export async function signup(body: SignupRequest): Promise<UserSummary> {
  return apiRequest<UserSummary>("/auth/signup", { method: "POST", body });
}

export async function login(body: LoginRequest): Promise<UserSummary> {
  return apiRequest<UserSummary>("/auth/login", { method: "POST", body });
}

// TODO: 401 REFRESH_TOKEN_INVALID 후 처리(로그인 화면 이동)는 명세 (결정). 호출 시점도 미정.
export async function refreshSession(): Promise<void> {
  await apiRequest<void>("/auth/refresh", { method: "POST" });
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me");
}

// 로그인 직후 어디로 보낼지: 병동이 있으면 근무표, 없으면 병동 만들기.
export async function getEntryPath(): Promise<string> {
  const me = await getMe();
  return me.membership && me.ward ? "/schedule" : "/onboarding/create-ward";
}
