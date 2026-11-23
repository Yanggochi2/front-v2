import { GENERATE_MAX_SECONDS, GENERATION_STAGES } from "@/constants/schedule.constants";
import { ApiError, apiRequest } from "@/lib/apiClient";
import type { GenerationFailure, GenerationProgress, GenerationStep } from "@/types/schedule.type";
import type {
  ApiFixedCell,
  ApiGenerationJob,
  ApiGenerationPartialApply,
  ApiGenerationStart,
  ApiGenerationStop,
  ApiSchedule,
  ApiScheduleWithViolations,
} from "@/types/scheduleApi.type";
import { createSchedule, getScheduleById, getScheduleByYearMonth, getScheduleViolations } from "./scheduleApi";

const GENERATIONS = "/wards/me/generations";

// GEN-01. 중복 시작을 막으려고 호출부가 만든 Idempotency-Key를 넘긴다.
// 409 GENERATION_ALREADY_RUNNING, 422 PRECONDITION_FAILED는 ApiError로 던진다.
export function startGeneration(scheduleId: string, body: ApiGenerationStart, idempotencyKey: string) {
  return apiRequest<ApiGenerationJob>(`/wards/me/schedules/${scheduleId}/generations`, {
    method: "POST",
    body,
    idempotencyKey,
  });
}

// GEN-02
export function getGenerationJob(jobId: string) {
  return apiRequest<ApiGenerationJob>(`${GENERATIONS}/${jobId}`);
}

// GEN-03. applyBestResult에 따라 GenerationJob 또는 Schedule이 온다 (명세에 구분 필드 없음).
// 백엔드는 생성을 요청 안에서 끝내므로 대개 이미 끝난 작업이다(409 JOB_ALREADY_FINISHED). 그때는 결과가 이미 근무표에 있다.
export async function stopGeneration(jobId: string, body: ApiGenerationStop): Promise<void> {
  try {
    await apiRequest<ApiGenerationJob>(`${GENERATIONS}/${jobId}/stop`, { method: "POST", body });
  } catch (e) {
    if (!(e instanceof ApiError && e.code === "JOB_ALREADY_FINISHED")) throw e;
  }
}

// GEN-04(규칙을 SOFT로 낮춰 다시 생성)는 화면에서 뺐다. 11/17 미팅: 하드/소프트 선택은 기획에 없고 헷갈린다.

// GEN-05. 해 없음(NO_SOLUTION)이어도 가장 나은 결과를 근무표에 넣는다. 사용자에게 고르게 하지 않는다 (11/17 미팅).
// 남은 위반은 근무표에 그대로 표시되고, 인원 적정성 알림이 이유를 알려 준다. 확정은 위반을 고쳐야 할 수 있다.
// 반영한 뒤의 근무표 버전을 돌려준다
async function applyBestResult(job: ApiGenerationJob): Promise<number> {
  const schedule = await getScheduleById(job.scheduleId);
  const res = await apiRequest<ApiScheduleWithViolations>(`${GENERATIONS}/${job.id}/partial-result/apply`, {
    method: "POST",
    body: { baseVersion: schedule.version } satisfies ApiGenerationPartialApply,
  });
  return res.schedule.version;
}

// 생성 작업이 끝났을 때 갈 화면. 해 없음이면 결과를 근무표에 넣고 근무표로 간다.
// 근무표로 가면 true(인원 적정성 알림을 띄운다). 결과가 없는 실패(FAILED)는 실패 화면으로 간다.
// version: 근무표로 갈 때 결과가 들어간 근무표 버전. 인원 적정성 알림을 이 버전이 화면에 올라온 뒤에 띄운다
export async function settleGeneration(
  job: ApiGenerationJob,
  yearMonth: string,
): Promise<{ href: string; toSchedule: boolean; version: number | null }> {
  const toMonth = `/schedule?view=month&ym=${yearMonth}`;
  if (job.status === "NO_SOLUTION") {
    return { href: toMonth, toSchedule: true, version: await applyBestResult(job) };
  }
  if (job.status === "SUCCEEDED" || job.status === "STOPPED") {
    // 결과 버전을 모르면 알림만 띄우지 않는다 (근무표는 이미 바뀌었다)
    const version = await getScheduleById(job.scheduleId).then((s) => s.version, () => null);
    return { href: toMonth, toSchedule: true, version };
  }
  return { href: generationHref(job, yearMonth), toSchedule: false, version: null };
}

// ---- 생성 시작 흐름 ----

// 자동 생성 때 그대로 둘 칸: 지금 근무가 들어 있는 칸(종이 달력의 오프처럼 미리 넣어 둔 근무).
// 연차·교육(AL·ED)은 넣지 않아도 서버가 항상 남긴다 (10/26 계약 4장).
function enteredCells(schedule: ApiSchedule): ApiFixedCell[] {
  return schedule.cells
    .filter((c) => c.dutyCode !== null && c.dutyCode !== "AL" && c.dutyCode !== "ED")
    .map((c) => ({ nurseId: c.nurseId, date: c.date }));
}

// 그 달 근무표를 찾고, 없으면 빈 근무표를 만든 뒤 자동 생성을 시작한다.
// keepEntered면 지금 근무가 들어 있는 칸은 그대로 두고 빈 칸만 채운다. 아니면 연차·교육만 남기고 다시 짠다.
// 확정된 근무표는 확정을 취소해야 다시 짤 수 있다.
export async function startGenerationForMonth(yearMonth: string, idempotencyKey: string, keepEntered = false): Promise<ApiGenerationJob> {
  let schedule: ApiSchedule;
  try {
    schedule = await getScheduleByYearMonth(yearMonth);
  } catch (e) {
    if (!(e instanceof ApiError && e.status === 404)) throw e;
    schedule = await createSchedule(yearMonth);
  }
  if (schedule.status !== "DRAFT") {
    throw new ApiError(409, { code: "SCHEDULE_CONFIRMED", message: "확정된 근무표는 확정을 취소한 뒤 다시 짤 수 있어요." });
  }
  const fixedCells = keepEntered ? enteredCells(schedule) : [];
  return startGeneration(schedule.id, { fixedCells, maxSeconds: GENERATE_MAX_SECONDS }, idempotencyKey);
}

// 고른 칸만 다시 짠다 (11/16 미팅). 고른 칸을 뺀 나머지 근무는 모두 그대로 두도록 고정해서 보낸다.
// 서버의 최신 근무표로 고정 칸을 만들므로 주간 보기에서 골라도 그 달 전체가 지켜진다. 빈 칸은 함께 채워진다.
// changed: 고른 칸 중 근무가 실제로 바뀐 칸 수. 나머지가 모두 고정이라 같은 답이 나올 수 있어 화면에 알려 준다. 아직 끝나지 않았으면 null
export async function startGenerationForCells(
  scheduleId: string,
  cells: ApiFixedCell[],
  idempotencyKey: string,
): Promise<{ job: ApiGenerationJob; changed: number | null }> {
  const schedule = await getScheduleById(scheduleId);
  if (schedule.status !== "DRAFT") {
    throw new ApiError(409, { code: "SCHEDULE_CONFIRMED", message: "확정된 근무표는 확정을 취소한 뒤 다시 짤 수 있어요." });
  }
  const picked = new Set(cells.map((c) => `${c.nurseId}|${c.date}`));
  const fixedCells = enteredCells(schedule).filter((c) => !picked.has(`${c.nurseId}|${c.date}`));
  const before = new Map(schedule.cells.map((c) => [`${c.nurseId}|${c.date}`, c.dutyCode]));
  const job = await startGeneration(schedule.id, { fixedCells, maxSeconds: GENERATE_MAX_SECONDS }, idempotencyKey);
  if (job.status !== "SUCCEEDED") return { job, changed: null };
  try {
    const after = await getScheduleById(schedule.id);
    return { job, changed: after.cells.filter((c) => picked.has(`${c.nurseId}|${c.date}`) && before.get(`${c.nurseId}|${c.date}`) !== c.dutyCode).length };
  } catch {
    // 결과는 이미 근무표에 들어갔다. 몇 칸이 바뀌었는지만 모른다
    return { job, changed: null };
  }
}

// 작업 상태별로 이동할 화면. 아직 진행 중이면 진행 화면.
// 지금 백엔드는 요청 안에서 생성을 끝내므로 시작 응답이 바로 SUCCEEDED일 수 있다.
export function generationHref(job: ApiGenerationJob, yearMonth: string): string {
  if (job.status === "SUCCEEDED" || job.status === "STOPPED") return `/schedule?view=month&ym=${yearMonth}`;
  if (job.status === "NO_SOLUTION" || job.status === "FAILED") return `/schedule/generate/failed?jobId=${job.id}`;
  return `/schedule/generate?jobId=${job.id}`;
}

// ---- 화면용 ----

function mmss(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function periodLabel(yearMonth: string) {
  const [y, m] = yearMonth.split("-");
  return `${y}년 ${Number(m)}월`;
}

function toSteps(stage: unknown): GenerationStep[] {
  const current = GENERATION_STAGES.findIndex((s) => s.stage === stage);
  // 모르는 stage면 마지막 전 단계(근무 배치)를 진행 중으로 본다.
  const active = current === -1 ? GENERATION_STAGES.length - 2 : current;
  return GENERATION_STAGES.map((s, i) => ({
    order: i + 1,
    title: s.title,
    status: i < active ? "done" : i === active ? "active" : "pending",
  }));
}

// 해가 없을 때 백엔드가 주는 "지키지 못한 규칙" (job.conflicts). 명세에 모양이 없어, 메시지가 있는 항목만 골라 쓴다.
// 누구의 어느 날인지 알 수 있게 이름과 날짜를 앞에 붙인다.
function conflictMessages(conflicts: unknown, schedule: ApiSchedule): string[] {
  if (!Array.isArray(conflicts)) return [];
  const names = new Map(schedule.nurses.map((n) => [n.id, n.name]));
  return conflicts.flatMap((c: unknown) => {
    if (typeof c !== "object" || c === null) return [];
    const { message, nurseId, date } = c as { message?: unknown; nurseId?: unknown; date?: unknown };
    if (typeof message !== "string" || message === "") return [];
    const who = typeof nurseId === "string" ? names.get(nurseId) : undefined;
    const day = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일` : undefined;
    const head = [who, day].filter(Boolean).join(" · ");
    return [head ? `${head}: ${message}` : message];
  });
}

// jobId는 진행 화면이 어느 작업인지 알려 준다 (?jobId=).
export async function getGenerationProgress(jobId: string): Promise<GenerationProgress> {
  const job = await getGenerationJob(jobId);
  const schedule = await getScheduleById(job.scheduleId);
  return {
    jobId,
    yearMonth: schedule.yearMonth,
    periodLabel: periodLabel(schedule.yearMonth),
    steps: toSteps(job.stage),
    // TODO: metrics 모양이 명세에 없다. 명세에 있는 경과 시간·하드 위반 수만 쓴다. (희망 오프 반영률은 필드 없음)
    metrics: [
      { label: "경과 시간", value: mmss(job.elapsedSeconds), tone: "default" },
      { label: "남은 하드 위반", value: `${job.hardViolationCount}건`, tone: job.hardViolationCount > 0 ? "danger" : "default" },
    ],
  };
}

export async function getGenerationFailure(jobId: string): Promise<GenerationFailure> {
  const job = await getGenerationJob(jobId);
  const schedule = await getScheduleById(job.scheduleId);
  // 실패한 결과는 근무표에 쓰지 않으므로, 먼저 작업이 알려 준 "지키지 못한 규칙"을 보여 준다. 없으면 지금 근무표의 하드 위반.
  let problems = conflictMessages(job.conflicts, schedule);
  if (problems.length === 0) {
    try {
      problems = (await getScheduleViolations(job.scheduleId, { severity: "HARD", size: 100 })).data.map((v) => v.message);
    } catch {}
  }
  const noSolution = job.status === "NO_SOLUTION";
  // 하루 인원을 못 채워 실패했으면 규칙을 낮추는 대신 "이 인원으로는 안 된다"고 알린다 (11/17 미팅: 인원 적정성 알림)
  const staffShortage = problems.some((p) => p.includes("인원 부족"));
  return {
    jobId,
    yearMonth: schedule.yearMonth,
    title: noSolution ? "조건을 모두 맞추는 근무표를 찾지 못했어요" : "근무표를 만들지 못했어요",
    subtitle: `${periodLabel(schedule.yearMonth)} · 지키지 못한 규칙 ${problems.length || job.hardViolationCount}건`,
    cause: {
      tag: staffShortage ? "인원 부족" : "원인",
      headline: staffShortage
        ? "이 인원으로는 근무가 돌아가지 않습니다"
        : noSolution
          ? "지킬 수 없는 규칙이 있어요"
          : "생성 중에 문제가 생겼어요",
      detail:
        job.error ||
        (staffShortage
          ? "간호사 수에 비해 날마다 필요한 인원이 많아요. 간호사를 더 등록하거나 병동 설정의 하루 필요 인원을 확인한 뒤 다시 만들어 주세요."
          : problems.length > 0
            ? "아래 내용을 보고 규칙이나 인원을 조정한 뒤 다시 만들어 주세요."
            : "규칙이나 인원을 조정한 뒤 다시 만들어 주세요."),
    },
    problems,
    staffShortage,
  };
}

// 서버에 연결하지 못했을 때 화면 틀만 보여 주기 위한 빈 값
export function getEmptyGenerationProgress(): GenerationProgress {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return {
    jobId: "",
    yearMonth,
    periodLabel: periodLabel(yearMonth),
    steps: [],
    metrics: [
      { label: "경과 시간", value: "-", tone: "default" },
      { label: "남은 하드 위반", value: "-", tone: "default" },
    ],
  };
}

export function getEmptyGenerationFailure(): GenerationFailure {
  return {
    jobId: "",
    yearMonth: "",
    title: "조건을 모두 맞추는 근무표를 찾지 못했어요",
    subtitle: "",
    cause: { tag: "원인", headline: "", detail: "" },
    problems: [],
    staffShortage: false,
  };
}
