import { ApiError } from "@/lib/apiClient";
import type { StatsData } from "@/types/stats.type";
import { getScheduleByYearMonth } from "./scheduleApi";

// 통계 전용 API는 없다. 그 달 근무표 응답의 statistics(간호사별 집계)를 쓴다.
// 그 달 근무표가 없으면(404) 빈 결과.
export async function getStats(yearMonth?: string): Promise<StatsData> {
  const now = new Date();
  const ym = yearMonth ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const periodLabel = `${ym.slice(0, 4)}년 ${Number(ym.slice(5, 7))}월`;
  try {
    const schedule = await getScheduleByYearMonth(ym);
    const names = new Map(schedule.nurses.map((n) => [n.id, n.name]));
    const rows = (schedule.statistics ?? []).map((s) => ({
      id: s.nurseId,
      name: names.get(s.nurseId) ?? "-",
      dayCount: s.D,
      eveningCount: s.E,
      nightCount: s.N,
      offCount: s.O,
      offTarget: s.offTarget ?? 0,
      weekendCount: s.weekendWork,
      holidayCount: s.holidayWork,
    }));
    return { periodLabel, rows };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return { periodLabel, rows: [] };
    throw e;
  }
}
