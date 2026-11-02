import { MANAGEMENT_TOKEN_COOKIE, readManagementToken } from "@/lib/managementToken";
import type { ApiErrorBody, ApiListResult, ApiResult } from "@/types/api.type";

// 호출 주소는 환경 변수로 분리한다. 기본 구성은 "/api/v1" (next.config.ts의 rewrites가 백엔드로 넘긴다).
// 서버 컴포넌트는 상대 경로로 fetch할 수 없으므로 BACKEND_ORIGIN을 앞에 붙여 백엔드로 직접 보낸다.
// 비어 있으면 모든 요청이 API_NOT_CONFIGURED ApiError로 실패한다.
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const BASE_URL =
  typeof window === "undefined" && PUBLIC_BASE_URL.startsWith("/")
    ? `${process.env.BACKEND_ORIGIN ?? ""}${PUBLIC_BASE_URL}`
    : PUBLIC_BASE_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId?: string;
  readonly fieldErrors: ApiErrorBody["fieldErrors"];

  constructor(status: number, body: Partial<ApiErrorBody>) {
    super(body.message ?? "요청에 실패했어요.");
    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? "INTERNAL_ERROR";
    this.traceId = body.traceId;
    this.fieldErrors = body.fieldErrors;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Query;
  body?: unknown;
  // 중복 실행 위험이 있는 POST(생성, 승인, 확정, 자동 생성 시작 등)에 넘긴다.
  idempotencyKey?: string;
  // 근무표 편집 잠금을 쓰는 변경 요청에 넘긴다.
  scheduleLockToken?: string;
};

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${BASE_URL}${path}`, "http://placeholder.local");
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  const search = url.search;
  return `${BASE_URL}${path}${search}`;
}

// 관리 토큰(src/lib/managementToken.ts). 브라우저에서는 쿠키를 읽고, 서버 컴포넌트에서는 브라우저가 보낸 요청의 쿠키를 읽는다.
// 서버에서 쿠키를 먼저 읽으면 서버 렌더링이 요청마다 다시 돈다 (빌드 시점에 결과가 고정되지 않도록).
async function getManagementToken(): Promise<string | undefined> {
  if (typeof window !== "undefined") return readManagementToken(document.cookie);
  const { cookies } = await import("next/headers");
  return (await cookies()).get(MANAGEMENT_TOKEN_COOKIE)?.value;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  if (options.scheduleLockToken) headers["X-Schedule-Lock-Token"] = options.scheduleLockToken;
  const token = await getManagementToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (BASE_URL === "") {
    throw new ApiError(0, { code: "API_NOT_CONFIGURED", message: "서버 주소가 설정되지 않았어요." });
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    // 인증은 Authorization 헤더로만 한다. 쿠키는 백엔드로 보내지 않는다.
    credentials: "omit",
    cache: "no-store",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let body: { error?: Partial<ApiErrorBody> } = {};
    try {
      body = await response.json();
    } catch {}
    throw new ApiError(response.status, body.error ?? {});
  }
  return response;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  if (response.status === 204) return undefined as T;
  return ((await response.json()) as ApiResult<T>).data;
}

export async function apiRequestList<T>(path: string, options: RequestOptions = {}): Promise<ApiListResult<T>> {
  const response = await send(path, options);
  return (await response.json()) as ApiListResult<T>;
}

// 엑셀 내보내기처럼 파일을 받는 요청
export async function apiRequestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  return (await send(path, options)).blob();
}
