export function buildWaUrl({
  phone,
  name,
  email,
  type,
  description,
  link,
}: {
  phone: string;
  name: string;
  email: string;
  type: string;
  description: string;
  link?: string;
}) {
  const lines = [
    "Hola Benjamin, te contacto desde tu portfolio.",
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Necesidad: ${type}`,
    `Descripción: ${description}`,
  ];

  if (link) {
    lines.push(`Link: ${link}`);
  }

  lines.push("Gracias.");

  const message = lines.join("\n");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
