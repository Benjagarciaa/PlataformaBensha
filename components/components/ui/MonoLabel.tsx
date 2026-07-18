import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MonoLabelProps = {
  children: ReactNode;
  className?: string;
};

export function MonoLabel({ children, className }: MonoLabelProps) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
