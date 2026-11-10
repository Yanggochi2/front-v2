# 병동 근무표 서비스 API 명세 (프론트 참고용 요약)

원본: "병동 근무표 서비스 API 명세서 v1.0 (기준안, 2026-10-06)". 아래는 프론트 구현에 필요한 내용을 줄여 옮긴 것이다. 충돌하면 원본이 맞다.
형식: REST JSON over HTTPS, 기본 경로 `/api/v1`.

> **10/26 범위 변경**: 인증·가입·신청·알림은 백엔드 계약 `Yanggochi2/backend` `docs/client-1026-api.md`(백엔드 #85, #86)로 바뀌었다.
> 수간호사만 `/auth/signup`·`/auth/login`·`/me`로 로그인한다(HttpOnly 쿠키 + CSRF, 아래 공통 규칙 그대로). 일반 간호사 가입·초대·권한 이관·`/wards/me/requests*`·알림은 없다.
> 새로 생긴 것: `POST /workspaces`(로그인한 계정으로 병동 만들기), 근무표 공유 링크(`/share-link`, `GET /shared/schedules/{token}`).
> 아래 WARD(가입·초대·권한 이관)·REQ·NOTI 절은 명세서가 개정될 때까지 참고용으로만 남긴다.

## 공통 규칙
- 인증: 액세스/리프레시 토큰을 HttpOnly·Secure·SameSite 쿠키로 주고받는다. 토큰을 본문·쿼리·브라우저 저장소로 다루지 않는다 → 요청은 `credentials: "include"`.
- 상태 변경 요청(POST/PATCH/PUT/DELETE)은 `X-CSRF-Token` 헤더가 필요하다. (토큰을 어디서 받는지는 명세에 없음 → TODO)
- 역할은 서버가 세션과 병동 소속으로 판정한다. 요청 본문에 role/병동 ID를 담지 않는다.
- 병동 리소스는 `/wards/me/...`. 다른 병동이거나 권한 없으면 404.
- 일반 간호사 응답에는 타인의 숙련도·경력·건강 상태·신청 사유·개인 통계·초안이 없다 → 받은 필드만 표시.
- 성공: 단건 `{ "data": {...} }`, 목록 `{ "data": [...], "meta": PageMeta }`, 204는 본문 없음. 날짜 `YYYY-MM-DD`, 연월 `YYYY-MM`, 시각 UTC ISO 8601.
- 오류: `{ "error": { code, message, traceId, fieldErrors: [{field, reason}] } }`
- 페이지: `page`(0부터, 기본 0), `size`(기본 20, 최대 100), `sort=field,asc|desc`. 목록은 `PageMeta {page,size,totalElements,totalPages}`.
- 멱등성: 중복 위험 POST(생성, 승인, 확정, 자동 생성 시작 등)에 `Idempotency-Key` 헤더.
- 동시성: 근무표 변경은 `baseVersion`. 다르면 `409 VERSION_CONFLICT`. 편집 잠금이 켜져 있으면 `X-Schedule-Lock-Token`. 셀 일괄 변경은 전체 성공/전체 실패.

## 엔드포인트 (권한 / 입력 / 성공 / 주요 오류)
HN = HEAD_NURSE, 구성원 = 병동 구성원. P2 = 2순위. (결정) = 명세상 결정 필요.

> 아래 표의 `ID`는 **API 명세서의 API ID**(`API-RULE-04` 등에서 접두어 `API-`를 뗀 것)다. **기능명세서의 기능 ID와 번호가 다르다** (예: 공휴일 조회는 API ID로 `RULE-04`지만 기능 ID로는 `RULE-02`). 화면과 기능을 연결할 때는 `docs/screens.md`의 기능 ID를 기준으로 하고, 여기 `ID`를 기능 ID로 혼동하지 않는다.

### 인증·소속
| ID | 요청 | 권한 | 입력 | 성공 | 오류 |
|---|---|---|---|---|---|
| AUTH-01 | POST /auth/signup | 공개 | name, email, password, termsAgreed | 201 UserSummary | 400 VALIDATION_ERROR, 409 EMAIL_ALREADY_EXISTS |
| AUTH-02 | POST /auth/login | 공개 | email, password | 200 UserSummary + 쿠키 | 401 INVALID_CREDENTIALS, 423 ACCOUNT_DISABLED |
| AUTH-03 | POST /auth/refresh | 리프레시 쿠키 | 없음 | 200 새 쿠키 | 401 REFRESH_TOKEN_INVALID (결정) |
| AUTH-04 | POST /auth/logout | 인증 | 없음 | 204 | 401 |
| AUTH-05 | GET /me | 인증 | - | 200 MeResponse | 401 |
| WARD-01 | POST /wards | 소속 없음 | hospitalName, wardName, requiredStaff, rulePreset | 201 Ward+Membership+joinCode | 409 MEMBERSHIP_ALREADY_EXISTS, 422 INVALID_STAFFING (결정) |
| WARD-02 | GET /wards/me | 구성원 | - | 200 Ward | 404 |
| WARD-03 | POST /ward-membership-requests | 소속 없음 | joinCode | 201 MembershipRequest | 404 JOIN_CODE_NOT_FOUND, 409 REQUEST_ALREADY_EXISTS, 429 RATE_LIMITED (결정) |
| WARD-04 | GET /wards/me/membership-requests | HN | status,page,size | 200 MembershipRequest[]+meta | 403 |
| WARD-05 | POST /wards/me/membership-requests/{id}/approve | HN | 없음 | 200 Membership | 404, 409 REQUEST_ALREADY_PROCESSED (결정) |
| WARD-06 | POST .../{id}/reject | HN | reason | 200 MembershipRequest | 400 REASON_REQUIRED, 409 |
| WARD-07 | GET /wards/me/join-code | HN | - | 200 JoinCode | 403 |
| WARD-08 | POST /wards/me/join-code/rotate | HN | 없음 | 200 JoinCode | 409 ROTATION_IN_PROGRESS |
| WARD-09 | POST /wards/me/head-nurses/{nurseId}/grant | HN | 없음 | 200 Membership | 404, 409 ROLE_ALREADY_ASSIGNED |
| WARD-10 | POST /wards/me/head-nurse-transfer | HN | targetNurseId | 200 TransferResult | 404, 409 LAST_HEAD_NURSE_CONFLICT |

> 가입 승인(WARD-04/05)은 백엔드 `docs/membership.md` 계약을 따른다: 대기 신청 목록에 `name`, `email`, `createdAt`, `candidates`(이름이 같고 계정이 없는 간호사 id)가 있고, 승인은 본문 `nurseId`로 계정을 연결할 등록 간호사를 정한다. 수간호사용 간호사 목록에는 `hasAccount`, `inviteExpiresAt`이 있다. 원본 명세서 v1.0에는 없는 확장이라 백엔드 문서가 기준이다.

### 간호사
| ID | 요청 | 권한 | 입력 | 성공 |
|---|---|---|---|---|
| NUR-01 | POST /wards/me/nurses | HN | NurseCreate | 201 Nurse (409 NURSE_ALREADY_EXISTS) |
| NUR-02 | GET /wards/me/nurses | 구성원 | q, role, dutyRole, status, includeRetired, sort, page, size | 200 Nurse[]+meta, 역할별 필드 차등 |
| NUR-03 | GET /wards/me/nurses/{nurseId} | 구성원 | - | 200 Nurse, 역할별 필드 차등 |
| NUR-04 | PATCH /wards/me/nurses/{nurseId} | HN | NursePatch(role 제외) | 200 Nurse+Violation[] (409 VERSION_CONFLICT) |
| NUR-05 | POST /wards/me/nurses/{nurseId}/retire | HN | affiliationEnd | 200 Nurse+Violation[] (409 LAST_HEAD_NURSE, 422 INVALID_END_DATE) |
| - (11/2, backend #88) | DELETE /wards/me/nurses/{nurseId} | HN | - | 204. 내부적으로 오늘 날짜 퇴사 처리, 지난·확정 근무표는 유지 |

### 규칙
| ID | 요청 | 권한 | 입력 | 성공 |
|---|---|---|---|---|
| RULE-01 | GET /wards/me/rules | HN | - | 200 Rule[] |
| RULE-02 | PATCH /wards/me/rules/{ruleId} | HN | enabled, severity, parameters, reason | 200 Rule+ViolationSummary[] (400 INVALID_RULE_VALUE, 409 RULE_CONFLICT) |
| RULE-03 | POST /wards/me/rule-presets/{presetId}/apply | HN | 없음 | 200 Rule[] |
| RULE-04 | GET /wards/me/holidays?yearMonth | HN | - | 200 Holiday[] |
| RULE-05 | PUT /wards/me/holidays/{date} | HN | isHoliday, name, reason | 200 Holiday |
| RULE-06 | GET /wards/me/off-targets/{yearMonth} | HN | - | 200 OffTarget (결정) |
| RULE-07 | PATCH /wards/me/off-targets/{yearMonth} | HN | targetCount, reason | 200 OffTarget (결정) |

### 근무표
| ID | 요청 | 권한 | 입력 | 성공 / 오류 |
|---|---|---|---|---|
| SCH-01 | POST /wards/me/schedules | HN | yearMonth | 201 Schedule (409 SCHEDULE_ALREADY_EXISTS, 422 NO_ACTIVE_NURSES) |
| SCH-02 | GET /wards/me/schedules?yearMonth | 구성원 | - | 200 Schedule (역할·상태별 필드 차등, 404) |
| SCH-03 | GET /wards/me/schedules/{id} | 구성원 | - | 200 Schedule |
| SCH-04 | PATCH /wards/me/schedules/{id}/cells | HN | changes[], baseVersion (+X-Schedule-Lock-Token) | 200 changedCells, version, Coverage, Violation[] (409 VERSION_CONFLICT, 423 SCHEDULE_LOCKED, 422 PROTECTED_CELL) |
| SCH-05 | GET .../coverage | 구성원 | - | 200 Coverage[] (결정) |
| SCH-06 | GET .../violations | HN | severity, nurseId, ruleId, page, size | 200 Violation[]+meta |
| SCH-07 | POST .../confirm | HN | acknowledgedSoftViolationIds[] | 200 Schedule (409 HARD_VIOLATIONS_EXIST, INVALID_SCHEDULE_STATE) |
| SCH-08 | POST .../confirmation-cancellations | HN | reason | 200 Schedule (400 REASON_REQUIRED, 409 ARCHIVED_SCHEDULE) (결정) |
| SCH-09 | GET .../export.xlsx | HN | - | 200 xlsx |
| SCH-10 | POST .../import-previews | HN | multipart file | 202 ImportPreview (P2, 413, 422) (결정) |
| SCH-11 | PATCH .../import-previews/{previewId} | HN | nurseMappings, dutyMappings | 200 ImportPreview (P2) |
| SCH-12 | POST .../import-previews/{previewId}/apply | HN | baseVersion | 200 Schedule+Violation[] (P2) |
| SCH-13 | POST .../lock | HN | 없음 | 201 ScheduleLock+토큰 (P2, 409 LOCK_ALREADY_HELD) (결정) |
| SCH-14 | DELETE .../lock | 잠금 보유 HN | X-Schedule-Lock-Token | 204 (P2) |
| SCH-15 | POST .../lock/takeover | HN | reason | 200 ScheduleLock+새 토큰 (P2) (결정) |

### 자동 생성
| ID | 요청 | 권한 | 입력 | 성공 |
|---|---|---|---|---|
| GEN-01 | POST /wards/me/schedules/{id}/generations | HN | fixedCells[], maxSeconds | 202 GenerationJob (409 GENERATION_ALREADY_RUNNING, 422 PRECONDITION_FAILED) (결정) |
| GEN-02 | GET /wards/me/generations/{jobId} | HN | - | 200 GenerationJob (결정) |
| GEN-03 | POST .../{jobId}/stop | HN | applyBestResult | 200 GenerationJob 또는 Schedule |
| GEN-04 | POST .../{jobId}/relaxations | HN | relaxationIds[] | 202 새 GenerationJob (결정) |
| GEN-05 | POST .../{jobId}/partial-result/apply | HN | baseVersion | 200 Schedule+Violation[] |

### 신청
| ID | 요청 | 권한 | 입력 | 성공 |
|---|---|---|---|---|
| REQ-01 | POST /wards/me/requests | 구성원 | type, targetDates, reasonCode, reasonDetail, preferredDuty | 201 WorkRequest (409 DUPLICATE_REQUEST, 422 REQUEST_LIMIT_EXCEEDED) (결정) |
| REQ-02 | GET /wards/me/requests/me | 구성원 | yearMonth, type, status, page, size | 200 WorkRequest[]+meta |
| REQ-03 | GET /wards/me/requests | HN | applicantId, yearMonth, type, status, page, size | 200 WorkRequest[]+meta |
| REQ-04 | GET /wards/me/requests/{id} | 신청자/HN | - | 200 WorkRequest |
| REQ-05 | POST .../{id}/approve | HN | 없음 | 200 WorkRequest+scheduleImpact (409 REQUEST_ALREADY_PROCESSED, SCHEDULE_CONFIRMED) |
| REQ-06 | POST .../{id}/reject | HN | reason | 200 WorkRequest (400 REASON_REQUIRED) |
| REQ-07 | POST .../{id}/cancel | 신청자 본인 | 없음 | 200 WorkRequest (409 SCHEDULE_CONFIRMED, REQUEST_NOT_CANCELLABLE) |

### 알림·감사 (P2 / P1)
| ID | 요청 | 권한 | 입력 | 성공 |
|---|---|---|---|---|
| NOTI-01 | GET /me/notifications | 인증 | unreadOnly, type, page, size | 200 Notification[]+meta (P2) (결정) |
| NOTI-02 | PATCH /me/notifications/{id} | 소유자 | read | 200 Notification (P2) |
| NOTI-03 | GET /me/notification-settings | 인증 | - | 200 NotificationSettings (P2) |
| NOTI-04 | PATCH /me/notification-settings | 인증 | scheduleConfirmed, scheduleCancelled, requestResult, dutyReminder, webPush | 200 NotificationSettings (P2, 422 PUSH_NOT_SUPPORTED) (결정) |
| SEC-01 | GET /wards/me/audit-logs | HN | from, to, actorId, actionType, page, size | 200 AuditLog[]+meta |

명세에 **없는** 것: 통계·공정성 조회(statsApi는 항상 빈 결과를 돌려주고 화면은 빈 상태를 보여 준다), 월별 보기 전용 API, 자동 생성 예상 시간 등. (Figma 화면은 있으나 API 없음 → 백엔드에 확인 필요)

## 데이터 모델
- UserSummary: id, name, email, accountStatus
- MeResponse: user, membership(null 가능), ward(null 가능)
- Membership: id, wardId, userId, role, status, joinedAt
- Ward: id, hospitalName, wardName, requiredStaff {D,E,N}, createdAt
- Nurse: id, name, role, dutyRole, status, joinedAt, careerMonths, skillLevel, affiliationStart, affiliationEnd, preceptorOf, version
- Rule: id, code, name, severity, enabled, parameters, version
- Schedule: id, yearMonth, status, version, nurses[], cells[], coverage[], statistics[], confirmedAt
- ScheduleCell: nurseId, date, dutyCode, editable
- Violation: id, severity, ruleId, nurseId, date, currentValue, message
- Coverage: date, dutyCode, actualCount, requiredCount, status UNDER|MET|OVER
- GenerationJob: id, scheduleId, status, stage, elapsedSeconds, progress, hardViolationCount, metrics, conflicts, relaxations
- WorkRequest: id, applicantId, type, targetDates, reasonCode, reasonDetail, preferredDuty, status, processorId, processedAt, rejectionReason
- Notification: id, type, title, body, read, createdAt, resourceType, resourceId
- AuditLog: id, occurredAt, actorId, actionType, targetType, targetId, before, after
- PageMeta, ErrorResponse

### 주요 요청 필드 제약
- SignupRequest: name 1~50자, email 형식·고유, password 8자 이상 영문+숫자, termsAgreed=true
- NurseCreate: name 1~50, dutyRole(CHARGE|PRECEPTOR|NEW|GENERAL), status(ACTIVE|PREGNANT|ON_LEAVE|RETIRED), joinedAt, careerMonths ≥0, skillLevel 1~5, affiliationStart, affiliationEnd(null 가능, 시작일 이후), preceptorOf(같은 병동 NEW만)
- ScheduleCellBulkPatch: baseVersion, changes[1건 이상, 원자적] / change: nurseId, date, dutyCode(D,E,N,O,AL,ED,null) — **AL 직접 입력 금지**
- WorkRequestCreate: type(ANNUAL_LEAVE|PREFERRED_OFF|PREFERRED_SHIFT), targetDates(중복 불가, 같은 월), reasonCode, reasonDetail(ETC일 때 필수), preferredDuty(PREFERRED_SHIFT일 때 D/E/N)
- GenerationStart: fixedCells[], maxSeconds(서버 상한 이내)

## 열거형
Membership.role HEAD_NURSE|NURSE / Schedule.status DRAFT|GENERATING|CONFIRMED|ARCHIVED / dutyCode D,E,N,O,AL,ED,null / Rule.severity HARD|SOFT / Request.status PENDING|APPROVED|REJECTED|CANCELLED / GenerationJob.status QUEUED|RUNNING|SUCCEEDED|STOPPED|NO_SOLUTION|FAILED

## 표준 오류 코드
400 VALIDATION_ERROR · 401 UNAUTHENTICATED · 403 FORBIDDEN · 404 RESOURCE_NOT_FOUND · 409 VERSION_CONFLICT / INVALID_RESOURCE_STATE · 413 FILE_TOO_LARGE · 422 BUSINESS_RULE_VIOLATION · 423 SCHEDULE_LOCKED · 429 RATE_LIMITED · 500 INTERNAL_ERROR

## 수용 기준 (프론트 관련)
일반 간호사는 초안·타인 민감 필드를 받지 못한다 / 하드 위반이 있으면 확정 실패 / 모든 오류에 traceId와 안정적 오류 코드.
