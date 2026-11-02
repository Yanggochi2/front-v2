# Router (초안)

> Figma 화면 이름 기준으로 새로 정한 경로다. 경로 이름은 추측이며 팀 확정 시 수정한다.

## 사이드바 있음 — `src/app/(app)/`
| 경로 | 화면 | Figma 프레임 |
|---|---|---|
| `/schedule` | 근무표 시트 | v3.1-A, 근무표 시트 · 빈 표, 빈 상태 · 근무표 |
| `/schedule/generate` | 자동 생성 시작(`?ym=`) · 진행(`?jobId=`) | 자동 생성 진행 (시작 화면은 시안 없음) |
| `/schedule/generate/failed` | 생성 실패 · 해 없음 | 생성 실패 · 해 없음 |
| `/nurses` | 간호사 명단 | 간호사 명단, 빈 상태 · 간호사 명단 |
| `/nurses/new` | 간호사 등록 | 간호사 등록 |
| `/nurses/[nurseId]/edit` | 간호사 정보 수정 | 간호사 등록 화면 확장 |
| `/rules` | 규칙 설정 | 규칙 설정 |
| `/stats` | 통계·공정성 | 통계·공정성, 빈 상태 · 통계·공정성 |
| `/audit-log` | 감사 로그 | 감사 로그, 빈 상태 · 감사 로그 |
| `/ward-settings` | 병동 설정 | 병동 설정 |

월별 보기(`월별 보기 · 사이드바 열림`)는 별도 경로 없이 `/schedule?view=month`(주간/월간 보기 전환)로 둔다.
`/schedule`을 보기·기간 없이 처음 열면 월간으로 열린다. 주간 보기와 주 선택 링크는 `ym`·`week`를 달고 있어 그대로 주간이다.
그 달 근무표가 없으면(404) 자동 생성으로 보내는 안내를 보여 준다.
사이드바 화면은 모두 로그인한 수간호사 화면이다 (10/26 계약, 일반 간호사 계정 없음·역할 구분 없음). 로그인하지 않았으면(401) `/login`, 병동이 없으면 `/onboarding/create-ward`로 보낸다.

## 사이드바 없음 — `src/app/(onboarding)/`
| 경로 | 화면 |
|---|---|
| `/onboarding/create-ward` | 병동 만들기 (`POST /workspaces`). 로그인한 계정이 그 병동의 수간호사가 되고, 만든 뒤 `/schedule`로 간다. 로그인 전이면 `/login`, 이미 병동이 있으면 `/schedule`로 보낸다 |

- 소속 선택·승인 대기·신청·가입 승인·마이페이지(`/onboarding/select-ward`, `/onboarding/pending`, `/requests`, `/approvals`, `/me`)는 10/26 범위 변경으로 없앴다.

## 로그인·회원가입 — `src/app/(auth)/`
| 경로 | 화면 |
|---|---|
| `/login` | 수간호사 로그인. 성공하면 `GET /me`로 병동이 있으면 `/schedule`, 없으면 `/onboarding/create-ward` |
| `/signup` | 수간호사 회원가입. 가입하면 바로 로그인된 상태로 `/onboarding/create-ward`로 간다 |

- 로그아웃은 사이드바 아래 계정 칸에 있다. 로그아웃 후 `/login`.

## 랜딩 — `src/app/(marketing)/`
| 경로 | 화면 |
|---|---|
| `/` | 서비스 소개 랜딩 (3D 배경, 섹션 앵커 #hero ~ #cta) |

## 진입
- 앱의 시작 화면은 `/schedule`이다. 사이드바를 닫았을 때의 로고도 `/schedule`로 간다.
- 랜딩의 "시작하기"는 `/signup`, "로그인"은 `/login`으로 간다.
