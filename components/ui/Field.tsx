import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-[13px] uppercase tracking-[0.16em] text-[color:var(--text)]">
      <span>{label}</span>
      <input
        {...props}
        className={cn(
          "border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-3 text-[15px] font-normal normal-case tracking-normal text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]",
          className
        )}
      />
      {error ? <span className="text-[13px] normal-case tracking-normal text-[color:var(--accent)]">{error}</span> : null}
    </label>
  );
}

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export function SelectField({ label, error, className, ...props }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-[13px] uppercase tracking-[0.16em] text-[color:var(--text)]">
      <span>{label}</span>
      <select
        {...props}
        className={cn(
          "border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-3 text-[15px] font-normal normal-case tracking-normal text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]",
          className
        )}
      />
      {error ? <span className="text-[13px] normal-case tracking-normal text-[color:var(--accent)]">{error}</span> : null}
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <label className="flex flex-col gap-2 text-[13px] uppercase tracking-[0.16em] text-[color:var(--text)]">
      <span>{label}</span>
      <textarea
        {...props}
        className={cn(
          "min-h-[140px] border border-[color:var(--hairline)] bg-[color:var(--surface)] px-4 py-3 text-[15px] font-normal normal-case tracking-normal text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]",
          className
        )}
      />
      {error ? <span className="text-[13px] normal-case tracking-normal text-[color:var(--accent)]">{error}</span> : null}
    </label>
  );
}
