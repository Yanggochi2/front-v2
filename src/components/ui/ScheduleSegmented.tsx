import Link from "next/link";

type Option<T extends string> = { value: T; label: string; href?: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange?: (value: T) => void;
  ariaLabel: string;
  itemClassName?: string;
};

// 회색 바탕 안에서 선택 칸만 흰색으로 올라오는 구간 선택. href가 있으면 링크로 렌더링한다.
export default function ScheduleSegmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  itemClassName = "w-16",
}: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex shrink-0 gap-0.5 rounded-[16px] bg-surface p-1 ring-1 ring-line ring-inset">
      {options.map((o) => {
        const active = o.value === value;
        const cls = `flex h-11 items-center justify-center rounded-[12px] text-[16px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary ${itemClassName} ${
          active ? "bg-white font-bold text-primary shadow-[0_1px_3px_rgb(25_31_40/0.12)]" : "font-medium text-ink-sub hover:text-ink"
        }`;
        return o.href ? (
          <Link key={o.value} href={o.href} aria-current={active ? "true" : undefined} className={cls}>
            {o.label}
          </Link>
        ) : (
          <button key={o.value} type="button" aria-pressed={active} onClick={() => onChange?.(o.value)} className={cls}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
