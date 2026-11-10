"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RnButton from "@/components/ui/RnButton";
import { useSubmit } from "@/hooks/useSubmit";
import { deleteNurse } from "@/services/nursesApi";

// 간호사 삭제 (11/2 미팅). 지난 근무표는 남고, 작성 중인 근무표의 오늘 뒤 칸만 비워진다.
export default function NurseDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RnButton variant="secondary" onClick={() => setOpen(true)}>
        삭제
      </RnButton>
      {open ? <NurseDeleteDialog id={id} name={name} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function NurseDeleteDialog({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const router = useRouter();
  const { submit, loading, error } = useSubmit();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => dialogRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  async function remove() {
    if (await submit(() => deleteNurse(id))) {
      onClose();
      router.refresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="nurse-delete-title"
        aria-describedby="nurse-delete-desc"
        className="flex w-[520px] flex-col gap-5 whitespace-normal rounded-[28px] bg-white p-8 text-left shadow-pop outline-none"
      >
        <h2 id="nurse-delete-title" className="text-[26px] font-bold text-ink">
          {name} 간호사를 삭제할까요?
        </h2>
        <p id="nurse-delete-desc" className="text-[17px] font-medium text-ink-sub">
          명단과 앞으로의 근무표에서 빠져요. 지난 근무표와 확정된 근무표는 그대로 남아요.
        </p>
        {error ? (
          <p role="alert" className="text-[16px] font-bold text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-3">
          <RnButton variant="secondary" size="lg" onClick={onClose} disabled={loading}>
            취소
          </RnButton>
          <RnButton variant="danger" size="lg" onClick={remove} disabled={loading}>
            {loading ? "삭제 중…" : "삭제"}
          </RnButton>
        </div>
      </div>
    </div>
  );
}
