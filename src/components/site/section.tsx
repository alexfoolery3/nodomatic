import { cn } from "@/lib/utils";

/** Fascia full-width con contenuto centrato a max 1200px. Sfondo canvas o surface. */
export function Section({
  id,
  children,
  className,
  containerClassName,
  surface = "canvas",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  surface?: "canvas" | "surface";
}) {
  return (
    <section
      id={id}
      className={cn(
        surface === "surface" ? "bg-site-surface" : "bg-site-canvas",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[1200px] px-6 md:px-14",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
