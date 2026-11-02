"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { isNavActive, useNavModel, type NavItem } from "@/hooks/useNavModel";
import type { ShellInfo } from "@/types/shell.type";
import NavIcon from "./NavIcon";

function NavList({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex h-[52px] w-full shrink-0 items-center gap-3 rounded-[14px] pr-[14px] pl-4 text-[18px] transition-colors duration-150 ${
              active
                ? "bg-primary-soft font-bold text-primary"
                : "font-medium text-ink-sub hover:bg-surface hover:text-ink"
            }`}
          >
            {active ? <span aria-hidden className="absolute top-3 bottom-3 -left-4 w-1 rounded-r-full bg-primary" /> : null}
            <NavIcon href={item.href} />
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.badge ? (
              <span className="min-w-7 rounded-full bg-danger px-2 py-0.5 text-center text-[14px] font-bold text-white shadow-[0_2px_6px_rgb(240_68_82/0.35)]">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar({ shell, onClose }: { shell: ShellInfo; onClose: () => void }) {
  const nav = useNavModel();

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-line bg-white px-4 pt-6 pb-5">
      <div className="flex items-center justify-between pb-2">
        <Link href="/schedule" aria-label="홈으로" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-[11px] bg-primary text-[19px] font-bold text-white shadow-cta"
          >
            O
          </span>
          <span className="text-[22px] font-bold tracking-[-0.02em] text-ink">Ottugi</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="사이드바 닫기"
          className="flex size-10 items-center justify-center rounded-[12px] text-[20px] font-bold text-ink-mute transition-colors hover:bg-surface hover:text-ink"
        >
          «
        </button>
      </div>
      <div className="relative flex w-full flex-col gap-0.5 overflow-hidden rounded-[16px] bg-gradient-to-br from-primary to-primary-strong px-4 py-3.5 text-white shadow-cta">
        <span aria-hidden className="absolute -top-6 -right-6 size-20 rounded-full bg-white/10" />
        <p className="text-[14px] font-medium text-white/80">{shell.hospitalName}</p>
        <p className="text-[18px] font-bold">{shell.wardName}</p>
      </div>
      <div className="h-3 shrink-0" />
      <NavList items={nav.mainItems} />
      <p className="px-4 pt-5 pb-1 text-[16px] font-bold text-ink-mute">병동 관리</p>
      <NavList items={nav.adminItems} />
      <div className="min-h-4 flex-1" />
      <SidebarAccount userName={shell.userName} />
    </aside>
  );
}

// 로그인한 수간호사와 로그아웃. 마이페이지가 없어져(10/26 계약) 로그아웃을 여기에 둔다.
function SidebarAccount({ userName }: { userName: string }) {
  const { run, loading, error } = useLogout();
  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-line bg-canvas px-3 py-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[17px] font-bold text-primary"
        >
          {userName.slice(0, 1)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[17px] font-bold text-ink">{userName}</span>
          <span className="text-[14px] font-medium text-ink-mute">수간호사</span>
        </span>
      </div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="h-10 w-full rounded-[12px] border border-line bg-white text-[16px] font-bold text-ink-sub transition-colors hover:border-grid hover:text-ink disabled:opacity-50"
      >
        {loading ? "로그아웃하는 중…" : "로그아웃"}
      </button>
      {error ? <p role="alert" className="text-[14px] font-medium text-danger">{error}</p> : null}
    </div>
  );
}
