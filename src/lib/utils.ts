import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge di classi Tailwind (pattern shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
