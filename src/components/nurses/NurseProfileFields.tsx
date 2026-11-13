"use client";

import type { ReactNode } from "react";
import RnOptionButton from "@/components/ui/RnOptionButton";
import {
  DUTY_ROLE_LABEL,
  NURSE_STATUS_LABEL,
  PRECEPTOR_LABEL,
  REGISTRABLE_STATUSES,
  SKILL_LEVELS,
  STAFF_TYPE_LABEL,
} from "@/constants/nurses.constants";
import { allowedSkills, careerPatch, hireYearPatch, staffTypePatch } from "@/lib/nurseDraft";
import type { DutyRole, NurseDraft, NurseDraftErrors, StaffType } from "@/types/nurses.type";

const baseInputCls =
  "h-14 w-full rounded-[14px] bg-surface px-5 text-[18px] font-medium text-ink placeholder:text-ink-faint";
// 오류가 있는 칸은 빨간 테두리
const inputCls = (error?: string) => `${baseInputCls}${error ? " ring-2 ring-danger ring-inset" : ""}`;

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[18px] font-bold text-ink">{label}</span>
        {hint ? <span className="text-[15px] font-medium text-ink-faint">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-[16px] font-medium text-danger">{error}</p> : null}
    </div>
  );
}

const DUTY_ROLES: DutyRole[] = ["GENERAL", "CHARGE", "NEW", "NIGHT_ONLY"];
const STAFF_TYPES: StaffType[] = ["NURSE", "NURSING_ASSISTANT"];

type Props = {
  draft: NurseDraft;
  onChange: (patch: Partial<NurseDraft>) => void;
  /** 칸별 오류 문구 (보내기 전 검사, 서버 거절) */
  errors?: NurseDraftErrors;
  /** 담당 신입으로 고를 수 있는 재직 신입 간호사. 불러오지 못했으면 null */
  newNurses: { id: string; name: string }[] | null;
};

// 간호사 등록 입력칸. 2열 grid 안에 놓는다 (간호사 등록·수정 화면에서 같이 쓴다).
export default function NurseProfileFields({ draft, onChange, newNurses, errors = {} }: Props) {
  const togglePrecepted = (id: string) =>
    onChange({ preceptorOf: draft.preceptorOf.includes(id) ? draft.preceptorOf.filter((x) => x !== id) : [...draft.preceptorOf, id] });
  const isAssistant = draft.staffType === "NURSING_ASSISTANT";
  const skills = allowedSkills(draft, SKILL_LEVELS);

  return (
    <>
      <Field label="이름" error={errors.name}>
        <input
          type="text"
          required
          aria-invalid={errors.name ? true : undefined}
          maxLength={50}
          placeholder="이름을 입력해요"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputCls(errors.name)}
        />
      </Field>
      <Field label="직종" hint="간호조무사는 간호사 필요 인원에 세지 않아요">
        <div className="flex flex-wrap gap-2">
          {STAFF_TYPES.map((t) => (
            <RnOptionButton key={t} selected={draft.staffType === t} onClick={() => onChange(staffTypePatch(t))}>
              {STAFF_TYPE_LABEL[t]}
            </RnOptionButton>
          ))}
        </div>
      </Field>
      <Field label="입사 연도" hint="넣으면 경력·숙련도를 채워 드려요" error={errors.hireYear}>
        <input
          type="number"
          required
          aria-invalid={errors.hireYear ? true : undefined}
          min={1900}
          max={new Date().getFullYear()}
          placeholder="예: 2022"
          aria-label="입사 연도"
          value={draft.hireYear}
          onChange={(e) => onChange(hireYearPatch(e.target.value))}
          className={inputCls(errors.hireYear)}
        />
      </Field>

      {/* 간호조무사는 일반 직급만, 프리셉터를 맡지 않는다 (11/13 계약) */}
      {isAssistant ? null : (
        <>
          <Field label="직급" hint="차지·신입·나이트 전담은 근무 배정 규칙이 달라요">
            <div className="flex flex-wrap gap-2">
              {DUTY_ROLES.map((r) => (
                <RnOptionButton key={r} selected={draft.dutyRole === r} onClick={() => onChange({ dutyRole: r })}>
                  {DUTY_ROLE_LABEL[r]}
                </RnOptionButton>
              ))}
            </div>
          </Field>

          <Field label={PRECEPTOR_LABEL} hint="신입을 가르치는 역할이에요. 직급과 따로 정해요">
            <div className="flex flex-wrap gap-2">
              <RnOptionButton selected={!draft.isPreceptor} onClick={() => onChange({ isPreceptor: false })}>
                맡지 않음
              </RnOptionButton>
              <RnOptionButton selected={draft.isPreceptor} onClick={() => onChange({ isPreceptor: true })}>
                맡음
              </RnOptionButton>
            </div>
          </Field>

          {draft.isPreceptor ? (
            <Field label="담당 신입" hint="재직 중인 신입 간호사만 고를 수 있어요">
              {newNurses === null ? (
                <p className="text-[17px] font-medium text-danger">신입 간호사 목록을 불러오지 못했어요. 새로고침해 주세요.</p>
              ) : newNurses.length === 0 ? (
                <p className="text-[17px] font-medium text-ink-mute">등록된 신입 간호사가 없어요</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {newNurses.map((n) => (
                    <RnOptionButton key={n.id} selected={draft.preceptorOf.includes(n.id)} onClick={() => togglePrecepted(n.id)}>
                      {n.name}
                    </RnOptionButton>
                  ))}
                </div>
              )}
            </Field>
          ) : null}
        </>
      )}

      <Field label="총 경력" hint="입사 연도에 맞게 넣어 주세요" error={errors.career}>
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            min={0}
            aria-label="경력 년"
            aria-invalid={errors.career ? true : undefined}
            value={draft.careerYears}
            onChange={(e) => onChange(careerPatch(draft, { careerYears: e.target.value }))}
            className={`${inputCls(errors.career)} max-w-[150px]`}
          />
          <span className="text-[18px] font-medium text-ink-sub">년</span>
          <input
            type="number"
            min={0}
            max={11}
            aria-label="경력 개월"
            aria-invalid={errors.career ? true : undefined}
            value={draft.careerMonths}
            onChange={(e) => onChange(careerPatch(draft, { careerMonths: e.target.value }))}
            className={`${inputCls(errors.career)} max-w-[150px]`}
          />
          <span className="text-[18px] font-medium text-ink-sub">개월</span>
        </div>
      </Field>
      <Field
        label="숙련도"
        hint={skills.length < SKILL_LEVELS.length ? "경력 3개월 이하는 1~2만 고를 수 있어요" : "수간호사만 볼 수 있어요"}
        error={errors.skill}
      >
        <div className="flex flex-wrap gap-2">
          {skills.map((lv) => (
            <RnOptionButton
              key={lv}
              selected={draft.skill === lv}
              onClick={() => onChange({ skill: lv })}
              className="w-[72px] text-[20px]"
            >
              {lv}
            </RnOptionButton>
          ))}
        </div>
      </Field>

      <Field label="상태">
        <div className="flex flex-wrap gap-2">
          {REGISTRABLE_STATUSES.map((s) => (
            <RnOptionButton key={s} selected={draft.status === s} onClick={() => onChange({ status: s })}>
              {NURSE_STATUS_LABEL[s]}
            </RnOptionButton>
          ))}
        </div>
      </Field>
      <Field label="소속 시작일" hint="이 날짜 전 칸은 편집할 수 없어요" error={errors.periodStart}>
        <input
          type="date"
          required
          aria-label="소속 시작일"
          aria-invalid={errors.periodStart ? true : undefined}
          value={draft.periodStart}
          onChange={(e) => onChange({ periodStart: e.target.value })}
          className={inputCls(errors.periodStart)}
        />
      </Field>
    </>
  );
}
