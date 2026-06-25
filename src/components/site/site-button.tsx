import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const siteButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-metal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-site-canvas disabled:opacity-60 disabled:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-site-text text-site-canvas hover:bg-white",
        secondary:
          "bg-site-surface text-site-text border border-site-line hover:border-metal-600",
        ghost: "text-site-body hover:text-site-text",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-[22px] text-[16px]",
        lg: "h-12 px-7 text-[16px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type SiteButtonProps = VariantProps<typeof siteButton> & {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function SiteButton({
  children,
  className,
  href,
  type = "button",
  disabled,
  variant,
  size,
}: SiteButtonProps) {
  const classes = cn(siteButton({ variant, size }), className);

  if (href) {
    if (/^https?:\/\//.test(href)) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
