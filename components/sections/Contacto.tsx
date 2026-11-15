"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Section } from "@/components/ui/Section";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { content } from "@/content/data";

/**
 * El cotizador. Sin backend: arma un mensaje estructurado y abre wa.me.
 *
 * Nada de <select> nativo: en mobile abre el picker gris del sistema y se lleva
 * puesta la identidad de la pagina. Va una grilla de tarjetas seleccionables,
 * el mismo patron de combos que se usa en una pagina de producto.
 *
 * Vida: un pulso suave junto a "respondo en el dia" (loop CSS, solo con la
 * seccion en pantalla) y, al enviar, una confirmacion con un check que se
 * dibuja. Servicios preselecciona la opcion con el evento
 * "preseleccionar-servicio".
 */

type FormState = {
  nombre: string;
  email: string;
  tipo: string;
  proyecto: string;
  link: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  nombre: "",
  email: "",
  tipo: "",
  proyecto: "",
  link: "",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * El link es opcional, pero si lo completan tiene que parecer una direccion
 * real: un dominio con punto y terminacion (tutienda.com), con o sin http y
 * con o sin ruta. Asi no pasa un "asdasd" cualquiera.
 */
function isValidLink(value: string): boolean {
  return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(value.trim());
}

function buildMessage(form: FormState): string {
  const { wa } = content.contacto;
  const lines = [
    `${wa.saludo} *${form.nombre.trim()}*.`,
    wa.intro,
    "",
    `*${wa.labelTipo}* ${form.tipo}`,
    `*${wa.labelEmail}* ${form.email.trim()}`,
    "",
    `*${wa.labelProducto}*`,
    form.proyecto.trim(),
  ];
  if (form.link.trim()) {
    lines.push("", `*${wa.labelLink}* ${form.link.trim()}`);
  }
  lines.push("", wa.cierre);
  return lines.join("\n");
}

/** Tarjeta de opcion. Encendida: borde y texto en acento, fondo suave. */
function OpcionTarjeta({
  option,
  selected,
  onSelect,
}: {
  option: { id: string; name: string; hint: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="relative flex cursor-pointer flex-col items-start gap-1.5 border p-4 text-left transition-[border-color,background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
      style={{
        borderColor: selected ? "var(--accent)" : "var(--hairline-strong)",
        backgroundColor: selected ? "var(--accent-soft)" : "var(--surface)",
      }}
    >
      <span
        className="text-[16px] font-medium leading-snug transition-colors duration-300"
        style={{ color: selected ? "var(--accent)" : "var(--text)" }}
      >
        {option.name}
      </span>
      <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.14em] text-[color:var(--text-dim)]">
        {option.hint}
      </span>
    </button>
  );
}

export function Contacto() {
  const { contacto, identity } = content;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [enviado, setEnviado] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  // Validacion al salir del campo (blur): el aviso aparece apenas termina de
  // escribir y hace clic afuera, no recien al mandar. Solo revisa el formato
  // de lo que ya escribio; si el campo quedo vacio no molesta (eso lo toma el
  // envio). Aplica a email y link, que son los que tienen un formato esperado.
  const handleBlur = (key: "email" | "link") => {
    const value = form[key].trim();
    setErrors((current) => {
      if (!value) return { ...current, [key]: undefined };
      const ok = key === "email" ? isValidEmail(value) : isValidLink(value);
      const message =
        key === "email"
          ? contacto.errores.emailInvalido
          : contacto.errores.linkInvalido;
      return { ...current, [key]: ok ? undefined : message };
    });
  };

  // Avance real: cuatro campos obligatorios. El medidor es honesto, no decorativo.
  const completos = useMemo(() => {
    let count = 0;
    if (form.nombre.trim()) count += 1;
    if (isValidEmail(form.email)) count += 1;
    if (form.tipo) count += 1;
    if (form.proyecto.trim().length > 8) count += 1;
    return count;
  }, [form]);

  const listo = completos === 4;

  // Preseleccion: Servicios avisa por evento que servicio se toco y se marca
  // esa opcion. El scroll suave lo maneja Servicios (mismo patron que el Nav).
  useEffect(() => {
    const onPreseleccion = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const opcion = contacto.opciones.find((o) => o.id === id);
      if (!opcion) return;
      setForm((current) => ({ ...current, tipo: opcion.name }));
      setErrors((current) => ({ ...current, tipo: undefined }));
    };
    window.addEventListener("preseleccionar-servicio", onPreseleccion);
    return () =>
      window.removeEventListener("preseleccionar-servicio", onPreseleccion);
  }, [contacto.opciones]);

  const handleSubmit = () => {
    const next: Errors = {};
    if (!form.nombre.trim()) next.nombre = contacto.errores.nombre;
    if (!form.email.trim()) next.email = contacto.errores.emailVacio;
    else if (!isValidEmail(form.email))
      next.email = contacto.errores.emailInvalido;
    if (!form.tipo) next.tipo = contacto.errores.tipo;
    if (!form.proyecto.trim()) next.proyecto = contacto.errores.proyecto;
    if (form.link.trim() && !isValidLink(form.link))
      next.link = contacto.errores.linkInvalido;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const url = `https://wa.me/${identity.whatsappNumber}?text=${encodeURIComponent(
      buildMessage(form),
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setEnviado(true);
  };

  const otraVez = () => {
    setForm(EMPTY);
    setErrors({});
    setEnviado(false);
  };

  return (
    <Section id="contacto">
      <SectionTitle eyebrow={contacto.eyebrow} title={contacto.title} intro={contacto.intro} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-20">
        <Reveal>
          <AnimatePresence mode="wait" initial={false}>
            {enviado ? (
              <motion.div
                key="exito"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex min-h-[420px] flex-col items-start justify-center border border-[color:var(--accent-line)] bg-[color:var(--surface)] p-8 md:p-12"
                role="status"
              >
                <svg viewBox="0 0 56 56" className="h-14 w-14" aria-hidden>
                  <motion.rect
                    x="1"
                    y="1"
                    width="54"
                    height="54"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: "28px 28px" }}
                  />
                  <motion.path
                    d="M16 29l8 8 16-18"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <p className="mt-8 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-[color:var(--text)]">
                  {contacto.exito.titulo}
                </p>
                <p className="mt-4 max-w-[44ch] text-[17px] leading-[1.6] text-[color:var(--text-dim)]">
                  {contacto.exito.texto}
                </p>
                <Button variant="secondary" className="mt-8" onClick={otraVez}>
                  {contacto.exito.otra}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-9"
              >
                {/* ── Qué necesitás: tarjetas, no dropdown ── */}
                <div>
                  <div className="mb-4 flex items-baseline justify-between gap-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-dim)]">
                      {contacto.campos.tipo}
                    </p>
                    {errors.tipo ? <p className="text-[14px] text-[color:var(--accent)]">{errors.tipo}</p> : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {contacto.opciones.map((option) => (
                      <OpcionTarjeta
                        key={option.id}
                        option={option}
                        selected={form.tipo === option.name}
                        onSelect={() => update("tipo", option.name)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label={contacto.campos.nombre}
                    value={form.nombre}
                    error={errors.nombre}
                    onChange={(event) => update("nombre", event.target.value)}
                    placeholder={contacto.placeholders.nombre}
                    autoComplete="name"
                  />
                  <Field
                    label={contacto.campos.email}
                    type="email"
                    value={form.email}
                    error={errors.email}
                    onChange={(event) => update("email", event.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder={contacto.placeholders.email}
                    autoComplete="email"
                  />
                </div>

                <TextArea
                  label={contacto.campos.proyecto}
                  value={form.proyecto}
                  error={errors.proyecto}
                  onChange={(event) => update("proyecto", event.target.value)}
                  placeholder={contacto.placeholders.proyecto}
                />

                <Field
                  label={contacto.campos.link}
                  value={form.link}
                  error={errors.link}
                  onChange={(event) => update("link", event.target.value)}
                  onBlur={() => handleBlur("link")}
                  placeholder={contacto.placeholders.link}
                  inputMode="url"
                />

                {/* ── Medidor de avance: honesto, cuenta campos reales ── */}
                <div>
                  <div className="mb-3 flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-dim)]">
                      {listo ? contacto.medidorListo : contacto.medidorLabel}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300"
                      style={{ color: listo ? "var(--accent)" : "var(--text-dim)" }}
                    >
                      {completos} / 4
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((index) => (
                      <span key={index} className="relative h-[3px] flex-1 bg-[color:var(--hairline-strong)]">
                        <span
                          className="absolute inset-0 origin-left bg-[color:var(--accent)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          style={{ transform: index < completos ? "scaleX(1)" : "scaleX(0)" }}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <Button className="flex-1 md:flex-none" onClick={handleSubmit} style={{ opacity: listo ? 1 : 0.8 }}>
                    {contacto.cta}
                  </Button>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-dim)]">
                    {contacto.ctaNota}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>

        {/* ── Contacto directo y cómo trabajo ── */}
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-10 lg:sticky lg:top-28">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent)]">
              <span aria-hidden className="relative grid h-3 w-3 place-items-center">
                <span className="loop a-anillo absolute inset-0 border border-[color:var(--accent)] opacity-0" />
                <span className="h-2 w-2 bg-[color:var(--accent)]" />
              </span>
              {contacto.respuesta}
            </p>
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-dim)]">
                {contacto.directoLabel}
              </p>
              <a
                href={`https://wa.me/${identity.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                data-copiable
                className="block font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-semibold tracking-[-0.005em] text-[color:var(--text)] transition-colors hover:text-[color:var(--accent)]"
              >
                {identity.phoneDisplay}
              </a>
              <a
                href={`mailto:${identity.email}`}
                data-copiable
                className="mt-2 block break-all text-[18px] text-[color:var(--text-soft)] transition-colors hover:text-[color:var(--accent)]"
              >
                {identity.email}
              </a>
            </div>

            <div className="border-t border-[color:var(--hairline-strong)] pt-8">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-dim)]">
                {contacto.comoLabel}
              </p>
              <ul className="flex flex-col gap-4">
                {contacto.como.map((item) => (
                  <li key={item} className="flex gap-3 text-[17px] leading-[1.5] text-[color:var(--text-soft)]">
                    <span aria-hidden className="mt-[12px] h-px w-4 shrink-0 bg-[color:var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
