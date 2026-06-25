export function SectorChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-metal-700 bg-site-canvas px-[18px] py-2.5 text-[15px] font-medium text-site-body">
      {label}
    </span>
  );
}
