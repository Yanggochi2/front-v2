"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubmit } from "@/hooks/useSubmit";
import { todayKst } from "@/lib/schedulePeriod";
import { createWorkspace } from "@/services/onboardingApi";
import OnboardingButton from "@/components/ui/OnboardingButton";
import OnboardingCard from "@/components/ui/OnboardingCard";
import OnboardingInput from "@/components/ui/OnboardingInput";
import type { CreateWardDefaults, ShiftKind } from "@/types/onboarding.type";
import StaffStepper from "./StaffStepper";

type Props = { defaults: CreateWardDefaults; userName: string };

const SHIFTS: ShiftKind[] = ["D", "E", "N"];
const labelClass = "text-lg font-bold text-ink";
const THIS_YEAR = Number(todayKst().yearMonth.slice(0, 4));

const toInt = (v: string) => (v.trim() === "" ? NaN : Number(v));

export default function CreateWardForm({ defaults, userName }: Props) {
  const router = useRouter();
  const [hospital, setHospital] = useState("");
  const [ward, setWard] = useState("");
  const [staff, setStaff] = useState(defaults.requiredStaff);
  const [presetId, setPresetId] = useState(defaults.defaultPresetId);
  // 만드는 사람이 이 병동의 수간호사로 함께 등록된다 (POST /workspaces)
  const [headName, setHeadName] = useState(userName);
  const [joinedYear, setJoinedYear] = useState("");
  const [careerYears, setCareerYears] = useState("");
  const [careerMonths, setCareerMonths] = useState("0");
  const [affiliationStart, setAffiliationStart] = useState(() => {
    const { yearMonth, day } = todayKst();
    return `${yearMonth}-${String(day).padStart(2, "0")}`;
  });

  const { submit, loading, error } = useSubmit();
  const year = toInt(joinedYear);
  const career = toInt(careerYears) * 12 + toInt(careerMonths);
  const canSubmit =
    hospital.trim() !== "" &&
    ward.trim() !== "" &&
    headName.trim() !== "" &&
    Number.isInteger(year) && year >= 1900 && year <= THIS_YEAR &&
    Number.isInteger(career) && career >= 0 &&
    affiliationStart !== "" &&
    !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    const ok = await submit(() =>
      createWorkspace({
        hospitalName: hospital.trim(),
        wardName: ward.trim(),
        headName: headName.trim(),
        joinedYear: year,
        careerMonths: career,
        affiliationStart,
        requiredStaff: staff,
        rulePreset: presetId,
      }),
    );
    if (ok) {
      router.replace("/schedule");
      router.refresh();
    }
  }

  return (
    <OnboardingCard className="flex w-full max-w-180 flex-col gap-[22px] px-10 py-9">
      <label htmlFor="hospital" className={labelClass}>병원 이름</label>
      <OnboardingInput
        id="hospital"
        value={hospital}
        onChange={(e) => setHospital(e.target.value)}
        placeholder="병원 이름을 입력해요"
      />
      <label htmlFor="ward" className={labelClass}>병동 이름</label>
      <OnboardingInput
        id="ward"
        value={ward}
        onChange={(e) => setWard(e.target.value)}
        placeholder="병동 이름을 입력해요"
      />
      <label htmlFor="head-name" className={labelClass}>수간호사 이름</label>
      <OnboardingInput
        id="head-name"
        value={headName}
        onChange={(e) => setHeadName(e.target.value)}
        placeholder="근무표에 나올 이름이에요"
      />
      <div className="grid grid-cols-2 gap-x-6 gap-y-[22px]">
        <div className="flex flex-col gap-[22px]">
          <label htmlFor="joined-year" className={labelClass}>입사 연도</label>
          <OnboardingInput
            id="joined-year"
            type="number"
            min={1900}
            max={THIS_YEAR}
            value={joinedYear}
            onChange={(e) => setJoinedYear(e.target.value)}
            placeholder="예: 2005"
          />
        </div>
        <div className="flex flex-col gap-[22px]">
          <label htmlFor="affiliation-start" className={labelClass}>이 병동 소속 시작일</label>
          <OnboardingInput
            id="affiliation-start"
            type="date"
            value={affiliationStart}
            onChange={(e) => setAffiliationStart(e.target.value)}
          />
        </div>
      </div>
      <p className={labelClass}>총 경력 (입사 전 경력까지)</p>
      <div className="flex items-center gap-3">
        <OnboardingInput type="number" min={0} aria-label="경력 년" value={careerYears} onChange={(e) => setCareerYears(e.target.value)} placeholder="0" />
        <span className="shrink-0 text-lg font-medium text-ink-sub">년</span>
        <OnboardingInput type="number" min={0} max={11} aria-label="경력 개월" value={careerMonths} onChange={(e) => setCareerMonths(e.target.value)} />
        <span className="shrink-0 text-lg font-medium text-ink-sub">개월</span>
      </div>
      <p className={labelClass}>하루에 필요한 인원</p>
      <div className="grid grid-cols-3 gap-3">
        {SHIFTS.map((kind) => (
          <StaffStepper
            key={kind}
            label={kind}
            value={staff[kind]}
            onChange={(next) => setStaff((s) => ({ ...s, [kind]: next }))}
          />
        ))}
      </div>
      <p className={labelClass}>규칙은 어떻게 시작할까요?</p>
      <div role="radiogroup" className="grid grid-cols-2 gap-3">
        {defaults.presets.map((p) => {
          const selected = p.id === presetId;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPresetId(p.id)}
              className={`flex h-14 cursor-pointer items-center justify-center rounded-[14px] px-5 text-lg ${
                selected
                  ? "border-2 border-primary bg-primary-soft font-bold text-primary"
                  : "bg-surface font-medium text-ink-sub"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {error ? <p role="alert" className="text-base font-medium text-danger">{error}</p> : null}
      <div className="flex justify-end">
        <OnboardingButton onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? "만드는 중…" : "병동 만들기"}
        </OnboardingButton>
      </div>
    </OnboardingCard>
  );
}
