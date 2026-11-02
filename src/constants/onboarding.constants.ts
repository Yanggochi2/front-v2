import type { CreateWardDefaults } from "@/types/onboarding.type";
import { REQUIRED_STAFF_PER_DAY } from "./rules.constants";

// 화면 안내 문구와 폼 기본값. 서버 데이터가 아니다.
// TODO(🔶 RULE-01): 규칙 프리셋 목록은 미확정. 확정되면 서버 응답으로 대체한다.
export const CREATE_WARD_DEFAULTS: CreateWardDefaults = {
  requiredStaff: { ...REQUIRED_STAFF_PER_DAY },
  presets: [
    // id는 백엔드 Preset 값 (STANDARD | MINIMAL)
    { id: "STANDARD", label: "일반 병동 기본값" },
    { id: "MINIMAL", label: "필수 규칙만" },
  ],
  defaultPresetId: "STANDARD",
};
