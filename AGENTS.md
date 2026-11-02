# AGENTS.md — Ottugi(오뚜기) 프론트엔드

이 파일은 프론트엔드 레포지토리에서 AI 에이전트와 개발자가 어떤 기준으로 작업해야 하는지 정의한다.
구현은 임의 판단이 아니라, 이미 작성된 프로젝트 문서를 기준으로 진행한다.

## 1. 프로젝트
- 간호사 병동 근무표 서비스. 수간호사가 로그인해서 근무표를 만들고, 일반 간호사는 계정 없이 공유 링크로 확정본을 본다.
- **10/26 범위 변경**: 5차 클라이언트 미팅(10/26)으로 일반 간호사 로그인·가입(초대·승인)·온라인 신청·알림이 빠졌다. 수간호사 로그인은 남는다. 이 부분은 명세서 v1.0 대신 백엔드 계약 `Yanggochi2/backend` `docs/client-1026-api.md`를 따른다. 명세서가 개정되면 그쪽을 기준으로 다시 맞춘다.
- 서비스 이름은 **Ottugi**. 이전 임시 이름 DutyBoard는 쓰지 않는다.
- **프론트엔드 기술 스택은 Next.js + Tailwind CSS**다. (라우터 방식, 폴더 구조, Tailwind 버전과 설정 위치는 `docs/Architecture.md`와 `docs/router.md`, 기존 코드를 따른다. 문서에 없으면 추측하지 않는다.)
- 화면 UI는 `docs/screens/`의 화면 캡처 이미지를 기준으로 구현한다. (디자인 토큰·스타일 규칙 문서는 두지 않는다.)
- 스타일링은 **Tailwind CSS**로 한다. 기존에 쓰는 utility 조합과 설정에 있는 값(색, 간격 등)을 먼저 재사용하고, 임의 값(`[#123456]`, `[13px]` 같은 대괄호 값)은 꼭 필요할 때만 쓴다. 다른 스타일링 방식(CSS Module, styled-components 등)을 새로 들이지 않는다.

## 1-1. 작업 범위 (중요)
- **이 레포는 프론트엔드 전용이다.** 화면 구현과, 기존 API 클라이언트·서비스 계층을 거친 API 연동이 이 레포의 일이다. 백엔드(엔드포인트, 비즈니스 로직, DB)는 별도 레포에서 만든다. (12-2 참고)
- **API를 직접 만들지 않는다.** 아래는 모두 금지한다.
  - Next.js의 서버 API 코드 (`app/api/**`의 Route Handler, `pages/api/**` 등)
  - 비즈니스 로직이나 DB 접근을 하는 Server Action, 서버 코드
  - 인증, 권한 판정, 데이터 저장을 프론트 서버에서 흉내 내는 코드
  - 백엔드가 있는 것처럼 보이는 가짜 서버(json-server, MSW 핸들러를 서비스 코드로 남기는 것 포함)
- 백엔드로 요청을 넘기는 것은 지금처럼 `next.config.ts`의 rewrites(`/api/v1` → `BACKEND_ORIGIN`)로 한다. 프록시용 Route Handler를 따로 만들지 않는다.
- **mock data를 쓰지 않는다.** 데이터는 항상 API에서 받는다. 9번 규칙을 따른다.
- API 연동은 `docs/API.md`와 기존 타입(`src/types/*Api.type.ts`)을 기준으로, `src/lib/apiClient.ts`와 서비스 계층(`src/services`)을 거쳐 한다. 요청 함수, 타입, loading/error/empty 처리를 함께 만든다.
- 백엔드 명세가 필요한 판단(응답 필드 이름, 에러 코드, 인증 방식 등)은 만들어 내지 않는다. "백엔드 확정 후 결정"이라고 `TODO`로 남긴다.

## 2. 반드시 참고해야 하는 문서
코드를 생성하거나 수정하기 전에 아래를 먼저 확인한다.

- `docs/Architecture.md` — 폴더 구조, 컴포넌트 분리 기준, 페이지 구조, API 연동 흐름, 상태 관리, page/component/hook/service 책임
- `docs/router.md` — 페이지 경로, route 이름, 중첩 라우트, 페이지별 책임, 네비게이션 흐름, 보호 라우트, 라우트별 레이아웃
- 기능 명세서 v0.2 (Notion "병동 근무표 서비스 기능 명세서 v0.2") — 기능·권한·상태 규칙의 기준
- `docs/screens/` — 화면 캡처 (UI 기준)

문서에 없는 구조를 임의로 만들지 않는다. 필요한 규칙이 문서에 없으면 기존 코드베이스에서 가장 가까운 패턴을 따른다.

## 3. 개발 원칙
### 3.1 문서 우선
1. Architecture.md에서 구조와 책임 범위를 확인한다.
2. router.md에서 라우트와 페이지 책임을 확인한다.
3. 기능 명세서에서 해당 기능의 입력, 처리, 출력, 권한, 예외를 확인한다.
4. 화면 캡처에서 UI를 확인한다.
5. 그 후 코드를 작성한다.

구현 중 문서와 충돌하면 코드를 먼저 바꾸지 말고 관련 문서를 먼저 수정한다.

### 3.2 추측하지 않는다
폴더 이름, 컴포넌트 이름, 라우트 경로, API 호출 방식, 페이지 책임, 상태 관리 방식은 임의로 정하지 않는다.
확실하지 않으면 "알 수 없음"이라고 쓰고, 추측이면 "추측"이라고 밝힌다.

### 3.3 기존 코드 스타일 유지
추가 전에 주변 파일을 보고 import 방식, 파일명, 컴포넌트 구조, 스타일링 방식, hook·API service 사용 방식, 에러·로딩 처리 방식을 맞춘다.

## 4. 구현 규칙
### 4.1 Page
- 페이지 단위 조립에 집중한다: 라우트 레이아웃, feature section 조립, 페이지 단위 데이터 로딩, 로딩/에러/빈 상태 처리.
- 재사용 가능한 UI 로직을 Page에 과도하게 넣지 않는다.

### 4.2 Component
- 하나의 component는 하나의 명확한 역할을 가진다.
- 관련 없는 UI 영역, 여러 비즈니스 흐름, API 호출, 라우팅 로직을 넣지 않는다.
- 커지면 작게 나눈다.

### 4.3 Hook
- 데이터 요청, form 처리, modal 상태, filter, pagination, 재사용 가능한 interaction 로직에 쓴다.
- JSX 중심의 마크업을 넣지 않는다.

### 4.4 API 연동
- API 호출은 UI 컴포넌트와 분리한다. 깊은 컴포넌트에서 fetch/axios를 직접 호출하지 않는다.
- API/service 계층이 있으면 그 구조를 우선 쓴다.
- 요청 함수, 응답 처리, 에러, 로딩, 빈 데이터 상태를 항상 고려한다.
- 요청 함수는 항상 `src/lib/apiClient.ts`로 실제 API를 호출한다. 호출 주소는 코드에 박지 않고 환경 변수로 분리한다.

### 4.5 상태 관리
- 작은 UI 상태는 local state. 멀리 떨어진 컴포넌트나 여러 페이지가 공유할 때만 shared state.
- 명확한 이유 없이 상태 관리 라이브러리를 추가하지 않는다.

## 5. 라우팅 규칙
- 라우트 작업은 router.md 기준. 새 페이지는 (1) router.md에 route가 있는지 확인 → (2) route 책임에 맞게 page 생성 → (3) router에 연결 → (4) 구조가 바뀌었으면 router.md 수정.
- 임시 route, 중복 route를 만들지 않는다. 개발용이 꼭 필요하면 주석으로 명확히 표시한다.
- **진입 분기**를 router.md 기준으로 처리한다.
  - 로그인 안 함(401 `UNAUTHENTICATED`) → `/login` (가입은 `/signup`)
  - 로그인했지만 병동 없음 → `/onboarding/create-ward`
  - 병동 있음 → 근무표
  - 일반 간호사 → 계정 없이 공유 링크로 확정본만 본다

## 5-1. 화면 범위 (웹 전용)
- 서비스는 **웹(데스크톱) 전용**이다. 반응형(모바일·태블릿)은 하지 않는다. Tailwind 반응형 접두사(`sm:`, `md:`, `lg:` 등)를 쓰지 않는다.
- 화면 캡처는 데스크톱(사이드바 열림) 기준이다. 본문은 `max-w-*`와 flex/grid로 만들고, 표와 근무표 시트는 자기 컨테이너 안에서만 가로 스크롤한다. 첫 열(이름)은 고정(sticky)한다.
- 터치 요소(버튼, 칩, 메뉴)의 크기를 캡처보다 줄이지 않는다. 사용자 중 40~50대가 많다.
- 근무표 시트의 하단 커버리지 행은 세로 스크롤에서도 보여야 한다(SCH-05).

## 6. 이 서비스 고유 규칙 (기능 명세서 기준)
### 6.1 권한·보안
- 병동과 권한(수간호사)은 서버가 세션에서 판정한다. **요청 본문에 role, 병동 ID를 담아 보내지 않는다.**
- 본인 리소스는 식별자 대신 `me`를 쓴다. 타인 식별자로 조회하는 경로를 만들지 않는다.
- 화면 분기(메뉴, 버튼 노출)는 UI 편의일 뿐이다. 데이터 차단은 서버가 한다. 클라이언트는 **받은 필드만 표시**하고, 없는 필드(예: 일반 간호사 응답의 숙련도·경력·상태)를 있다고 가정하지 않는다.
- 토큰은 쿠키(HttpOnly)로 전달된다. 코드에서 localStorage, 요청 본문, 쿼리스트링으로 토큰을 다루지 않는다. 상태 변경 요청에는 `CSRF_TOKEN` 쿠키 값을 `X-CSRF-Token`으로 보낸다 (`apiClient`).
- 인증 정보와 비밀키(API 키, 비밀번호, 토큰 값 등)를 소스 코드에 직접 쓰지 않는다. 필요한 값은 환경 변수로 둔다.
- 일반 간호사에게는 초안(DRAFT) 근무표를 보여주지 않는다. 공유 링크는 확정본(CONFIRMED/ARCHIVED)에만 만들어진다.

### 6.2 근무표 도메인
- 근무표 상태: `DRAFT` → `GENERATING` → `DRAFT`, `DRAFT` ↔ `CONFIRMED`, 이후 `ARCHIVED`. 편집 가능 여부는 상태로 제어한다. `GENERATING` 중에는 누구도 편집할 수 없다.
- 듀티 코드: `D`, `E`, `N`, `O`(비번), `AL`(연차), `ED`(교육·학회). 10/26 계약부터 수간호사가 종이 달력을 보고 AL·ED도 직접 넣고, 자동 생성은 AL·ED를 항상 남긴다. 빈 값(null)은 **미배정**이며 `O`와 다르다. 커버리지 계산에서 미배정은 인원으로 세지 않는다.
- 소속 기간 밖 날짜 칸은 비활성이며 편집·배정할 수 없다.
- **Undo/Redo는 클라이언트 메모리 스택으로 구현한다.** 서버 API를 만들지 않는다. 저장·새로고침 시 스택은 초기화된다.
- 확정은 하드 위반이 0건일 때만 가능하다. 위반 목록은 서버 응답의 형식을 그대로 쓴다.

### 6.3 미확정(🔶) 항목 — 구현 자체를 보류한다
- 🔶 항목(기능명세서 v1.0 12장 "제품 결정이 필요한 항목" D-01~D-17, API 명세서의 "결정 필요: 예" 표시 엔드포인트, `docs/open-questions.md`에 모아 둔 항목)은 **"TODO로 표시하면 구현해도 된다"는 뜻이 아니다.** 제품 책임자 승인 전까지는 해당 **기능/화면 자체를 새로 만들지 않는다.**
- 이미 값 하나가 필요한 곳(예: 세션 만료 시간, 잠금 자동 해제 시간처럼 기존에 구현된 기능이 돌아가기 위한 설정값)만 권장안을 **설정 기본값**으로 두고 `// TODO(🔶 <결정 ID 또는 명세 ID>)`로 표시한다. 그 값 때문에 새 화면·새 플로우·새 API 연동을 만들어내지 않는다.
- 판단 기준: "이 기능이 지금 꼭 있어야 레포가 돌아가는가, 아니면 결정이 나기 전에는 아예 없어도 되는가"를 먼저 물어본다. 없어도 되면 만들지 않는다. 화면 캡처(`docs/screens/`)나 router.md에 라우트가 없다면 "아직 결정 안 됨"으로 보고 임의로 라우트·화면을 추가하지 않는다.
- 예시: 다중 병동 소속(D-01), 교육 ED 듀티(D-02), 소셜 로그인 제공자(D-03), 가입 코드 시도 제한(D-04), OFF 목표 계산식(D-07), 필요 인원 평일/주말/공휴일 구분(D-08), 엑셀 업로드 크기(D-09), 자동 생성 제한 시간(D-11), 진행률 전달 방식(D-12), 하드 제약 충돌 우선순위(D-13), 희망 신청 한도·사유 코드(D-14), 웹 푸시(D-15) 등은 **화면/로직을 만들지 않고** 관련 작업이 들어오면 `docs/open-questions.md`에 결정 필요 항목으로만 남긴다.
- 이미 TODO로 자리만 만들어 둔 기존 코드(예: `src/services/authApi.ts`의 `refreshSession`, rules/off-target 관련 함수)는 "자리만 있고 화면은 없다"는 현재 상태를 유지한다. 화면 캡처나 명세가 새로 나오기 전까지 그 자리를 근거로 화면을 만들지 않는다.
- 회의록·클라이언트 메모 등 비공식 메모에만 나오고 기능명세서/API 명세서 12장·"결정 필요" 표시에 없는 내용도 동일하게 미확정으로 취급한다. 메모에만 있고 명세서에 없는 요구는 구현 근거가 아니다.

### 6.4 화면 상태
- 모든 데이터 화면은 loading / error / empty를 처리한다. 빈 상태 화면 캡처가 `docs/screens/`에 있다.
- 로그인·회원가입과 병동 만들기는 사이드바 없는 별도 레이아웃이다.

## 7. 파일 및 네이밍
기존 코드베이스 규칙을 따른다. 기본 권장은 아래와 같다.
- Page: `PageNamePage` / Component: `ComponentName` / Hook: `useFeatureName` / API: `featureApi`(또는 기존 convention) / Type: `feature.type`(또는 기존 convention)
- 같은 디렉토리 안에서 네이밍 스타일을 섞지 않는다.

## 8. 코드 품질
피할 것: 사용하지 않는 import·변수, 중복 컴포넌트, 샘플·가짜 데이터 하드코딩, 과도한 주석, 요청 범위를 벗어난 리팩토링, 관련 없는 파일 수정.
권장: 작은 컴포넌트, 명확한 이름, 책임 분리, 예측 가능한 데이터 흐름, 단순한 에러 처리, 일관된 포맷팅.
별도 요청이 없으면 실제 서비스에 들어갈 수 있는 수준으로 작성한다.

## 9. 데이터 규칙 (mock 금지)
- mock data, 샘플 행, 가짜 이름·병원명·건수, `?state=`·`?role=` 같은 미리보기 스위치를 두지 않는다. 데이터는 항상 서비스 계층이 API로 받아 온다.
- 페이지·컴포넌트는 `fetch`/axios를 직접 호출하지 않는다. 서비스 함수(`src/services`)를 거친다.
- API에 없는 데이터는 지어내지 않고 빈 상태나 `-`로 보여 준다. 필요한 명세가 없으면 `TODO`로 남긴다.
- 화면 안내 문구, 폼 기본값, 🔶 미확정 값은 `constants`에 둘 수 있다. 서버 데이터인 척하는 샘플 값은 안 된다.

## 10. API 연동 작업 흐름
> API 명세는 `docs/API.md`에 있다. 서비스 계층은 `src/lib/apiClient.ts`로 `NEXT_PUBLIC_API_BASE_URL`의 서버를 호출한다. 주소가 비어 있으면 모든 요청이 `API_NOT_CONFIGURED` `ApiError`로 실패하고 화면은 오류 상태를 보여 준다. 명세에 없는 필드·동작은 만들지 않고 `TODO`로 남긴다.

1. router.md에서 페이지 책임 확인
2. Architecture.md에서 API 연동 위치 확인
3. 기존 API/service 패턴 확인
4. 요청 함수 작성
5. page 또는 hook에서 데이터 연결
6. loading, error, empty를 실제 API 결과로 처리

## 11. 문서 업데이트 규칙
- **Architecture.md**: 폴더 구조, 계층, API 연동 방식, 상태 관리 방식, 컴포넌트 책임 기준, 화면 범위 기준이 바뀔 때
- **router.md**: route 추가·삭제·경로 변경, page 책임 변경, navigation flow 변경, 보호 라우트 정책 변경
- **docs/screens/**: 화면 캡처가 바뀌면 교체한다 (파일명은 화면 이름 + 라이트/다크)

문서와 코드가 다르면 문서를 신뢰할 수 없게 되므로, 구조가 바뀌면 문서도 함께 바꾼다.

## 12. AI Agent 작업 방식
바로 코드를 쓰지 않는다. 먼저 (1) 관련 문서, (2) 수정할 파일, (3) 따라야 할 기존 패턴, (4) 문서 수정 필요 여부, (5) 구현 후 확인 항목을 정리하고 계획을 세운다.

1. 관련 문서 확인 → 2. 기존 코드 구조 확인 → 3. 구현 계획 → 4. 코드 수정 → 5. 문서 수정 여부 확인 → 6. 최종 변경 요약

보고는 한국어로 짧고 직접적으로 한다. 직접 확인하지 못한 것은 확인하지 못했다고 쓴다.

## 12-1. Scope Restriction Rules

- Only modify files and folders directly related to the requested task.
- Do not touch unrelated files, folders, modules, or configurations.
- Keep changes minimal and preserve the existing code structure and architecture.
- Do not perform unrelated refactoring, formatting, renaming, or cleanup.
- Never overwrite, revert, delete, or discard existing user changes.
- Create new files only when necessary.
- Before expanding the scope, verify that the additional changes are essential.
- After completing the task, review the diff and ensure no unrelated files were modified.
- Run relevant tests or checks when possible.

**Core Rule: Make only the changes necessary to complete the requested task. Leave everything else untouched.**

## 12-2. API Integration Rules

### Scope
- This is a frontend-only repository. Do not implement backend endpoints, backend business logic, or database access.
- Frontend API integration is allowed through the existing API client and service layers (`src/lib/apiClient.ts`, `src/services/`).
- Do not create a duplicate API client or bypass the existing service layer without a clear requirement.

### Errors and empty data
- Never treat API failures as successful empty results.
- Keep loading, empty, error, and offline states distinct.
- Do not present fabricated or fallback business data as successfully retrieved API data.

### Unconfirmed API specifications
- Do not guess undocumented API fields, response formats, status values, or business rules.
- Check the current API documentation (`docs/API.md`) and existing types (`src/types/`) before changing API integration code.
- If required information is missing, preserve existing behavior where possible and document the unresolved issue (a `TODO` in code; product decisions go to `docs/open-questions.md`).

### Domain constants and defaults
- Do not change domain constants, rule codes, or default values (e.g. `src/constants/ruleTemplates.ts`) without checking the relevant specifications.
- Keep frontend representations consistent with the backend contract and existing project documentation.

## 13. 금지 사항
- 문서를 확인하지 않고 라우트 추가
- 기존 구조와 다른 폴더 구조 생성
- 하나의 컴포넌트에 과도한 책임 부여
- API 호출 로직을 여러 컴포넌트에 중복 작성
- Next.js 서버 API(Route Handler 등), 서버 로직, 가짜 백엔드를 직접 만드는 것
- mock·샘플 데이터를 코드에 두기
- 요청받지 않은 대규모 리팩토링, 관련 없는 파일 수정
- role·병동 ID를 요청 본문에 담기, 토큰을 쿠키 밖에서 다루기
- 🔶 항목을 확정값처럼 하드코딩
- 🔶 항목(결정 필요 D-01~D-17, API 명세서 "결정 필요: 예" 항목)을 승인 전에 화면·플로우·API 연동으로 구현하는 것
- 화면 캡처나 router.md에 없는 라우트를 회의록·메모만 근거로 새로 만드는 것
- 문서와 코드의 불일치 방치

## 14. 작업 완료 전 체크리스트
- [ ] Architecture.md 기준을 따랐는가?
- [ ] router.md 기준을 따랐는가?
- [ ] 기능 명세서의 권한·상태 규칙을 따랐는가?
- [ ] 화면 캡처(docs/screens/)와 일치하는가?
- [ ] 기존 코드 스타일과 일관되는가?
- [ ] 불필요한 import나 변수가 없는가?
- [ ] loading / empty / error / offline을 구분해 처리했는가? (API 실패를 0건·빈 목록처럼 보여 주지 않는가?)
- [ ] 백엔드 API·서버 로직을 직접 만들지 않았는가? (API 연동은 apiClient·서비스 계층으로만 했는가?)
- [ ] mock·샘플 데이터가 코드에 없고, 페이지·컴포넌트가 fetch를 직접 호출하지 않는가?
- [ ] 🔶 항목이 TODO로 표시돼 있는가?
- [ ] route 변경이 있다면 router.md를 수정했는가? 구조 변경이 있다면 Architecture.md를 수정했는가?

## 15. 기본 원칙 요약
문서를 먼저 확인한다. 기존 구조를 따른다. 라우터 문서를 기준으로 페이지를 만든다. 권한은 서버가 정하고 화면은 받은 것만 보여준다. 이 레포는 프론트엔드(화면과 API 연동)만 하고 백엔드 API는 만들지 않는다. API 로직은 UI와 분리한다. 컴포넌트는 작고 명확하게 유지한다. 구조가 바뀌면 문서도 함께 바꾼다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
