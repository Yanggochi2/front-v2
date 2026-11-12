"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import RnButton from "@/components/ui/RnButton";
import { emptyNurseDraft, serverNurseErrors, toNurseCreate, toNurseDraft, toNursePatch, validateNurseDraft } from "@/lib/nurseDraft";
import { formatApiError } from "@/lib/formatApiError";
import { createNurse, updateNurse } from "@/services/nursesApi";
import type { NurseDetail, NurseDraft, NurseDraftErrors, NurseDraftField } from "@/types/nurses.type";
import NurseProfileFields from "./NurseProfileFields";
import NurseRegisteredDialog from "./NurseRegisteredDialog";

// 입력값 → 오류를 보여 주는 칸 (총 경력은 년·개월이 한 칸)
const FIELD_OF: Partial<Record<keyof NurseDraft, NurseDraftField>> = {
  name: "name",
  hireYear: "hireYear",
  careerYears: "career",
  careerMonths: "career",
  periodStart: "periodStart",
};

type Props = {
  nurse?: NurseDetail;
  /** 담당 신입으로 고를 수 있는 재직 신입 간호사. 불러오지 못했으면 null */
  newNurses: { id: string; name: string }[] | null;
};

export default function NurseForm({ nurse, newNurses }: Props) {
  const editing = nurse !== undefined;
  const [initialDraft] = useState<NurseDraft>(() => (nurse ? toNurseDraft(nurse) : emptyNurseDraft()));
  const [draft, setDraft] = useState<NurseDraft>(initialDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<NurseDraftErrors>({});
  const [registered, setRegistered] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 브라우저 기본 말풍선 대신 칸 아래에 문구를 보여 준다 (form noValidate)
    const found = validateNurseDraft(draft);
    setFieldErrors(found);
    if (Object.keys(found).length > 0) {
      setError("빨간 칸을 확인해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (nurse) {
        const patch = toNursePatch(initialDraft, draft);
        // 바꾼 칸이 없으면 저장 요청 없이 명단으로 돌아간다
        if (Object.keys(patch).length > 0) await updateNurse(nurse.id, { ...patch, version: nurse.version });
        router.push("/nurses");
        router.refresh();
      } else {
        // 권한(role)은 이 화면에서 설정하지 않는다. 새로 등록하는 간호사는 항상 일반 간호사다.
        await createNurse(toNurseCreate(draft));
        setRegistered(draft.name.trim());
      }
    } catch (err) {
      setFieldErrors(serverNurseErrors(err));
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="flex items-start gap-6">
        <div className="grid w-full max-w-[904px] flex-1 grid-cols-2 gap-x-6 gap-y-7 rounded-[24px] border border-line bg-card shadow-card p-8">
          <NurseProfileFields
            draft={draft}
            errors={fieldErrors}
            onChange={(patch) => {
              setDraft((d) => ({ ...d, ...patch }));
              // 고친 칸의 오류 문구는 바로 지운다
              setFieldErrors((prev) => {
                const next = { ...prev };
                for (const key of Object.keys(patch)) delete next[FIELD_OF[key as keyof NurseDraft] as NurseDraftField];
                return next;
              });
            }}
            newNurses={newNurses?.filter((n) => n.id !== nurse?.id) ?? null}
          />
        </div>

        <aside className="flex w-[416px] shrink-0 flex-col gap-3.5 rounded-[20px] bg-brand-soft p-7">
          <h2 className="text-[20px] font-bold text-brand">{editing ? "수정하면" : "등록하면"}</h2>
          {(editing
            ? [
                "· 변경한 정보는 다음 근무표 검사부터 반영돼요",
                "· 직급과 상태가 바뀌면 기존 근무표에 위반이 생길 수 있어요",
                "· 다른 관리자가 먼저 수정했다면 새로고침 안내가 표시돼요",
              ]
            : [
                "· 근무표에 이 간호사의 줄이 생겨요",
                "· 소속 시작일 전 날짜는 회색으로 막혀요",
                "· 공유 링크에는 이름과 직급만 보여요",
                "· 차지, 신입 같은 직급은 규칙에 따라 자동으로 검사돼요",
              ]).map((t) => (
            <p key={t} className="text-[17px] font-medium text-ink">
              {t}
            </p>
          ))}
        </aside>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error ? (
          <p role="alert" className="mr-auto text-[16px] font-medium text-danger">
            {error}
          </p>
        ) : null}
        <RnButton variant="secondary" size="lg" href="/nurses">
          취소
        </RnButton>
        <RnButton variant="primary" size="lg" type="submit" disabled={busy} className="px-10">
          {editing ? "저장하기" : "등록하기"}
        </RnButton>
      </div>

      {registered ? (
        <NurseRegisteredDialog
          name={registered}
          onAddAnother={() => {
            setDraft(emptyNurseDraft());
            setRegistered(null);
            setError(null);
            setFieldErrors({});
          }}
        />
      ) : null}
    </form>
  );
}
