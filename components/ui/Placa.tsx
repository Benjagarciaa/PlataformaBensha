import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PlacaProps = {
  children: ReactNode;
  className?: string;
};

export function Placa({ children, className }: PlacaProps) {
  return (
    <div className={cn("group relative overflow-hidden bg-[color:var(--surface)] p-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1", className)}>
      <span className="absolute left-0 top-0 h-[10px] w-[10px] border-l border-t border-[color:var(--hairline)] transition-colors duration-300 group-hover:border-[color:var(--accent)]" />
      <span className="absolute right-0 top-0 h-[10px] w-[10px] border-r border-t border-[color:var(--hairline)] transition-colors duration-300 group-hover:border-[color:var(--accent)]" />
      <span className="absolute bottom-0 left-0 h-[10px] w-[10px] border-b border-l border-[color:var(--hairline)] transition-colors duration-300 group-hover:border-[color:var(--accent)]" />
      <span className="absolute bottom-0 right-0 h-[10px] w-[10px] border-b border-r border-[color:var(--hairline)] transition-colors duration-300 group-hover:border-[color:var(--accent)]" />
      {children}
    </div>
  );
}
