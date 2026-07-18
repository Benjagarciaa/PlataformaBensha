"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";

const DEFAULT_INTERVAL = 5200;
const BASE_RATE = 1;

type TrazoContextValue = {
  onFrame: (callback: (value: number) => void) => () => void;
  onPass: (callback: (value: number) => void) => () => void;
  setRate: (multiplier: number) => void;
};

const TrazoContext = createContext<TrazoContextValue | null>(null);

export function TrazoProvider({ children }: { children: React.ReactNode }) {
  const frameCallbacks = useRef<Set<(value: number) => void>>(new Set());
  const passCallbacks = useRef<Set<(value: number) => void>>(new Set());
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const rateRef = useRef<number>(BASE_RATE);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyReducedMotion = () => {
      reducedMotionRef.current = media.matches;
      if (reducedMotionRef.current) {
        const root = document.documentElement;
        root.style.setProperty("--trazo", "0.5");
        root.style.setProperty("--trazo-b", "0.5");
      }
    };

    applyReducedMotion();
    media.addEventListener("change", applyReducedMotion);

    if (reducedMotionRef.current) {
      return () => media.removeEventListener("change", applyReducedMotion);
    }

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startRef.current;
      const cycle = elapsed / (DEFAULT_INTERVAL / rateRef.current);
      const normalized = ((cycle % 1) + 1) % 1;
      const trazo = Math.min(1, Math.max(0, 0.5 + 0.5 * Math.sin(normalized * Math.PI * 2)));
      const trazoB = Math.min(1, Math.max(0, 0.5 + 0.5 * Math.sin((normalized + 0.5) * Math.PI * 2)));
      document.documentElement.style.setProperty("--trazo", trazo.toFixed(4));
      document.documentElement.style.setProperty("--trazo-b", trazoB.toFixed(4));

      frameCallbacks.current.forEach((callback) => callback(trazo));
      if (Math.abs(normalized - 0.5) < 0.02) {
        passCallbacks.current.forEach((callback) => callback(trazo));
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else if (!rafRef.current) {
        startRef.current = performance.now();
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      media.removeEventListener("change", applyReducedMotion);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const contextValue = useMemo<TrazoContextValue>(
    () => ({
      onFrame: (callback) => {
        frameCallbacks.current.add(callback);
        return () => frameCallbacks.current.delete(callback);
      },
      onPass: (callback) => {
        passCallbacks.current.add(callback);
        return () => passCallbacks.current.delete(callback);
      },
      setRate: (multiplier) => {
        rateRef.current = Math.max(0.3, multiplier);
      },
    }),
    []
  );

  return <TrazoContext.Provider value={contextValue}>{children}</TrazoContext.Provider>;
}

export function useTrazo() {
  const context = useContext(TrazoContext);
  if (!context) {
    throw new Error("useTrazo must be used within a TrazoProvider");
  }
  return context;
}
