import { cn } from "@/lib/utils";

/** Label piccola maiuscola in tono metallico, sopra titoli di sezione. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em] text-metal-300",
        className,
      )}
    >
      {children}
    </p>
  );
}
