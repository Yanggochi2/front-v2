import { ApiError } from "@/lib/apiClient";
import { todayKst } from "@/lib/schedulePeriod";
import type { NurseCreate } from "@/types/nursesApi.type";
import type { NurseDetail, NurseDraft, NurseDraftErrors, NurseDraftField } from "@/types/nurses.type";

// 백엔드 계약(docs/client-1026-api.md 2장)과 같은 범위. 입사 연도는 1900 ~ 한국 기준 올해.
const MIN_JOINED_YEAR = 1900;
const NAME_MAX_LENGTH = 50;
const isWholeNumber = (v: string) => /^\d+$/.test(v.trim());

// 보내기 전에 칸별로 검사한다. 빈 객체면 보내도 된다.
export function validateNurseDraft(d: NurseDraft): NurseDraftErrors {
  const errors: NurseDraftErrors = {};
  const thisYear = Number(todayKst().yearMonth.slice(0, 4));
  if (!d.name.trim()) errors.name = "이름을 입력해 주세요.";
  else if (d.name.trim().length > NAME_MAX_LENGTH) errors.name = `이름은 ${NAME_MAX_LENGTH}자까지 쓸 수 있어요.`;
  if (!d.hireYear.trim()) errors.hireYear = "입사 연도를 입력해 주세요.";
  else if (!isWholeNumber(d.hireYear) || Number(d.hireYear) < MIN_JOINED_YEAR || Number(d.hireYear) > thisYear)
    errors.hireYear = `입사 연도는 ${MIN_JOINED_YEAR}년부터 ${thisYear}년까지 넣을 수 있어요.`;
  const years = d.careerYears.trim() || "0";
  const months = d.careerMonths.trim() || "0";
  if (!isWholeNumber(years) || !isWholeNumber(months) || Number(months) > 11)
    errors.career = "총 경력은 0년 이상, 개월은 0~11 사이로 넣어 주세요.";
  if (!d.periodStart) errors.periodStart = "소속 시작일을 골라 주세요.";
  return errors;
}

// 서버가 칸 단위로 거절했을 때(400 VALIDATION_ERROR fieldErrors) 화면의 칸으로 옮긴다. 옮기지 못한 것은 빈 객체.
const SERVER_FIELD: Record<string, NurseDraftField> = {
  name: "name",
  joinedYear: "hireYear",
  careerMonths: "career",
  affiliationStart: "periodStart",
};
export function serverNurseErrors(e: unknown): NurseDraftErrors {
  const errors: NurseDraftErrors = {};
  if (!(e instanceof ApiError)) return errors;
  for (const f of e.fieldErrors ?? []) {
    const field = SERVER_FIELD[f.field];
    if (field && !errors[field]) errors[field] = `서버가 이 값을 받지 않았어요 (${f.reason}). 다시 확인해 주세요.`;
  }
  return errors;
}

export function emptyNurseDraft(name = ""): NurseDraft {
  return {
    name,
    hireYear: "",
    dutyRole: "GENERAL",
    isPreceptor: false,
    preceptorOf: [],
    careerYears: "0",
    careerMonths: "0",
    skill: 3,
    status: "ACTIVE",
    periodStart: "",
  };
}

// 권한(role)은 담지 않는다. 새로 등록하는 간호사는 항상 일반 간호사다.
export function toNurseCreate(d: NurseDraft): NurseCreate {
  return {
    name: d.name.trim(),
    dutyRole: d.dutyRole,
    status: d.status,
    joinedYear: Number(d.hireYear),
    isPreceptor: d.isPreceptor,
    // 프리셉터가 아니면 담당 신입을 비운다 (아니면 422 INVALID_PRECEPTOR)
    preceptorOf: d.isPreceptor ? d.preceptorOf : [],
    careerMonths: Number(d.careerYears || 0) * 12 + Number(d.careerMonths || 0),
    skillLevel: d.skill,
    affiliationStart: d.periodStart,
  };
}

// 받지 못한 필드는 폼에 기본값으로 채워지므로, 수정할 때는 처음 값에서 바뀐 필드만 보낸다.
// 그래야 건드리지 않은 칸의 기본값이 서버 값을 덮어쓰지 않는다.
export function toNursePatch(initial: NurseDraft, current: NurseDraft): Partial<NurseCreate> {
  const before = toNurseCreate(initial);
  const after = toNurseCreate(current);
  const patch: Partial<NurseCreate> = {};
  (Object.keys(after) as (keyof NurseCreate)[]).forEach((key) => {
    // 담당 신입 목록은 배열이라 순서를 맞춰 값으로 비교한다
    const same = Array.isArray(after[key])
      ? JSON.stringify([...(after[key] as string[])].sort()) === JSON.stringify([...((before[key] as string[]) ?? [])].sort())
      : after[key] === before[key];
    if (!same) Object.assign(patch, { [key]: after[key] });
  });
  return patch;
}

export function toNurseDraft(nurse: NurseDetail): NurseDraft {
  return {
    name: nurse.name,
    hireYear: String(nurse.joinedYear),
    dutyRole: nurse.dutyRole ?? "GENERAL",
    isPreceptor: nurse.isPreceptor ?? false,
    preceptorOf: nurse.preceptorOf,
    careerYears: String(nurse.careerYears ?? 0),
    careerMonths: String(nurse.careerMonths ?? 0),
    skill: nurse.skill ?? 3,
    status: nurse.status ?? "ACTIVE",
    periodStart: nurse.affiliationStart,
  };
}
