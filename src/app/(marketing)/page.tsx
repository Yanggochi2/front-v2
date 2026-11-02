import LandingButton from "@/components/landing/LandingButton";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingInquiryForm from "@/components/landing/LandingInquiryForm";
import LandingPanel from "@/components/landing/LandingPanel";
import LandingStage from "@/components/landing/LandingStage";
import {
  LANDING_AUDIT_ROWS,
  LANDING_DUTY_LEGEND,
  LANDING_REQUEST_ROWS,
  LANDING_RULE_ROWS,
} from "@/constants/landing.constants";

const SECTION = "flex min-h-svh flex-col justify-start pt-[max(15vh,112px)] pb-20";
const WRAP = "mx-auto w-[min(1240px,100%-48px)]";
const H2 = "landing-heading text-[clamp(36px,5.2vw,80px)]";
const LEAD = "landing-lead mt-6";
const SPLIT = "landing-shade grid max-w-[1060px] grid-cols-[minmax(0,520px)_minmax(0,440px)] items-start gap-x-16";
const SPLIT_PANEL = "col-start-2 row-span-3 row-start-1 mt-1.5";

// 서비스 소개 랜딩. 3D 배경(LandingStage)은 섹션 id(hero ~ cta)를 따라 모양을 바꾼다.
export default function LandingPage() {
  return (
    <>
      <div aria-hidden className="landing-backdrop pointer-events-none fixed inset-0 z-0" />
      <LandingStage />
      <LandingHeader />

      <main className="relative z-[1]">
        <section id="hero" className={`${SECTION} justify-center pt-[110px]`}>
          <div className={WRAP}>
            <div className="landing-shade max-w-[640px] [&>*]:animate-landing-rise [&>*:nth-child(2)]:[animation-delay:.12s] [&>*:nth-child(3)]:[animation-delay:.24s] [&>*:nth-child(4)]:[animation-delay:.36s] motion-reduce:[&>*]:animate-none">
              <h1 className="landing-heading text-[clamp(64px,12.5vw,196px)]">
                근무표,
                <br />
                알아서.
              </h1>
              <p className={LEAD}>수간호사의 한 달을 한 번에 짜고, 규칙은 먼저 지키고, 바꾼 건 전부 기록으로 남겨요.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <LandingButton href="/signup">시작하기</LandingButton>
                <LandingButton href="#auto" variant="ghost">
                  더 알아보기
                </LandingButton>
              </div>
              <p className="mt-9 flex items-center gap-2.5 text-[16px] font-medium text-[#f6eaef] [text-shadow:0_1px_2px_rgb(18_6_11/0.95),0_0_12px_rgb(18_6_11/0.9)]">
                <i className="size-2 flex-none rounded-full bg-landing-brand-hi shadow-[0_0_0_6px_rgb(184_50_95/0.28)]" />
                화면을 눌러 오뚜기를 밀어 보세요. 몇 번을 넘어져도 다시 일어나요.
              </p>
            </div>
          </div>
        </section>

        <section id="auto" className={SECTION}>
          <div className={WRAP}>
            <div className="landing-shade max-w-[560px]">
              <h2 className={H2}>
                손으로 짜던
                <br />한 달을,
                <br />한 번에.
              </h2>
              <p className={LEAD}>
                인원과 규칙을 읽고 31일치를 한 번에 채워요. <b className="font-bold text-white">승인된 연차는 먼저</b>,
                희망 오프는 가능한 만큼 넣고요. 마음에 안 드는 칸만 고치면 돼요.
              </p>
              <div aria-label="근무 색 안내" className="mt-[26px] flex flex-wrap gap-2.5">
                {LANDING_DUTY_LEGEND.map((d) => (
                  <span
                    key={d.label}
                    className="inline-flex items-center gap-2 rounded-full border border-landing-line bg-[rgb(34_12_22/0.7)] px-3.5 py-[7px] text-[14px] text-landing-frost"
                  >
                    <i className={`block size-[11px] rounded-[3px] ${d.swatch}`} />
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="rules" className={SECTION}>
          <div className={WRAP}>
            <div className={SPLIT}>
              <h2 className={H2}>
                위반은
                <br />
                확정 전에
                <br />
                먼저.
              </h2>
              <p className={LEAD}>
                어긴 칸은 빨갛게 깜빡여요. <b className="font-bold text-white">필수 규칙 위반이 0건</b>이어야 근무표를
                확정할 수 있어요.
              </p>
              <LandingPanel rows={LANDING_RULE_ROWS} className={SPLIT_PANEL} />
            </div>
          </div>
        </section>

        <section id="request" className={SECTION}>
          <div className={WRAP}>
            <div className={SPLIT}>
              <h2 className={H2}>
                메신저 대신,
                <br />
                신청함 하나.
              </h2>
              <p className={LEAD}>
                연차와 희망 오프를 한곳에 모아요. <b className="font-bold text-white">승인한 것만</b> 자동 생성에 들어가요.
              </p>
              <LandingPanel rows={LANDING_REQUEST_ROWS} className={SPLIT_PANEL} />
            </div>
          </div>
        </section>

        <section id="stats" className={SECTION}>
          <div className={WRAP}>
            <div className="landing-shade max-w-[560px]">
              <h2 className={H2}>
                편중은
                <br />
                숫자로
                <br />
                보여요.
              </h2>
              <p className={LEAD}>
                간호사별 D · E · N · OFF 횟수와 OFF 목표 대비를 한눈에.{" "}
                <b className="font-bold text-white">팀 평균과 많이 다른 사람</b>은 색으로 알려줘요.
              </p>
            </div>
          </div>
        </section>

        <section id="audit" className={SECTION}>
          <div className={WRAP}>
            <div className="landing-shade max-w-[560px]">
              <h2 className={H2}>
                “왜 이렇게
                <br />
                짰어요?”
                <br />
                기록이 답해요.
              </h2>
              <p className={LEAD}>누가, 언제, 무엇을 바꿨는지 우리 병동 안에서만 볼 수 있어요. 기록은 지우거나 고칠 수 없어요.</p>
              <LandingPanel rows={LANDING_AUDIT_ROWS} className="mt-[30px]" />
            </div>
          </div>
        </section>

        <section id="cta" className={`${SECTION} justify-center`}>
          <div className={`${WRAP} text-center`}>
            <h2 className={`${H2} mx-auto`}>
              다음 달부터는,
              <br />
              알아서.
            </h2>
            <p className={`${LEAD} mx-auto`}>병동 규모와 지금 쓰는 근무표 방식을 알려 주시면 도입 상담을 도와드려요.</p>
            <LandingInquiryForm />
            <div className="h-[30vh]" />
          </div>
        </section>
      </main>

      <footer className="relative z-[1] border-t border-landing-line bg-[rgb(18_6_11/0.9)] py-7 text-[14px] text-landing-mist">
        <div className={`${WRAP} flex flex-wrap justify-between gap-4`}>
          <span>© 2026 오뚜기</span>
          <span>문의 · 개인정보처리방침</span>
        </div>
      </footer>
    </>
  );
}
