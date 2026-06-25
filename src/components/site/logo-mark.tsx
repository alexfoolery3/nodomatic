/** Logo-mark Nodomatic: monogramma "N" a nodi, finitura argento metallico (SVG). */
export function LogoMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="nodomatic-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#edeff2" />
          <stop offset="0.5" stopColor="#9aa1ab" />
          <stop offset="1" stopColor="#d7dce2" />
        </linearGradient>
      </defs>
      <path
        d="M12 36V12L36 36V12"
        stroke="url(#nodomatic-metal)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.8" fill="url(#nodomatic-metal)" />
      <circle cx="12" cy="36" r="3.8" fill="url(#nodomatic-metal)" />
      <circle cx="36" cy="12" r="3.8" fill="url(#nodomatic-metal)" />
      <circle cx="36" cy="36" r="3.8" fill="url(#nodomatic-metal)" />
    </svg>
  );
}
