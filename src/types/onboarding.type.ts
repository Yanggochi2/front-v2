export type ShiftKind = "D" | "E" | "N";

export type RulePreset = {
  id: string;
  label: string;
};

export type CreateWardDefaults = {
  requiredStaff: Record<ShiftKind, number>;
  presets: RulePreset[];
  defaultPresetId: string;
};

// 병동 만들기 폼. 만드는 사람이 그 병동의 수간호사로 함께 등록된다.
export type CreateWardInput = {
  hospitalName: string;
  wardName: string;
  headName: string;
  joinedYear: number;
  careerMonths: number;
  affiliationStart: string; // YYYY-MM-DD
  requiredStaff: Record<ShiftKind, number>;
  rulePreset: string;
};
