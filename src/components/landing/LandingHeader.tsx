import { LANDING_NAV } from "@/constants/landing.constants";
import LandingButton from "./LandingButton";

export default function LandingHeader() {
  return (
    <header className="landing-header-fade fixed inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 w-[min(1240px,100%-40px)] items-center justify-between gap-6">
        <a href="#hero" className="font-display text-[26px] tracking-[-0.02em] text-white no-underline">
          오뚜기
        </a>
        <nav aria-label="주요 메뉴" className="flex gap-[30px]">
          {LANDING_NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-[16px] font-medium text-[#f6eaef] no-underline hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <LandingButton href="/login" variant="ghost" size="sm">
            로그인
          </LandingButton>
          <LandingButton href="#cta" size="sm">
            도입 문의
          </LandingButton>
        </div>
      </div>
    </header>
  );
}
