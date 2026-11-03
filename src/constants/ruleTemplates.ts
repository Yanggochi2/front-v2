// 규칙 템플릿: "조건 + 결과" 문장에 값을 채우는 방식 (비즈니스 로직 10-19, 4장).
// 규칙 code와 parameters 키는 백엔드 기준이다.

import { REQUIRED_STAFF_PER_DAY } from "./rules.constants";

export type RuleParamField = {
  key: string;
  unit: string;
  min: number;
  max: number;
  defaultValue: number;
};

export type RuleTemplate = {
  code: string;
  name: string;
  // 문장 조각. 문자열은 그대로, 필드는 "값+단위"로 이어 붙인다.
  parts: (string | RuleParamField)[];
  // 규칙 추가 목록에 보이는지. 백엔드 기본 규칙은 이미 있어 추가하지 않는다.
  addable: boolean;
  defaultStrength: "REQUIRED" | "RECOMMENDED";
};

// 백엔드 규칙 목록(app/business/rules.py CATALOG)과 같다. 규칙은 병동마다 고정이라 추가·삭제 없이 켜기/끄기·강도·값만 바꾼다.
export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    code: "COVERAGE",
    name: "듀티별 필요 인원",
    parts: ["데이", { key: "D", unit: "명", min: 0, max: 30, defaultValue: REQUIRED_STAFF_PER_DAY.D }, "이브닝", { key: "E", unit: "명", min: 0, max: 30, defaultValue: REQUIRED_STAFF_PER_DAY.E }, "나이트", { key: "N", unit: "명", min: 0, max: 30, defaultValue: REQUIRED_STAFF_PER_DAY.N }],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "MAX_CONSECUTIVE_NIGHTS",
    name: "연속 나이트 제한",
    parts: ["연속 나이트 최대", { key: "max", unit: "일", min: 1, max: 31, defaultValue: 3 }],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "MAX_CONSECUTIVE_WORK",
    name: "최대 연속 근무",
    parts: ["연속 근무 최대", { key: "max", unit: "일", min: 1, max: 31, defaultValue: 5 }],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "NIGHT_TO_DAY",
    name: "역순환 금지",
    parts: ["E→D, N→D, N→E처럼 근무 사이 휴식이 11시간보다 짧은 순서는 넣지 않아요"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "NIGHT_REST",
    name: "야간 후 휴식",
    parts: ["나이트를 3일 이어서 하면 그 뒤 2일은 쉬어요"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "CHARGE_DAY_ONLY",
    name: "차지 허용 근무",
    parts: ["차지 간호사가 맡을 수 있는 근무를 정해요 (기본 D·E·N 모두)"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "CHARGE_EVERY_SHIFT",
    name: "근무마다 차지",
    parts: ["데이·이브닝·나이트마다 차지 간호사를 1명 이상 넣어요"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "SENIOR_EVERY_SHIFT",
    name: "근무마다 고연차",
    parts: ["데이·이브닝·나이트마다 차지나 프리셉터를 1명 이상 넣어요"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "NIGHT_ONLY_SHIFT",
    name: "나이트 전담",
    parts: ["나이트 전담 간호사는 나이트만 (월 15회 이내)"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "SHIFT_BLOCK",
    name: "같은 근무 이어서",
    parts: ["같은 근무를 2일 이상 이어서 배치해요 (퐁당퐁당 피하기)"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "PREGNANT_NIGHT",
    name: "임신 간호사 나이트 제외",
    parts: ["임신 중인 간호사는 나이트 제외"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "NEW_NIGHT_ALONE",
    name: "신입 나이트 단독 금지",
    parts: ["신입 간호사만 나이트에 두지 않아요"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "OUT_OF_AFFILIATION",
    name: "소속 기간 밖 배정 금지",
    parts: ["소속 기간 밖 날짜에는 근무를 넣지 않아요"],
    addable: false,
    defaultStrength: "REQUIRED",
  },
  {
    code: "OFF_TARGET",
    name: "월 휴무 목표",
    parts: ["월 휴무 수를 목표에 맞춰요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "WISH_OFF_IGNORED",
    name: "희망 오프 반영",
    parts: ["간호사가 낸 희망 오프를 반영해요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "WISH_DUTY_IGNORED",
    name: "희망 근무 반영",
    parts: ["간호사가 낸 희망 근무를 반영해요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "PRECEPTOR_MISMATCH",
    name: "프리셉터·신입 듀티 일치",
    parts: ["프리셉터와 담당 신입의 근무를 맞춰요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "MAX_MONTHLY_NIGHTS",
    name: "월 야간 최대 횟수",
    parts: ["한 달 나이트 최대", { key: "max", unit: "회", min: 1, max: 31, defaultValue: 6 }],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "NIGHT_OFF_DAY",
    name: "나이트-오프-데이 피하기",
    parts: ["나이트 다음 하루만 쉬고 데이로 돌아오지 않게 해요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "ISOLATED_SHIFT",
    name: "고립된 근무·휴무 피하기",
    parts: ["하루짜리 근무나 하루짜리 휴무가 끼지 않게 해요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
  {
    code: "WEEKLY_REST",
    name: "주마다 연속 휴무",
    parts: ["매주 이틀 연속 쉬는 날을 넣어요"],
    addable: false,
    defaultStrength: "RECOMMENDED",
  },
];

// 간호사 신청(10/26 범위에서 빠짐)이 있어야 의미가 있는 규칙. 입력할 방법이 없어 규칙 화면에 보이지 않는다
export const HIDDEN_RULE_CODES = ["WISH_OFF_IGNORED", "WISH_DUTY_IGNORED"];

// 병동이 지울 수 없는 기본 규칙. 백엔드 규칙은 모두 기본 규칙이다
export const BUILT_IN_RULE_CODES = RULE_TEMPLATES.filter((t) => !t.addable).map((t) => t.code);

export function findRuleTemplate(code: string): RuleTemplate | undefined {
  return RULE_TEMPLATES.find((t) => t.code === code);
}

export function isParamField(part: string | RuleParamField): part is RuleParamField {
  return typeof part !== "string";
}

export function defaultParameters(template: RuleTemplate): Record<string, number> {
  return Object.fromEntries(template.parts.filter(isParamField).map((f) => [f.key, f.defaultValue]));
}

// 템플릿 문장에 값을 채운다. 값이 없으면 기본값을 쓴다.
export function ruleSentence(template: RuleTemplate, parameters: Record<string, unknown>): string {
  return template.parts
    .map((p) => (isParamField(p) ? `${String(parameters[p.key] ?? p.defaultValue)}${p.unit}` : p))
    .join(" ");
}
