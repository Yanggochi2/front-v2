"use client";

import { useState } from "react";
import RnFilterChip from "@/components/ui/RnFilterChip";
import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import type { DutyRole, Nurse, StaffType } from "@/types/nurses.type";
import { DUTY_ROLE_LABEL, PRECEPTOR_LABEL, STAFF_TYPE_LABEL } from "@/constants/nurses.constants";
import { compareNurses, type NurseSortKey } from "@/lib/nurseSort";
import NursesTable from "./NursesTable";

// 프리셉터는 직급이 아니라 역할이라 isPreceptor로 거른다
type RoleFilter = DutyRole | "PRECEPTOR" | "ALL";

const SORTS: { value: NurseSortKey; label: string }[] = [
  { value: "skill", label: "숙련도순" },
  { value: "name", label: "이름순" },
];

const ROLE_FILTERS: RoleFilter[] = ["ALL", "CHARGE", "GENERAL", "NEW", "NIGHT_ONLY", "PRECEPTOR"];

type StaffFilter = StaffType | "ALL";
const STAFF_FILTERS: StaffFilter[] = ["ALL", "NURSE", "NURSING_ASSISTANT"];
// staffType이 없는 응답(11/13 계약 전)은 간호사로 본다
const matchesStaff = (n: Nurse, f: StaffFilter) => f === "ALL" || (n.staffType ?? "NURSE") === f;

const matches = (n: Nurse, f: RoleFilter) => f === "ALL" || (f === "PRECEPTOR" ? n.isPreceptor === true : n.dutyRole === f);

const sortFields = (n: Nurse) => ({
  ...n,
  careerMonths: n.careerYears === undefined ? undefined : n.careerYears * 12 + (n.careerMonths ?? 0),
});

// 50대 사용자가 한눈에 알아보도록 정렬·역할 보기·퇴사자를 묶음으로 나누고, 역할 칩에 인원수를 붙인다.
export default function NursesBoard({ items }: { items: Nurse[] }) {
  const [sort, setSort] = useState<NurseSortKey>("skill");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [staff, setStaff] = useState<StaffFilter>("ALL");
  const [includeRetired, setIncludeRetired] = useState(false);

  const pool = items.filter((n) => includeRetired || n.status !== "RETIRED");
  const staffCount = (f: StaffFilter) => pool.filter((n) => matchesStaff(n, f)).length;
  const staffPool = pool.filter((n) => matchesStaff(n, staff));
  const count = (f: RoleFilter) => staffPool.filter((n) => matches(n, f)).length;
  const retiredCount = items.filter((n) => n.status === "RETIRED").length;
  const visible = staffPool
    .filter((n) => matches(n, role))
    .sort((a, b) => compareNurses(sort, sortFields(a), sortFields(b)));

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-x-10 gap-y-3">
        <div className="flex items-center gap-3">
          <p className="text-[17px] font-bold text-ink">정렬</p>
          <ScheduleSegmented options={SORTS} value={sort} onChange={setSort} ariaLabel="정렬" itemClassName="w-24" />
        </div>
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="직종으로 보기">
          <p className="text-[17px] font-bold text-ink">직종</p>
          {STAFF_FILTERS.map((f) => (
            <RnFilterChip key={f} selected={staff === f} onClick={() => setStaff(f)}>
              {f === "ALL" ? "전체" : STAFF_TYPE_LABEL[f]} {staffCount(f)}
            </RnFilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="역할로 보기">
          <p className="text-[17px] font-bold text-ink">역할</p>
          {ROLE_FILTERS.filter((f) => f === "ALL" || f === role || count(f) > 0).map((f) => (
            <RnFilterChip key={f} selected={role === f} onClick={() => setRole(f)}>
              {f === "ALL" ? "전체" : f === "PRECEPTOR" ? PRECEPTOR_LABEL : DUTY_ROLE_LABEL[f]} {count(f)}
            </RnFilterChip>
          ))}
        </div>
        <div className="ml-auto">
          <RnFilterChip selected={includeRetired} onClick={() => setIncludeRetired((v) => !v)}>
            {includeRetired ? "퇴사자 숨기기" : `퇴사자 보기 ${retiredCount}`}
          </RnFilterChip>
        </div>
      </div>
      <NursesTable items={visible} />
    </>
  );
}
