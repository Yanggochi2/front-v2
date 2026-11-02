import type { NurseCreate } from "@/types/nursesApi.type";
import type { NurseDetail, NurseDraft } from "@/types/nurses.type";

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
