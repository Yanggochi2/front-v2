"use client";

import { useState } from "react";
import { useSubmit } from "@/hooks/useSubmit";
import { deleteRule, patchRule } from "@/services/rulesApi";
import type { RuleItem } from "@/types/rules.type";

type Props = {
  rule: RuleItem;
  onEdit: (rule: RuleItem) => void;
  onChanged: (rule: RuleItem) => void;
  onDeleted: (id: string) => void;
};

const linkCls = "h-11 rounded-[12px] px-3 text-[17px] font-bold text-primary transition-colors hover:bg-primary-soft disabled:opacity-50";

// 규칙 한 줄의 수정 · 켜기/끄기 · 삭제. 삭제는 한 번 더 묻는다.
export default function RuleRowActions({ rule, onEdit, onChanged, onDeleted }: Props) {
  const { submit, loading, error } = useSubmit();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function toggle() {
    let saved: RuleItem | null = null;
    // RULE-02. TODO: 백엔드 확정 후 결정 (reason 입력 UI/필수 여부)
    const ok = await submit(async () => {
      saved = await patchRule(rule.id, { enabled: !rule.enabled });
    });
    if (ok && saved) onChanged(saved);
  }

  async function remove() {
    if (await submit(() => deleteRule(rule.id))) onDeleted(rule.id);
  }

  return (
    <div className="flex flex-col gap-1">
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <span className="pr-2 text-[16px] font-medium text-ink-sub">지울까요?</span>
          <button type="button" onClick={remove} disabled={loading} className="h-11 rounded-[12px] px-3 text-[17px] font-bold text-danger transition-colors hover:bg-danger-soft disabled:opacity-50">
            삭제
          </button>
          <button type="button" onClick={() => setConfirmDelete(false)} disabled={loading} className={linkCls}>
            취소
          </button>
        </div>
      ) : (
        <div className="-ml-3 flex items-center gap-1">
          <button type="button" onClick={() => onEdit(rule)} disabled={loading} className={linkCls}>
            수정
          </button>
          <button type="button" onClick={toggle} disabled={loading} className={linkCls}>
            {rule.enabled ? "끄기" : "켜기"}
          </button>
          {rule.builtIn ? null : (
            <button type="button" onClick={() => setConfirmDelete(true)} disabled={loading} className={linkCls}>
              삭제
            </button>
          )}
        </div>
      )}
      {error ? (
        <span role="alert" className="text-[14px] font-medium text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
