"use client";

import type { ReactNode } from "react";
import RnOptionButton from "@/components/ui/RnOptionButton";
import {
  DUTY_ROLE_LABEL,
  NURSE_STATUS_LABEL,
  PRECEPTOR_LABEL,
  REGISTRABLE_STATUSES,
  SKILL_LEVELS,
} from "@/constants/nurses.constants";
import type { DutyRole, NurseDraft } from "@/types/nurses.type";

const inputCls =
  "h-14 w-full rounded-[14px] bg-surface px-5 text-[18px] font-medium text-ink placeholder:text-ink-faint";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[18px] font-bold text-ink">{label}</span>
        {hint ? <span className="text-[15px] font-medium text-ink-faint">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

const DUTY_ROLES: DutyRole[] = ["GENERAL", "CHARGE", "NEW", "NIGHT_ONLY"];

type Props = {
  draft: NurseDraft;
  onChange: (patch: Partial<NurseDraft>) => void;
  /** 담당 신입으로 고를 수 있는 재직 신입 간호사. 불러오지 못했으면 null */
  newNurses: { id: string; name: string }[] | null;
};

// 간호사 등록 입력칸. 2열 grid 안에 놓는다 (간호사 등록·수정 화면에서 같이 쓴다).
export default function NurseProfileFields({ draft, onChange, newNurses }: Props) {
  const togglePrecepted = (id: string) =>
    onChange({ preceptorOf: draft.preceptorOf.includes(id) ? draft.preceptorOf.filter((x) => x !== id) : [...draft.preceptorOf, id] });

  return (
    <>
      <Field label="이름">
        <input
          type="text"
          required
          maxLength={50}
          placeholder="이름을 입력해요"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="입사 연도">
        <input
          type="number"
          required
          min={1970}
          max={new Date().getFullYear()}
          placeholder="예: 2022"
          aria-label="입사 연도"
          value={draft.hireYear}
          onChange={(e) => onChange({ hireYear: e.target.value })}
          className={inputCls}
        />
      </Field>

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

      <Field label="총 경력" hint="입사 전 경력까지 합쳐요">
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            min={0}
            aria-label="경력 년"
            value={draft.careerYears}
            onChange={(e) => onChange({ careerYears: e.target.value })}
            className={`${inputCls} max-w-[150px]`}
          />
          <span className="text-[18px] font-medium text-ink-sub">년</span>
          <input
            type="number"
            min={0}
            max={11}
            aria-label="경력 개월"
            value={draft.careerMonths}
            onChange={(e) => onChange({ careerMonths: e.target.value })}
            className={`${inputCls} max-w-[150px]`}
          />
          <span className="text-[18px] font-medium text-ink-sub">개월</span>
        </div>
      </Field>
      <Field label="숙련도" hint="수간호사만 볼 수 있어요">
        <div className="flex flex-wrap gap-2">
          {SKILL_LEVELS.map((lv) => (
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
      <Field label="소속 시작일" hint="이 날짜 전 칸은 편집할 수 없어요">
        <input
          type="date"
          required
          aria-label="소속 시작일"
          value={draft.periodStart}
          onChange={(e) => onChange({ periodStart: e.target.value })}
          className={inputCls}
        />
      </Field>
    </>
  );
}
