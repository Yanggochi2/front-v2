# Architecture (초안)

> 이 문서는 프로젝트 세팅 시 새로 작성한 초안이다. 확정이 아닌 부분은 "추측"으로 표시했다.

## 스택
- Next.js (App Router, `src/` 사용) + TypeScript + Tailwind CSS v4
- 폰트: Noto Sans KR (500 / 700), `next/font/google`로 로드
- 상태 관리 라이브러리 없음. local state 우선.

## 폴더 구조
```
src/
  app/                 라우트(page, layout만). 조립만 한다.
    (app)/             사이드바 있는 화면
    (onboarding)/      사이드바 없는 화면 (병동 만들기, 관리 링크 진입 /manage)
    (shared)/          로그인 없이 보는 공유 근무표 (/shared/[token])
    (marketing)/       서비스 소개 랜딩 (/)
  components/
    layout/            Sidebar 등 공통 레이아웃
    ui/                공용 UI (Button, Chip, DutyChip 등)
    <feature>/         화면별 컴포넌트 (schedule, requests, nurses ...)
  constants/           🔶 미확정 값 모음 (xxx.constants.ts, `TODO(🔶 <명세 ID>)` 표시)
  hooks/               useXxx
  services/            요청 함수 (xxxApi.ts). 항상 lib/apiClient.ts로 실제 API를 호출한다.
  types/               xxx.type.ts
```

## 책임
- **page**: 서비스 호출, loading/error/empty 분기, feature 컴포넌트 조립.
- **component**: 하나의 역할. 데이터는 props로 받는다. fetch를 직접 호출하지 않는다.
- **service**: 요청 함수. 데이터는 API에서만 온다. 샘플 데이터나 대체 값을 두지 않는다.

## 데이터와 화면 상태
- 모든 데이터는 API에서만 온다. `NEXT_PUBLIC_API_BASE_URL`이 비어 있으면 모든 요청이 `ApiError`(status 0, code `API_NOT_CONFIGURED`)로 실패해, 백엔드 주소를 설정하기 전에는 각 화면이 오류 화면을 보여 준다.
- loading / error / empty는 실제 API 결과로만 정한다. 빈 목록이면 빈 상태 화면, `ApiError`면 다시 시도가 있는 오류 화면, 로딩은 `loading.tsx`.
- API에 데이터가 없는 항목(통계, 내 근무 통계, 마지막 저장 시각 등)은 빈 상태나 `-`로 보여 준다.

## 화면 범위
- **웹(데스크톱) 전용**이다. 반응형은 하지 않는다. 기준은 화면 캡처(1680px, 사이드바 열림).
- 사이드바 240px 고정, 본문은 `max-w-*`로 가운데 정렬. 표·시트는 자기 컨테이너 안에서 가로 스크롤하고 첫 열은 sticky.
- 모바일/태블릿은 지원하지 않으므로 `sm:`, `md:`, `lg:` 같은 반응형 접두사를 쓰지 않는다.
- 앱 화면((app), (onboarding))은 `.ui-zoom`으로 80% 비율을 쓴다. 랜딩(/)에는 적용하지 않는다.

## 랜딩
- `src/app/(marketing)/page.tsx` + `src/components/landing/*`. 문구·예시는 `src/constants/landing.constants.ts`.
- 3D 배경은 `three`(r128, 시안과 같은 버전)로 `LandingStage`(client)에서 그린다. WebGL이 없으면 배경 그라데이션만 남고, `prefers-reduced-motion`이면 움직임을 줄인다.
- 색·폰트는 `globals.css`의 `landing-*` 토큰과 `@utility landing-*`를 쓴다 (앱 화면 토큰과 분리). 제목 폰트는 Black Han Sans.

## 디자인 토큰
`src/app/globals.css`의 `@theme`에 모았다. 값은 Figma 라이트 화면 기준이며 `docs/design-system.md`와 다른 부분은 Figma를 따랐다.
(예: 포인트 컬러 #a65468, 근무 종류별 칩 색)

## 인증 (관리 링크)
10/26 계약부터 로그인이 없다. 수간호사는 관리 링크(`/manage#token=…`)로 들어온다.
- `lib/managementToken.ts`: 토큰을 이 프론트 출처의 쿠키(SameSite=Strict)에 저장·삭제한다.
- `lib/apiClient.ts`: 브라우저에서는 쿠키를, 서버 컴포넌트에서는 요청 쿠키(`next/headers`)를 읽어 `Authorization: Bearer`로 보낸다. 백엔드는 쿠키를 읽지 않으므로 `credentials: "omit"`.
- (app) 레이아웃은 `GET /wards/me`로 병동 정보를 받는다. 401이면 `/manage`로 보내고, 서버에 닿지 못하면 화면 틀만 보여 준다.
- 역할 구분이 없어 사이드바 메뉴는 하나다 (`hooks/useNavModel.ts`).
- 공유 링크 조회(`services/sharingApi.ts`의 `getSharedSchedule`)는 `anonymous: true`로 불러 관리 토큰을 붙이지 않는다.

## 근무표·자동 생성 서비스
- `services/scheduleApi.ts`(조회·셀 변경·확정·내보내기), `services/generationApi.ts`(자동 생성 GEN-01~05). 항상 실제 API를 호출한다.
- 타입: `types/scheduleApi.type.ts`(API 모델), `types/schedule.type.ts`(화면용). 매핑은 scheduleApi.ts에서 한다.
- 셀 편집 상태는 `hooks/useScheduleEditor.ts`가 맡는다. 셀 변경 시 화면을 먼저 바꾸고 `patchScheduleCells`로 저장한다(실패 시 되돌림). 되돌리기/다시 실행 스택은 클라이언트 메모리이고 단축키는 Ctrl/⌘+Z, Ctrl+Y(⌘+Shift+Z). 연차(AL)는 표시만 하고 직접 입력하지 않는다 (10/26 계약에서 직접 입력이 열려, #66에서 바꾼다).
- 확정·확정 취소는 `ScheduleBottomBar`에서 한다. 하드 위반이 1건이라도 있으면 확정 버튼을 막는다. 성공하면 `router.refresh()`로 다시 불러오고, 시트는 근무표 버전이 바뀌면 새로 그려진다(page의 key).
- 자동 생성: `/schedule/generate`에 `?jobId=`가 없으면 시작 화면(달 고르기), 있으면 진행 화면이다. 시작은 `useGenerationStart` 훅이 맡는다. 그 달 근무표가 없으면 빈 근무표(SCH-01)를 만든 뒤 GEN-01을 부르고, 응답 상태에 따라 근무표 / 진행 / 실패 화면으로 보낸다(`generationHref`). 지금 백엔드는 요청 안에서 생성을 끝내 바로 SUCCEEDED가 올 수 있다.
- 진행 화면은 `GenerationPoller`가 `GENERATION_POLL_MS`마다 GEN-02를 확인한다. 진행 중이면 `router.refresh()`로 단계·지표를 갱신하고, 끝나면 결과 화면으로 옮긴다.
