"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import NurseProfileFields from "@/components/nurses/NurseProfileFields";
import AdminButton from "@/components/ui/AdminButton";
import AdminChip from "@/components/ui/AdminChip";
import RnOptionButton from "@/components/ui/RnOptionButton";
import { DUTY_ROLE_LABEL } from "@/constants/nurses.constants";
import { useSubmit } from "@/hooks/useSubmit";
import { emptyNurseDraft, toNurseCreate } from "@/lib/nurseDraft";
import { approveJoinRequest } from "@/services/approvalsApi";
import { createNurse } from "@/services/nursesApi";
import type { JoinRequest } from "@/types/approvals.type";
import type { Nurse, NurseDraft } from "@/types/nurses.type";

type Props = {
  request: JoinRequest;
  unlinkedNurses: Nurse[];
  onApproved: () => void;
  onClose: () => void;
};

type Mode = "link" | "register";

function careerLabel(n: Nurse): string {
  if (n.careerYears === undefined) return "";
  return `경력 ${n.careerYears}년 ${n.careerMonths ?? 0}개월`;
}

// 가입 승인 창. 이 계정이 어느 간호사인지 정한다: 수간호사가 미리 등록한 간호사에 연결하거나, 새로 등록한다.
export default function ApprovalLinkDialog({ request, unlinkedNurses, onApproved, onClose }: Props) {
  // 이름이 같은 등록 간호사를 먼저 보여 준다
  const nurses = [...unlinkedNurses].sort(
    (a, b) => Number(request.candidateIds.includes(b.id)) - Number(request.candidateIds.includes(a.id)),
  );
  const linkable = nurses.filter((n) => !n.inviteActive);
  const [mode, setMode] = useState<Mode>(request.candidateIds.length > 0 ? "link" : "register");
  const [selectedId, setSelectedId] = useState<string | null>(
    request.candidateIds.length === 1 ? request.candidateIds[0] : null,
  );
  const [draft, setDraft] = useState<NurseDraft>(() => emptyNurseDraft(request.name === "-" ? "" : request.name));
  // 등록은 됐는데 승인이 실패하면, 다시 눌렀을 때 같은 간호사를 또 만들지 않고 이어서 승인한다
  const createdId = useRef<string | null>(null);
  const { submit, loading, error } = useSubmit();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  async function approveLink() {
    if (!selectedId) return;
    if (await submit(() => approveJoinRequest(request.id, selectedId))) onApproved();
  }

  async function approveRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ok = await submit(async () => {
      if (!createdId.current) createdId.current = (await createNurse(toNurseCreate(draft))).id;
      await approveJoinRequest(request.id, createdId.current);
    });
    if (ok) onApproved();
  }

  return (
    // 표 칸(whitespace-nowrap) 안에서 열리므로 줄바꿈 상속을 끊는다
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] whitespace-normal">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-link-title"
        className="flex max-h-[92vh] w-[920px] flex-col gap-6 overflow-y-auto rounded-[28px] bg-white p-8 shadow-pop"
      >
        <div className="flex flex-col gap-2">
          <h2 id="approval-link-title" className="text-[26px] font-bold text-ink">
            {request.name}님 가입 승인
          </h2>
          <p className="text-[17px] font-medium text-ink-sub">
            {request.email} · 승인하면 ‘일반 간호사’로 들어와요. 이 계정이 어느 간호사인지 정해 주세요. 근무표와 신청은
            간호사 정보에 붙어요.
          </p>
        </div>

        <div className="flex gap-2">
          <RnOptionButton
            selected={mode === "link"}
            onClick={() => setMode("link")}
            className="px-6 text-[18px]"
          >
            {`등록된 간호사에 연결 (${linkable.length})`}
          </RnOptionButton>
          <RnOptionButton selected={mode === "register"} onClick={() => setMode("register")} className="px-6 text-[18px]">
            새로 등록
          </RnOptionButton>
        </div>

        {mode === "link" ? (
          <div className="flex flex-col gap-4">
            {nurses.length === 0 ? (
              <p className="rounded-[14px] bg-surface px-5 py-4 text-[17px] font-medium text-ink-sub">
                계정이 연결되지 않은 등록 간호사가 없어요. ‘새로 등록’으로 간호사 정보를 입력해 주세요.
              </p>
            ) : (
              <ul className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                {nurses.map((n) => {
                  const candidate = request.candidateIds.includes(n.id);
                  const blocked = Boolean(n.inviteActive);
                  const selected = selectedId === n.id;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        disabled={blocked}
                        onClick={() => setSelectedId(n.id)}
                        className={`flex w-full items-center gap-3 rounded-[14px] px-5 py-3.5 text-left text-[17px] disabled:opacity-50 ${
                          selected ? "border-2 border-primary bg-primary-soft" : "bg-surface"
                        }`}
                      >
                        <span className="min-w-[120px] text-[18px] font-bold text-ink">{n.name}</span>
                        <span className="font-medium text-ink-sub">
                          {[n.dutyRole ? DUTY_ROLE_LABEL[n.dutyRole] : "", careerLabel(n), n.periodLabel]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <span className="ml-auto flex gap-2">
                          {candidate ? <AdminChip tone="blue">이름이 같아요</AdminChip> : null}
                          {blocked ? <AdminChip>초대 코드 발급됨</AdminChip> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {selectedId && !request.candidateIds.includes(selectedId) ? (
              <p className="text-[15px] font-medium text-danger">
                신청자 이름과 다른 간호사예요. 다른 사람의 정보에 연결하지 않았는지 확인해 주세요.
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="text-[16px] font-bold text-danger">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <AdminButton onClick={onClose} disabled={loading}>
                닫기
              </AdminButton>
              <AdminButton variant="primary" onClick={approveLink} disabled={loading || !selectedId}>
                {loading ? "승인하는 중…" : "연결하고 승인"}
              </AdminButton>
            </div>
          </div>
        ) : (
          <form onSubmit={approveRegister} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
              <NurseProfileFields draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
            </div>
            {error ? (
              <p role="alert" className="text-[16px] font-bold text-danger">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <AdminButton onClick={onClose} disabled={loading}>
                닫기
              </AdminButton>
              <AdminButton variant="primary" type="submit" disabled={loading}>
                {loading ? "승인하는 중…" : "등록하고 승인"}
              </AdminButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
