"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Extra delay in ms before the animation starts (for staggered sections) */
  delay?: number;
  className?: string;
}

function getInitialReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Wraps children in a div that fades + slides up into view when it enters
 * the viewport. Uses IntersectionObserver — no external dependencies.
 */
export default function FadeInSection({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(getInitialReduceMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.07, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay, reduceMotion]);

  const isVisible = reduceMotion || visible;
  const motionClass = reduceMotion
    ? ""
    : isVisible
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-6";

  return (
    <div
      ref={ref}
      className={`${reduceMotion ? "" : "transition-all duration-700 ease-out"} ${motionClass} ${className}`}
    >
      {children}
    </div>
  );
}
