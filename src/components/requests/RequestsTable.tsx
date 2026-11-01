import RnChip from "@/components/ui/RnChip";
import { REQUEST_KIND_LABEL } from "@/constants/requests.constants";
import type { RequestItem, RequestStatus } from "@/types/requests.type";
import RequestCancelButton from "./RequestCancelButton";
import RequestRowActions from "./RequestRowActions";

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "취소",
};

const STATUS_TONE = { PENDING: "brand", APPROVED: "gray", REJECTED: "danger", CANCELLED: "gray" } as const;

const HEADERS = ["신청자", "종류", "대상 날짜", "사유", "신청일", "상태", "처리"];
const MY_HEADERS = HEADERS.slice(1);

const cell = "h-[72px] whitespace-nowrap pr-3 pl-5 text-left align-middle";

// mine: 간호사 본인 신청 목록. 신청자 열이 없고, 대기 건은 승인·반려 대신 취소만 한다.
export default function RequestsTable({ items, mine = false }: { items: RequestItem[]; mine?: boolean }) {
  const headers = mine ? MY_HEADERS : HEADERS;
  return (
    <div className="w-full overflow-x-auto rounded-[20px] border border-line bg-white shadow-card">
      <table className="w-full min-w-[960px] border-collapse">
        <thead>
          <tr className="border-b border-line bg-canvas">
            {headers.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={`h-[52px] whitespace-nowrap pr-3 pl-5 text-left text-[16px] font-bold text-ink-sub ${
                  i === 0 && !mine ? "sticky left-0 z-10 w-40 bg-canvas" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="h-[96px] pl-5 text-center text-[17px] font-medium text-ink-mute">
                조건에 맞는 신청이 없어요
              </td>
            </tr>
          ) : (
            items.map((r) => (
              <tr key={r.id} className="group border-b border-line/70 bg-white transition-colors last:border-b-0 hover:bg-canvas">
                {mine ? null : (
                  <th scope="row" className={`${cell} sticky left-0 z-10 w-40 bg-white text-[17px] font-bold text-ink transition-colors group-hover:bg-canvas`}>
                    {r.nurseName}
                  </th>
                )}
                <td className={`${cell} w-[140px]`}>
                  <RnChip>{REQUEST_KIND_LABEL[r.kind]}</RnChip>
                </td>
                <td className={`${cell} w-[200px] text-[17px] font-medium text-ink-sub`}>{r.targetDateLabel}</td>
                <td className={`${cell} w-40 text-[17px] font-medium text-ink-sub`}>{r.reason}</td>
                <td className={`${cell} w-[150px] text-[17px] font-medium text-ink-sub`}>{r.requestedAtLabel ?? "-"}</td>
                <td className={`${cell} w-[130px]`}>
                  <RnChip tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</RnChip>
                </td>
                <td className={`${cell} text-[17px] font-medium text-ink-sub`}>
                  {r.status === "PENDING" ? (
                    mine ? (
                      <RequestCancelButton id={r.id} />
                    ) : r.decidable !== false ? (
                      <RequestRowActions id={r.id} />
                    ) : null
                  ) : r.status === "CANCELLED" ? (
                    "취소됨"
                  ) : (
                    `${r.processedAtLabel ?? ""} 처리`
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
