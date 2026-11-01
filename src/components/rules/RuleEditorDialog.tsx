"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/components/ui/AdminButton";
import RnOptionButton from "@/components/ui/RnOptionButton";
import {
  RULE_TEMPLATES,
  defaultParameters,
  findRuleTemplate,
  isParamField,
  ruleSentence,
  type RuleTemplate,
} from "@/constants/ruleTemplates";
import { useSubmit } from "@/hooks/useSubmit";
import { createRule, patchRule, toSeverity } from "@/services/rulesApi";
import type { RuleItem, RuleStrength } from "@/types/rules.type";

type Props = {
  rule: RuleItem | null; // null이면 새 규칙 추가
  onSaved: (rule: RuleItem) => void;
  onClose: () => void;
};

const ADDABLE = RULE_TEMPLATES.filter((t) => t.addable);

function initialParameters(template: RuleTemplate | undefined, rule: RuleItem | null): Record<string, number> {
  if (!template) return {};
  const base = defaultParameters(template);
  if (!rule) return base;
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Number(rule.parameters[k] ?? v)]));
}

// 규칙 추가·수정 창. 템플릿 문장의 빈칸에 값을 넣고 필수/권장을 고른다.
export default function RuleEditorDialog({ rule, onSaved, onClose }: Props) {
  const editing = rule !== null;
  const [template, setTemplate] = useState<RuleTemplate | undefined>(
    editing ? findRuleTemplate(rule.code) : ADDABLE[0],
  );
  const [params, setParams] = useState<Record<string, number>>(() => initialParameters(template, rule));
  const [strength, setStrength] = useState<RuleStrength>(rule?.strength ?? template?.defaultStrength ?? "REQUIRED");
  const { submit, loading, error } = useSubmit();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  function pickTemplate(t: RuleTemplate) {
    setTemplate(t);
    setParams(defaultParameters(t));
    setStrength(t.defaultStrength);
  }

  const fields = template ? template.parts.filter(isParamField) : [];
  const invalid = fields.some((f) => !Number.isInteger(params[f.key]) || params[f.key] < f.min || params[f.key] > f.max);

  async function save() {
    let saved: RuleItem | null = null;
    const ok = await submit(async () => {
      if (rule) {
        saved = await patchRule(rule.id, {
          severity: toSeverity(strength),
          ...(fields.length > 0 ? { parameters: { ...rule.parameters, ...params } } : {}),
        });
      } else if (template) {
        saved = await createRule({
          code: template.code,
          name: template.name,
          severity: toSeverity(strength),
          enabled: true,
          parameters: params,
        });
      }
    });
    if (ok && saved) onSaved(saved);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rule-editor-title"
        className="flex w-[640px] flex-col gap-6 rounded-[28px] bg-white p-8 shadow-pop"
      >
        <h2 id="rule-editor-title" className="text-[26px] font-bold text-ink">
          {editing ? `${rule.name} 수정` : "규칙 추가"}
        </h2>

        {editing ? null : (
          <div className="flex flex-col gap-2.5">
            <p className="text-[18px] font-bold text-ink">어떤 규칙인가요?</p>
            <div className="flex flex-wrap gap-2">
              {ADDABLE.map((t) => (
                <RnOptionButton key={t.code} selected={template?.code === t.code} onClick={() => pickTemplate(t)}>
                  {t.name}
                </RnOptionButton>
              ))}
            </div>
          </div>
        )}

        {template && fields.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-[18px] font-bold text-ink">값</p>
            <div className="flex flex-wrap items-center gap-2 rounded-[14px] bg-surface px-5 py-4 text-[18px] font-medium text-ink">
              {template.parts.map((p, i) =>
                isParamField(p) ? (
                  <span key={p.key} className="flex items-center gap-1">
                    <input
                      type="number"
                      min={p.min}
                      max={p.max}
                      value={Number.isNaN(params[p.key]) ? "" : params[p.key]}
                      onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: e.target.valueAsNumber }))}
                      aria-label={`${p.unit} 값`}
                      className="h-12 w-20 rounded-[12px] border-2 border-primary bg-white px-3 text-center text-[20px] font-bold text-primary"
                    />
                    <span>{p.unit}</span>
                  </span>
                ) : (
                  <span key={`t-${i}`}>{p}</span>
                ),
              )}
            </div>
            {invalid ? (
              <p className="text-[15px] font-medium text-danger">
                {fields.map((f) => `${f.min}~${f.max}${f.unit}`).join(", ")} 사이로 넣어 주세요
              </p>
            ) : null}
          </div>
        ) : template ? (
          <p className="rounded-[14px] bg-surface px-5 py-4 text-[18px] font-medium text-ink">{ruleSentence(template, {})}</p>
        ) : (
          // 템플릿이 없는 규칙: 값은 바꾸지 않고 필수/권장만 고친다
          <p className="rounded-[14px] bg-surface px-5 py-4 text-[18px] font-medium text-ink">{rule?.sentence}</p>
        )}

        <div className="flex flex-col gap-2.5">
          <p className="text-[18px] font-bold text-ink">강도</p>
          <div className="flex gap-2">
            <RnOptionButton selected={strength === "REQUIRED"} onClick={() => setStrength("REQUIRED")}>
              필수
            </RnOptionButton>
            <RnOptionButton selected={strength === "RECOMMENDED"} onClick={() => setStrength("RECOMMENDED")}>
              권장
            </RnOptionButton>
          </div>
          <p className="text-[15px] font-medium text-ink-mute">
            필수는 어기면 확정할 수 없고, 권장은 가능하면 지켜요
          </p>
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
          <AdminButton variant="primary" onClick={save} disabled={loading || invalid || (!editing && !template)}>
            {editing ? "저장" : "추가"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
