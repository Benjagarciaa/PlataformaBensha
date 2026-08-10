export function Grilla() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_35%,transparent_85%)]"
      aria-hidden="true"
    />
  );
}
