import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const ETIQUETA = "flex flex-col gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-dim)]";
const CAMPO =
  "border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-4 py-3.5 font-sans text-[16px] font-normal normal-case tracking-normal text-[color:var(--text)] outline-none transition-colors duration-300 placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)] aria-[invalid=true]:border-[color:var(--accent-line)]";

/**
 * El aviso de error: el texto va conectado al campo (aria-describedby) y lleva
 * un icono, asi no depende solo del color (el celeste es el unico acento).
 */
export function ErrorCampo({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span
      id={id}
      className="flex items-start gap-2 font-sans text-[14px] normal-case leading-snug tracking-normal text-[color:var(--accent)]"
    >
      <svg aria-hidden viewBox="0 0 14 14" className="mt-[2px] h-3.5 w-3.5 shrink-0">
        <rect x="0.75" y="0.75" width="12.5" height="12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 3.5v4.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6.25" y="9.5" width="1.5" height="1.5" fill="currentColor" />
      </svg>
      {children}
    </span>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/** Campo con label arriba siempre visible (nunca el placeholder como label). */
export function Field({ label, error, className, ...props }: FieldProps) {
  const idError = useId();
  return (
    <label className={ETIQUETA}>
      <span>{label}</span>
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={cn(CAMPO, className)}
      />
      {error ? <ErrorCampo id={idError}>{error}</ErrorCampo> : null}
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  const idError = useId();
  return (
    <label className={ETIQUETA}>
      <span>{label}</span>
      <textarea
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        className={cn(CAMPO, "min-h-[140px] resize-y", className)}
      />
      {error ? <ErrorCampo id={idError}>{error}</ErrorCampo> : null}
    </label>
  );
}
