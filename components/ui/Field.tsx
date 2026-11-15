import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const ETIQUETA = "flex flex-col gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-dim)]";
const CAMPO =
  "border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-4 py-3.5 font-sans text-[16px] font-normal normal-case tracking-normal text-[color:var(--text)] outline-none transition-colors duration-300 placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]";
const ERROR = "font-sans text-[14px] normal-case tracking-normal text-[color:var(--accent)]";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/** Campo con label arriba siempre visible (nunca el placeholder como label). */
export function Field({ label, error, className, ...props }: FieldProps) {
  return (
    <label className={ETIQUETA}>
      <span>{label}</span>
      <input {...props} aria-invalid={error ? true : undefined} className={cn(CAMPO, className)} />
      {error ? <span className={ERROR}>{error}</span> : null}
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <label className={ETIQUETA}>
      <span>{label}</span>
      <textarea
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(CAMPO, "min-h-[140px] resize-y", className)}
      />
      {error ? <span className={ERROR}>{error}</span> : null}
    </label>
  );
}
