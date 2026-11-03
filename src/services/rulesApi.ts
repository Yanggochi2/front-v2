import { RULE_FILTER_CHIPS } from "@/constants/rules.constants";
import { BUILT_IN_RULE_CODES, findRuleTemplate, HIDDEN_RULE_CODES, ruleSentence } from "@/constants/ruleTemplates";
import { ApiError, apiRequest } from "@/lib/apiClient";
import type { HolidayItem, RuleItem, RulesData, RuleStrength } from "@/types/rules.type";
import type {
  ApiHoliday,
  ApiHolidayPutBody,
  ApiOffTarget,
  ApiOffTargetPatchBody,
  ApiRule,
  ApiRuleCreateBody,
  ApiRulePatchBody,
  ApiRulePatchResult,
  ApiRuleSeverity,
} from "@/types/rulesApi.type";

const RULES = "/wards/me/rules";

export const toSeverity = (strength: RuleStrength): ApiRuleSeverity => (strength === "REQUIRED" ? "HARD" : "SOFT");

// 템플릿이 없는 규칙은 parameters를 key: value로 보여 준다.
function toSentence(rule: ApiRule): string {
  const template = findRuleTemplate(rule.code);
  if (template) return ruleSentence(template, rule.parameters ?? {});
  const entries = Object.entries(rule.parameters ?? {});
  return entries.length === 0 ? "-" : entries.map(([k, v]) => `${k}: ${String(v)}`).join(", ");
}

export function toRuleItem(rule: ApiRule): RuleItem {
  return {
    id: rule.id,
    code: rule.code,
    name: rule.name,
    strength: rule.severity === "HARD" ? "REQUIRED" : "RECOMMENDED",
    sentence: toSentence(rule),
    parameters: rule.parameters ?? {},
    enabled: rule.enabled,
    builtIn: rule.builtIn ?? BUILT_IN_RULE_CODES.includes(rule.code),
    version: rule.version,
  };
}

export async function getRules(): Promise<RulesData> {
  // RULE-01
  const rules = await apiRequest<ApiRule[]>(RULES);
  return { filters: RULE_FILTER_CHIPS, rules: rules.filter((r) => !HIDDEN_RULE_CODES.includes(r.code)).map(toRuleItem) };
}

// RULE-02.
export async function patchRule(ruleId: string, body: ApiRulePatchBody): Promise<RuleItem> {
  const result = await apiRequest<ApiRulePatchResult>(`${RULES}/${encodeURIComponent(ruleId)}`, {
    method: "PATCH",
    body,
  });
  return toRuleItem(result.rule);
}

// ⚠️ 명세에 없는 API. TODO: 백엔드 확정 후 결정 (경로, 본문, 중복 code 처리)
export async function createRule(body: ApiRuleCreateBody): Promise<RuleItem> {
  const result = await apiRequest<ApiRule>(RULES, { method: "POST", body, idempotencyKey: crypto.randomUUID() });
  return toRuleItem(result);
}

// ⚠️ 명세에 없는 API. TODO: 백엔드 확정 후 결정 (기본 규칙 삭제 시 오류 코드)
export function deleteRule(ruleId: string): Promise<void> {
  return apiRequest<void>(`${RULES}/${encodeURIComponent(ruleId)}`, { method: "DELETE" });
}

// RULE-03
export async function applyRulePreset(presetId: string): Promise<RuleItem[]> {
  const rules = await apiRequest<ApiRule[]>(`/wards/me/rule-presets/${encodeURIComponent(presetId)}/apply`, {
    method: "POST",
  });
  return rules.map(toRuleItem);
}

// RULE-04
export async function getHolidays(yearMonth: string): Promise<ApiHoliday[]> {
  return apiRequest<ApiHoliday[]>("/wards/me/holidays", { query: { yearMonth } });
}

// 공휴일 탭 목록. 병동이 등록한 날 중 공휴일로 켜진 날만 날짜순으로.
export async function getHolidayItems(yearMonth: string): Promise<HolidayItem[]> {
  const list = await getHolidays(yearMonth);
  return list
    .filter((h) => h.isHoliday)
    .map((h) => ({ date: h.date, name: h.name || "공휴일" }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// RULE-05
export async function putHoliday(date: string, body: ApiHolidayPutBody): Promise<ApiHoliday> {
  return apiRequest<ApiHoliday>(`/wards/me/holidays/${date}`, { method: "PUT", body });
}

// RULE-06. 그 달 근무표가 아직 없으면 null
export async function getOffTarget(yearMonth: string): Promise<ApiOffTarget | null> {
  try {
    return await apiRequest<ApiOffTarget>(`/wards/me/off-targets/${yearMonth}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

// RULE-07. targetCount를 null로 보내면 자동값으로 돌아간다
export async function patchOffTarget(yearMonth: string, body: ApiOffTargetPatchBody): Promise<ApiOffTarget> {
  return apiRequest<ApiOffTarget>(`/wards/me/off-targets/${yearMonth}`, { method: "PATCH", body });
}
