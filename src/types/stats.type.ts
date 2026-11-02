export type FairnessRow = {
  id: string;
  name: string;
  dayCount: number;
  eveningCount: number;
  nightCount: number;
  offCount: number;
  offTarget: number | null; // 서버가 주는 개인별 OFF 목표 (근무 형태·소속 기간 반영). 없으면 null
  weekendCount: number;
  holidayCount: number;
};

export type StatsData = {
  periodLabel: string;
  rows: FairnessRow[];
};
