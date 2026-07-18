"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

export function useViewportProgress() {
  const [isReady, setIsReady] = useState(false);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
  });

  const progress = useTransform(smoothProgress, (value) => Math.max(0, Math.min(1, value)));

  useEffect(() => {
    setIsReady(true);
  }, []);

  return useMemo(
    () => ({
      isReady,
      progress,
      progressValue: smoothProgress,
    }),
    [isReady, progress, smoothProgress]
  );
}
