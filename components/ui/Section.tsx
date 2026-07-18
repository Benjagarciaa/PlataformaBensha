import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  bleed?: boolean;
  cota?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Sin borde superior a proposito: el aire separa mejor que una linea.
 * Con borde en cada seccion la pagina se lee troceada en vez de continua.
 * La separacion marcada se reserva para las cotas, maximo 3 en toda la pagina.
 */
export function Section({ id, bleed = false, cota, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-10 w-full py-20 md:py-32",
        bleed && "-mx-6 md:-mx-12 lg:-mx-28",
        className
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col px-6 md:px-12 lg:pl-28 lg:pr-20">
        {cota ? (
          <div className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            <span className="h-px flex-1 bg-[color:var(--hairline)]" />
            <span>{cota}</span>
            <span className="h-px flex-1 bg-[color:var(--hairline)]" />
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}