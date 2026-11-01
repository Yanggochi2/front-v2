import RnChip from "@/components/ui/RnChip";
import RnButton from "@/components/ui/RnButton";
import { DUTY_ROLE_LABEL, NURSE_ROLE_LABEL, NURSE_STATUS_LABEL } from "@/constants/nurses.constants";
import type { Nurse } from "@/types/nurses.type";

// 권한·듀티 역할은 "역할" 한 칸으로 합치고, 상태는 재직이 아닐 때만 이름 옆에 보인다.
const HEADERS = ["이름", "역할", "경력", "숙련도", "소속 기간", ""];
const cell = "h-[72px] whitespace-nowrap pr-3 pl-6 text-left align-middle";
const text = "text-[18px] font-medium text-ink-sub";

const career = (n: Nurse) =>
  n.careerYears === undefined ? "-" : n.careerMonths ? `${n.careerYears}년 ${n.careerMonths}개월` : `${n.careerYears}년`;

export default function NursesTable({ items }: { items: Nurse[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-[20px] border border-line bg-white shadow-card">
      <table className="w-full min-w-[960px] border-collapse">
        <thead>
          <tr className="border-b border-line bg-canvas">
            {HEADERS.map((h, i) => (
              <th
                key={i}
                scope="col"
                className={`h-[52px] whitespace-nowrap pr-3 pl-6 text-left text-[17px] font-bold text-ink-sub ${
                  i === 0 ? "sticky left-0 z-10 w-[240px] bg-canvas" : ""
                }`}
              >
                {h || <span className="sr-only">관리</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((n) => {
            const showDuty = n.dutyRole && !(n.role === "HEAD_NURSE" && n.dutyRole === "GENERAL");
            return (
              <tr key={n.id} className="group border-b border-line/70 bg-white transition-colors last:border-b-0 hover:bg-canvas">
                <th scope="row" className={`${cell} sticky left-0 z-10 w-[240px] bg-white text-[19px] font-bold text-ink transition-colors group-hover:bg-canvas`}>
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[17px] font-bold text-primary">
                      {n.name.slice(0, 1)}
                    </span>
                    {n.name}
                    {n.status && n.status !== "ACTIVE" ? (
                      <RnChip tone={n.status === "RETIRED" ? "gray" : "danger"}>{NURSE_STATUS_LABEL[n.status]}</RnChip>
                    ) : null}
                  </span>
                </th>
                <td className={`${cell} w-[280px]`}>
                  <span className="flex items-center gap-2">
                    {n.role === "HEAD_NURSE" ? <RnChip tone="brand">{NURSE_ROLE_LABEL.HEAD_NURSE}</RnChip> : null}
                    {showDuty && n.dutyRole ? (
                      <RnChip tone={n.dutyRole === "CHARGE" ? "brand" : n.dutyRole === "NEW" ? "danger" : "gray"}>
                        {DUTY_ROLE_LABEL[n.dutyRole]}
                      </RnChip>
                    ) : null}
                    {n.role !== "HEAD_NURSE" && !n.dutyRole ? "-" : null}
                  </span>
                </td>
                <td className={`${cell} w-[180px] ${text}`}>{career(n)}</td>
                <td className={`${cell} w-[140px] ${text}`}>{n.skill === undefined ? "-" : `${n.skill} / 5`}</td>
                <td className={`${cell} w-[240px] ${text}`}>{n.periodLabel ?? "-"}</td>
                <td className={`${cell} pr-6 text-right ${text}`}>
                  {n.status === "RETIRED" ? (
                    <span className="text-ink-mute">수정 불가</span>
                  ) : (
                    <RnButton variant="secondary" href={`/nurses/${encodeURIComponent(n.id)}/edit`}>
                      수정
                    </RnButton>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
