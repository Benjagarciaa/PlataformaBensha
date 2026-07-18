"use client";

import { useMemo, useState } from "react";
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
 * el mismo patron de bundles que se usa en una pagina de producto.
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

function buildMessage(form: FormState): string {
  const lines = [
    `Hola Benjamin, soy *${form.nombre.trim()}*.`,
    "Te escribo desde tu portfolio para pedir un presupuesto.",
    "",
    `*Qué necesito:* ${form.tipo}`,
    `*Email:* ${form.email.trim()}`,
    "",
    "*Sobre mi producto o marca:*",
    form.proyecto.trim(),
  ];
  if (form.link.trim()) {
    lines.push("", `*Link:* ${form.link.trim()}`);
  }
  lines.push("", "Quedo atento. Gracias.");
  return lines.join("\n");
}

/** Tarjeta de opcion. Encendida: acento, fondo suave y escuadras vivas. */
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
      className="group relative flex flex-col items-start gap-1 border p-4 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
      style={{
        borderColor: selected ? "var(--accent)" : "var(--hairline)",
        backgroundColor: selected ? "var(--accent-soft)" : "var(--surface)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1.5 top-1.5 h-[8px] w-[8px] border-l border-t transition-colors duration-300"
        style={{
          borderColor: selected ? "var(--accent)" : "var(--hairline)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 right-1.5 h-[8px] w-[8px] border-b border-r transition-colors duration-300"
        style={{
          borderColor: selected ? "var(--accent)" : "var(--hairline)",
        }}
      />

      <span
        className="text-[15px] font-medium leading-snug transition-colors duration-300"
        style={{ color: selected ? "var(--accent)" : "var(--text)" }}
      >
        {option.name}
      </span>
      <span className="font-mono text-[9px] uppercase leading-snug tracking-[0.16em] text-[color:var(--text-faint)]">
        {option.hint}
      </span>
    </button>
  );
}

export function Contacto() {
  const { contacto, identity } = content;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
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

  const handleSubmit = () => {
    const next: Errors = {};
    if (!form.nombre.trim()) next.nombre = contacto.errores.nombre;
    if (!form.email.trim()) next.email = contacto.errores.emailVacio;
    else if (!isValidEmail(form.email))
      next.email = contacto.errores.emailInvalido;
    if (!form.tipo) next.tipo = contacto.errores.tipo;
    if (!form.proyecto.trim()) next.proyecto = contacto.errores.proyecto;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const url = `https://wa.me/${identity.whatsappNumber}?text=${encodeURIComponent(
      buildMessage(form),
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Section id="contacto">
      <SectionTitle eyebrow={contacto.eyebrow} title={contacto.title} />

      <Reveal>
        <p className="mb-12 max-w-[60ch] text-[16px] leading-relaxed text-[color:var(--text-dim)] md:text-[17px]">
          {contacto.intro}
        </p>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          {/* ── Qué necesitás: tarjetas, no dropdown ─────────────── */}
          <div>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text)]">
                {contacto.campos.tipo}
              </p>
              {errors.tipo ? (
                <p className="text-[13px] text-[color:var(--accent)]">
                  {errors.tipo}
                </p>
              ) : null}
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

          {/* ── Datos ─────────────────────────────────────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label={contacto.campos.nombre}
              value={form.nombre}
              error={errors.nombre}
              onChange={(event) => update("nombre", event.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
            <Field
              label={contacto.campos.email}
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="nombre@tumarca.com"
              autoComplete="email"
            />
          </div>

          <TextArea
            label={contacto.campos.proyecto}
            value={form.proyecto}
            error={errors.proyecto}
            onChange={(event) => update("proyecto", event.target.value)}
            placeholder="Qué vendés, a quién, y qué te está pasando hoy con tu página."
          />

          <Field
            label={contacto.campos.link}
            value={form.link}
            onChange={(event) => update("link", event.target.value)}
            placeholder="tutienda.com"
            inputMode="url"
          />

          {/* ── Medidor de avance ─────────────────────────────────── */}
          <div>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                {listo ? contacto.medidorListo : contacto.medidorLabel}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300"
                style={{
                  color: listo ? "var(--accent)" : "var(--text-faint)",
                }}
              >
                {completos} / 4
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="h-[3px] flex-1 transition-colors duration-500"
                  style={{
                    backgroundColor:
                      index < completos
                        ? "var(--accent)"
                        : "var(--hairline)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Button
              className="flex-1 md:flex-none"
              onClick={handleSubmit}
              style={{ opacity: listo ? 1 : 0.75 }}
            >
              {contacto.cta}
            </Button>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
              {contacto.ctaNota}
            </p>
          </div>
        </div>

        {/* ── Contacto directo y cómo trabajo ───────────────────────── */}
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-9 lg:sticky lg:top-28">
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                {contacto.directoLabel}
              </p>
              <a
                href={`https://wa.me/${identity.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[17px] text-[color:var(--text)] transition-colors hover:text-[color:var(--accent)]"
              >
                {identity.phoneDisplay}
              </a>
              <a
                href={`mailto:${identity.email}`}
                className="mt-1 block break-all text-[17px] text-[color:var(--text)] transition-colors hover:text-[color:var(--accent)]"
              >
                {identity.email}
              </a>
            </div>

            <div className="border-t border-[color:var(--hairline)] pt-8">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                {contacto.comoLabel}
              </p>
              <ul className="flex flex-col gap-3">
                {contacto.como.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[16px] leading-relaxed text-[color:var(--text-dim)]"
                  >
                    <span
                      aria-hidden
                      className="mt-[10px] h-px w-3 shrink-0 bg-[color:var(--accent)]"
                    />
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
