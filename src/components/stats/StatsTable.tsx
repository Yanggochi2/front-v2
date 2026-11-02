import { OFF_SHORTAGE_WARN_DAYS } from "@/constants/rules.constants";
import AdminChip from "@/components/ui/AdminChip";
import { AdminTableEmptyRow, AdminTableShell, AdminTd, AdminTh, AdminTr } from "@/components/ui/AdminTable";
import type { FairnessRow } from "@/types/stats.type";

function offLabel(row: FairnessRow) {
  if (row.offTarget === null) return { text: `${row.offCount} / -`, tone: "gray" as const };
  const lack = row.offTarget - row.offCount;
  return lack >= OFF_SHORTAGE_WARN_DAYS
    ? { text: `${row.offCount} / ${row.offTarget} · ${lack}일 부족`, tone: "red" as const }
    : { text: `${row.offCount} / ${row.offTarget}`, tone: "gray" as const };
}

export default function StatsTable({ rows }: { rows: FairnessRow[] }) {
  return (
    <AdminTableShell minWidth="min-w-[1000px]">
      <thead>
        <tr>
          <AdminTh first className="w-[170px]">이름</AdminTh>
          <AdminTh className="w-[110px]">D</AdminTh>
          <AdminTh className="w-[110px]">E</AdminTh>
          <AdminTh className="w-[110px]">N</AdminTh>
          <AdminTh className="w-[110px]">OFF</AdminTh>
          <AdminTh className="w-[200px]">OFF 목표 대비</AdminTh>
          <AdminTh className="w-[170px]">주말 근무</AdminTh>
          <AdminTh>공휴일 근무</AdminTh>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? <AdminTableEmptyRow colSpan={8}>통계가 없어요</AdminTableEmptyRow> : null}
        {rows.map((r) => {
          const off = offLabel(r);
          return (
            <AdminTr key={r.id}>
              <AdminTd first>{r.name}</AdminTd>
              <AdminTd>{r.dayCount}</AdminTd>
              <AdminTd>{r.eveningCount}</AdminTd>
              <AdminTd>{r.nightCount}</AdminTd>
              <AdminTd>{r.offCount}</AdminTd>
              <AdminTd>
                <AdminChip tone={off.tone}>{off.text}</AdminChip>
              </AdminTd>
              <AdminTd>{r.weekendCount}</AdminTd>
              <AdminTd>{r.holidayCount}</AdminTd>
            </AdminTr>
          );
        })}
      </tbody>
    </AdminTableShell>
  );
}
