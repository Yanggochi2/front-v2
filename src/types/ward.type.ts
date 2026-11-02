export type WardSettingsData = {
  hospitalName: string;
  wardName: string;
  nurseCount: number;
  // TODO(🔶 RULE-01) 하루 필요 인원: 평일/주말/공휴일 구분 미확정
  dailyRequired: { D: number; E: number; N: number };
  // 응답에 없으면 행을 숨긴다
  ruleStartLabel?: string;
};
