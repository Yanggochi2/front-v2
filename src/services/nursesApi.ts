import { apiRequest, apiRequestList } from "@/lib/apiClient";
import type { DutyRole, Nurse, NurseDetail, NurseListResult, NurseStatus } from "@/types/nurses.type";
import type {
  ApiNurse,
  ApiNurseMutationResult,
  NurseCreate,
  NurseListQuery,
  NursePatch,
} from "@/types/nursesApi.type";

const NURSES_PATH = "/wards/me/nurses";
const idempotencyKey = () => crypto.randomUUID();

// "2014-03-01" -> "2014.03"
const ym = (date: string) => `${date.slice(0, 4)}.${date.slice(5, 7)}`;

function periodLabel(n: ApiNurse): string | undefined {
  if (!n.affiliationStart) return undefined;
  return `${ym(n.affiliationStart)} ~ ${n.affiliationEnd ? ym(n.affiliationEnd) : "재직"}`;
}

// 받은 필드만 옮긴다. 없는 필드를 채워 넣지 않는다. 일반 간호사에게 숨긴 필드는 백엔드가 null로 준다.
export function mapNurse(n: ApiNurse): Nurse {
  return {
    id: n.id,
    name: n.name,
    role: n.role,
    dutyRole: n.dutyRole as DutyRole | undefined,
    isPreceptor: n.isPreceptor,
    status: (n.status ?? undefined) as NurseStatus | undefined,
    careerYears: n.careerMonths == null ? undefined : Math.floor(n.careerMonths / 12),
    careerMonths: n.careerMonths == null ? undefined : n.careerMonths % 12,
    skill: n.skillLevel ?? undefined,
    periodLabel: periodLabel(n),
    hasAccount: n.hasAccount,
    inviteActive: n.inviteExpiresAt ? true : undefined,
  };
}

function mapNurseDetail(n: ApiNurse): NurseDetail {
  if (n.joinedYear == null || !n.affiliationStart || n.version === undefined) {
    throw new Error("간호사 상세 정보가 올바르지 않아요.");
  }
  return {
    ...mapNurse(n),
    joinedYear: n.joinedYear,
    preceptorOf: n.preceptorOf ?? [],
    affiliationStart: n.affiliationStart,
    version: n.version,
  };
}

// NUR-02.
// 화면의 정렬·역할 필터·퇴사자 토글은 클라이언트에서 처리하므로 기본값으로 퇴사자까지 받는다.
export async function getNurses(query: NurseListQuery = {}): Promise<NurseListResult> {
  // TODO: 100명을 넘으면 페이지 이동 UI가 필요하다 (meta.totalPages)
  const list = await apiRequestList<ApiNurse>(NURSES_PATH, {
    query: { includeRetired: true, size: 100, ...query },
  });
  const items = list.data.map(mapNurse);
  return { items, activeCount: items.filter((n) => n.status !== "RETIRED").length };
}

// 프리셉터가 맡을 수 있는 신입: 같은 병동의 재직 NEW 간호사 (10/26 계약 2장).
// 불러오지 못하면 null (빈 목록과 구분해, 폼에서 "불러오지 못했어요"로 보여 준다).
export async function getPreceptorCandidates(): Promise<{ id: string; name: string }[] | null> {
  try {
    const list = await apiRequestList<ApiNurse>(NURSES_PATH, { query: { dutyRole: "NEW", size: 100 } });
    return list.data.filter((n) => n.status !== "RETIRED").map((n) => ({ id: n.id, name: n.name }));
  } catch {
    return null;
  }
}

// 근무표 행 정렬용. 근무표 nurses[]에 없는 수간호사 여부·총경력을 NUR-02에서 채운다. 수간호사 화면에서만 부른다.
// 의도한 폴백: 실패하면 빈 맵을 돌려주고, 정렬 정보가 없는 행은 맨 뒤(같으면 이름순)로 간다. 근무표는 그대로 보인다.
// 한계: 100명까지만 받는다. 넘으면 나머지는 정렬 정보 없이 맨 뒤로 간다.
// TODO(Yanggochi2/backend#76): 근무표 응답에 role·careerMonths가 오면 이 요청은 뺀다
export async function getNurseSortInfoMap(): Promise<Map<string, Pick<ApiNurse, "role" | "careerMonths">>> {
  try {
    const list = await apiRequestList<ApiNurse>(NURSES_PATH, {
      query: { includeRetired: true, size: 100 },
    });
    return new Map(list.data.map((n) => [n.id, { role: n.role, careerMonths: n.careerMonths }]));
  } catch {
    return new Map();
  }
}

// NUR-03
export async function getNurse(id: string): Promise<NurseDetail> {
  return mapNurseDetail(await apiRequest<ApiNurse>(`${NURSES_PATH}/${encodeURIComponent(id)}`));
}

// NUR-01 (Idempotency-Key). role은 보내지 않는다.
export async function createNurse(body: NurseCreate): Promise<Nurse> {
  const data = await apiRequest<ApiNurse>(NURSES_PATH, {
    method: "POST",
    body,
    idempotencyKey: idempotencyKey(),
  });
  return mapNurse(data);
}

// NUR-04. role은 보내지 않는다. 응답은 { nurse, violations, warnings }. TODO: violations·warnings 표시는 화면 시안 확정 후
export async function updateNurse(id: string, patch: NursePatch): Promise<Nurse> {
  const data = await apiRequest<ApiNurseMutationResult>(`${NURSES_PATH}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
  return mapNurse(data.nurse);
}

// NUR-05. affiliationEnd는 YYYY-MM-DD. 응답은 { nurse, violations, warnings }
export async function retireNurse(id: string, affiliationEnd: string): Promise<Nurse> {
  const { nurse } = await apiRequest<{ nurse: ApiNurse }>(`${NURSES_PATH}/${encodeURIComponent(id)}/retire`, {
    method: "POST",
    body: { affiliationEnd },
  });
  return mapNurse(nurse);
}
