import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

/** Lockup logo: simbolo + wordmark. Cliccabile verso la home per default. */
export function Logo({
  className,
  href = "/",
  markSize = 26,
}: {
  className?: string;
  href?: string;
  markSize?: number;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className="text-[20px] font-semibold tracking-tight text-site-text">
        Nodomatic
      </span>
    </Link>
  );
}
