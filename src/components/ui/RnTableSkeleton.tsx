export default function RnTableSkeleton() {
  return (
    <div className="flex flex-col gap-8 px-12 pt-12 pb-10" aria-busy="true">
      <div className="h-[72px] w-80 animate-pulse rounded-[12px] bg-surface" />
      <div className="h-11 w-full animate-pulse rounded-full bg-surface" />
      <div className="h-[420px] w-full animate-pulse rounded-[20px] bg-surface" />
    </div>
  );
}
