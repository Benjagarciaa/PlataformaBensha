export function Grano() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] opacity-[0.025]" aria-hidden="true">
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 160 160\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"1\"/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
