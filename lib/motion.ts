export const motionEasing = [0.16, 1, 0.3, 1] as const;
export const motionSpring = { stiffness: 100, damping: 20 };

export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
