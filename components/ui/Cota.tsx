import { cn } from "@/lib/utils";

type CotaProps = {
  label?: string;
  className?: string;
};

export function Cota({ label, className }: CotaProps) {
  return (
    <div className={cn("relative my-8 flex items-center justify-center", className)}>
      <div className="h-px w-full bg-[color:var(--hairline)]" />
      <div className="absolute left-0 top-1/2 h-4 w-[1px] -translate-y-1/2 bg-[color:var(--hairline)]" />
      <div className="absolute right-0 top-1/2 h-4 w-[1px] -translate-y-1/2 bg-[color:var(--hairline)]" />
      {label ? (
        <span className="absolute top-0 -translate-y-1/2 bg-[color:var(--bg)] px-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
