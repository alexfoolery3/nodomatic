import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = { label: string; href?: string };

/** Percorso di navigazione gerarchico. L'ultimo item (o senza href) è la pagina corrente. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast || !item.href;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="text-site-muted transition-colors hover:text-site-text"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-site-body" aria-current="page">
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 shrink-0 text-site-muted" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
