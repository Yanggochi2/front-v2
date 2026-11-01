type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export default function ScheduleToggle({ checked, onChange, label }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[16px] font-medium text-ink-sub">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${checked ? "bg-primary" : "bg-grid"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
      <span>{label}</span>
    </label>
  );
}
