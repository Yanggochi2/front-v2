// docs/API.md 공통 규칙. 도메인별 모델은 각 xxx.type.ts에 둔다.
export type PageMeta = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ApiFieldError = { field: string; reason: string };

export type ApiErrorBody = {
  code: string;
  message: string;
  traceId?: string;
  fieldErrors?: ApiFieldError[];
  details?: Record<string, unknown>; // 코드별 추가 정보 (예: INVALID_NURSE_EXCEL의 행별 오류)
};

export type ApiResult<T> = { data: T };
export type ApiListResult<T> = { data: T[]; meta: PageMeta };
