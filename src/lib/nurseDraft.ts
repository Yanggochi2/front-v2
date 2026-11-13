import { ApiError } from "@/lib/apiClient";
import { todayKst } from "@/lib/schedulePeriod";
import type { NurseCreate } from "@/types/nursesApi.type";
import type { NurseDetail, NurseDraft, NurseDraftErrors, NurseDraftField } from "@/types/nurses.type";

// 백엔드 계약(docs/client-1026-api.md 2장)과 같은 범위. 입사 연도는 1900 ~ 한국 기준 올해.
const MIN_JOINED_YEAR = 1900;
const NAME_MAX_LENGTH = 50;
const isWholeNumber = (v: string) => /^\d+$/.test(v.trim());

// 경력 몇 개월까지 신입으로 보고 숙련도를 1~2로 묶는지 (7차 미팅, 11/13 계약)
export const NEW_CAREER_MAX_MONTHS = 3;

// 입사 월은 받지 않으므로, 입사 연도로 가능한 총 경력(개월) 범위. 백엔드 nurses.experience_values와 같은 식이다.
// 최대: 그해 1월 입사, 최소: 그해 12월 입사 (올해 입사면 0).
export function careerRange(joinedYear: number): { min: number; max: number } {
  const { yearMonth } = todayKst();
  const year = Number(yearMonth.slice(0, 4));
  const month = Number(yearMonth.slice(5, 7));
  const max = (year - joinedYear) * 12 + month - 1;
  const min = joinedYear === year ? 0 : Math.max(0, (year - joinedYear - 1) * 12 + month);
  return { min, max };
}

// 경력으로 정하는 숙련도 처음 값 (백엔드와 같음): 3개월 이하 1, 6개월 이하 2, 그 이상 3
export const defaultSkill = (careerMonths: number) => (careerMonths <= NEW_CAREER_MAX_MONTHS ? 1 : careerMonths <= 6 ? 2 : 3);

const draftCareerMonths = (d: Pick<NurseDraft, "careerYears" | "careerMonths">) =>
  Number(d.careerYears.trim() || 0) * 12 + Number(d.careerMonths.trim() || 0);

// 경력 3개월 이하면 숙련도는 1~2만 고를 수 있다
export const allowedSkills = (d: Pick<NurseDraft, "careerYears" | "careerMonths">, levels: number[]) =>
  draftCareerMonths(d) <= NEW_CAREER_MAX_MONTHS ? levels.filter((lv) => lv <= 2) : levels;

const validYear = (v: string, thisYear: number) =>
  isWholeNumber(v) && Number(v) >= MIN_JOINED_YEAR && Number(v) <= thisYear;

// 입사 연도를 바꾸면 경력을 그해 가능한 최대값으로, 숙련도를 그 경력의 처음 값으로 채운다 (7차 미팅).
// 경력·숙련도는 그 뒤에 직접 고칠 수 있다.
export function hireYearPatch(hireYear: string): Partial<NurseDraft> {
  const thisYear = Number(todayKst().yearMonth.slice(0, 4));
  if (!validYear(hireYear, thisYear)) return { hireYear };
  const { max } = careerRange(Number(hireYear));
  return { hireYear, careerYears: String(Math.floor(max / 12)), careerMonths: String(max % 12), skill: defaultSkill(max) };
}

// 경력을 3개월 이하로 줄였는데 숙련도가 3 이상이면 처음 값으로 내린다
export function careerPatch(d: NurseDraft, patch: Pick<Partial<NurseDraft>, "careerYears" | "careerMonths">): Partial<NurseDraft> {
  const next = { ...d, ...patch };
  const months = draftCareerMonths(next);
  return months <= NEW_CAREER_MAX_MONTHS && d.skill > 2 ? { ...patch, skill: defaultSkill(months) } : patch;
}

// 간호조무사는 일반 직급만, 프리셉터를 맡지 않는다 (11/13 계약, 아니면 422 INVALID_STAFF_ROLE)
export const staffTypePatch = (staffType: NurseDraft["staffType"]): Partial<NurseDraft> =>
  staffType === "NURSING_ASSISTANT" ? { staffType, dutyRole: "GENERAL", isPreceptor: false, preceptorOf: [] } : { staffType };

const EXPERIENCE_KEYS = ["hireYear", "careerYears", "careerMonths", "skill"] as const;

// 보내기 전에 칸별로 검사한다. 빈 객체면 보내도 된다.
// 수정할 때(initial)는 입사 연도·경력·숙련도를 건드린 경우에만 경력 범위를 본다. 서버도 그렇고,
// 예전에는 입사 전 경력을 합쳐 넣을 수 있어서 그대로 두면 이름만 고쳐도 막히기 때문이다.
export function validateNurseDraft(d: NurseDraft, initial?: NurseDraft): NurseDraftErrors {
  const errors: NurseDraftErrors = {};
  const thisYear = Number(todayKst().yearMonth.slice(0, 4));
  if (!d.name.trim()) errors.name = "이름을 입력해 주세요.";
  else if (d.name.trim().length > NAME_MAX_LENGTH) errors.name = `이름은 ${NAME_MAX_LENGTH}자까지 쓸 수 있어요.`;
  if (!d.hireYear.trim()) errors.hireYear = "입사 연도를 입력해 주세요.";
  else if (!validYear(d.hireYear, thisYear))
    errors.hireYear = `입사 연도는 ${MIN_JOINED_YEAR}년부터 ${thisYear}년까지 넣을 수 있어요.`;
  const years = d.careerYears.trim() || "0";
  const months = d.careerMonths.trim() || "0";
  if (!isWholeNumber(years) || !isWholeNumber(months) || Number(months) > 11)
    errors.career = "총 경력은 0년 이상, 개월은 0~11 사이로 넣어 주세요.";
  else if (!errors.hireYear && (!initial || EXPERIENCE_KEYS.some((k) => d[k] !== initial[k]))) {
    // 입사 연도와 맞지 않는 경력은 서버도 400으로 막는다 (7차 미팅)
    const { min, max } = careerRange(Number(d.hireYear));
    const total = draftCareerMonths(d);
    if (total < min || total > max) errors.career = `${d.hireYear}년 입사면 경력은 ${monthsLabel(min)} ~ ${monthsLabel(max)} 사이예요.`;
    else if (total <= NEW_CAREER_MAX_MONTHS && d.skill > 2) errors.skill = "경력 3개월 이하는 숙련도 1~2만 고를 수 있어요.";
  }
  if (!d.periodStart) errors.periodStart = "소속 시작일을 골라 주세요.";
  return errors;
}

function monthsLabel(total: number): string {
  const y = Math.floor(total / 12);
  const m = total % 12;
  if (y === 0) return `${m}개월`;
  return m ? `${y}년 ${m}개월` : `${y}년`;
}

// 서버가 칸 단위로 거절했을 때(400 VALIDATION_ERROR fieldErrors) 화면의 칸으로 옮긴다. 옮기지 못한 것은 빈 객체.
const SERVER_FIELD: Record<string, NurseDraftField> = {
  name: "name",
  joinedYear: "hireYear",
  careerMonths: "career",
  skillLevel: "skill",
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
    staffType: "NURSE",
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
    staffType: d.staffType,
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
    staffType: nurse.staffType ?? "NURSE",
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
