import Link from "next/link";

const base =
  "inline-flex items-center rounded-full border border-metal-700 bg-site-canvas px-[18px] py-2.5 text-[15px] font-medium text-site-body transition-colors";

export function SectorChip({ label, href }: { label: string; href?: string }) {
  if (href) {
    return (
      <Link href={href} className={`${base} hover:border-metal-500 hover:text-site-text`}>
        {label}
      </Link>
    );
  }
  return <span className={base}>{label}</span>;
}
