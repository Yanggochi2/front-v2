import { GENERATE_MAX_SECONDS, GENERATION_STAGES } from "@/constants/schedule.constants";
import { ApiError, apiRequest } from "@/lib/apiClient";
import type { GenerationFailure, GenerationProgress, GenerationStep } from "@/types/schedule.type";
import type {
  ApiFixedCell,
  ApiGenerationJob,
  ApiGenerationPartialApply,
  ApiGenerationRelaxations,
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

// GEN-04. 완화 선택 후 새 작업이 시작된다.
export function startRelaxedGeneration(jobId: string, body: ApiGenerationRelaxations, idempotencyKey: string) {
  return apiRequest<ApiGenerationJob>(`${GENERATIONS}/${jobId}/relaxations`, {
    method: "POST",
    body,
    idempotencyKey,
  });
}

// GEN-05
export function applyPartialResult(jobId: string, body: ApiGenerationPartialApply) {
  return apiRequest<ApiScheduleWithViolations>(`${GENERATIONS}/${jobId}/partial-result/apply`, { method: "POST", body });
}

// ---- 생성 시작 흐름 ----

// 자동 생성 때 그대로 둘 칸: 지금 근무가 들어 있는 칸(종이 달력의 오프처럼 미리 넣어 둔 근무).
// 연차·교육(AL·ED)은 넣지 않아도 서버가 항상 남긴다 (10/26 계약 4장).
function enteredCells(schedule: ApiSchedule): ApiFixedCell[] {
  return schedule.cells
    .filter((c) => c.dutyCode !== null && c.dutyCode !== "AL" && c.dutyCode !== "ED")
    .map((c) => ({ nurseId: c.nurseId, date: c.date }));
}

// 자동 생성 시작 화면의 "넣어 둔 칸 지키기" 기본값용. 근무표가 없으면 null, 확정·보관된 근무표면 "LOCKED".
export async function getGenerateStartInfo(yearMonth: string): Promise<{ entered: number; empty: number } | "LOCKED" | null> {
  try {
    const schedule = await getScheduleByYearMonth(yearMonth);
    if (schedule.status !== "DRAFT") return "LOCKED";
    return {
      entered: enteredCells(schedule).length,
      empty: schedule.cells.filter((c) => c.dutyCode === null && c.editable).length,
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
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

// 작업 상태별로 이동할 화면. 아직 진행 중이면 진행 화면.
// 지금 백엔드는 요청 안에서 생성을 끝내므로 시작 응답이 바로 SUCCEEDED일 수 있다.
export function generationHref(job: ApiGenerationJob, yearMonth: string): string {
  if (job.status === "SUCCEEDED" || job.status === "STOPPED") return `/schedule?view=month&ym=${yearMonth}`;
  if (job.status === "NO_SOLUTION" || job.status === "FAILED") return `/schedule/generate/failed?jobId=${job.id}`;
  return `/schedule/generate?jobId=${job.id}`;
}

// GEN-05. 실패한 작업의 부분 결과를 근무표에 그대로 쓴다.
export async function applyPartialResultForJob(jobId: string): Promise<ApiSchedule> {
  const job = await getGenerationJob(jobId);
  const schedule = await getScheduleById(job.scheduleId);
  return (await applyPartialResult(jobId, { baseVersion: schedule.version })).schedule;
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
  let problems: string[] = [];
  try {
    problems = (await getScheduleViolations(job.scheduleId, { severity: "HARD", size: 100 })).data.map((v) => v.message);
  } catch {}
  const noSolution = job.status === "NO_SOLUTION";
  return {
    jobId,
    yearMonth: schedule.yearMonth,
    title: noSolution ? "조건을 모두 맞추는 근무표를 찾지 못했어요" : "근무표를 만들지 못했어요",
    subtitle: `${periodLabel(schedule.yearMonth)} · 남은 하드 위반 ${problems.length || job.hardViolationCount}건`,
    cause: {
      tag: "원인",
      headline: noSolution ? "지킬 수 없는 규칙이 있어요" : "생성 중에 문제가 생겼어요",
      detail:
        job.error ||
        (problems.length > 0
          ? "아래 위반을 보고 규칙이나 인원을 조정한 뒤 다시 만들어 주세요."
          : "규칙이나 인원을 조정한 뒤 다시 만들어 주세요."),
    },
    problems,
    options: (job.relaxations ?? []).map((r, i) => ({
      id: r.id,
      badge: { label: "완화", tone: "brand" as const },
      title: r.description,
      description: "이 규칙을 권장(SOFT)으로 낮추고 다시 만들어요. 규칙 설정에도 반영돼요.",
      primary: i === 0,
    })),
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
    options: [],
  };
}
