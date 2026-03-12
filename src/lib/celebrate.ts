/**
 * celebrate() — small confetti burst fired every time a tutorial step is passed.
 * Intentionally lighter than the big chapter-completion fireworks in useStepProgress.
 * Lazy-loads canvas-confetti so it does not bloat the initial bundle.
 */
export function celebrate() {
  import("canvas-confetti").then((mod) => {
    mod.default({
      particleCount: 50,
      spread: 60,
      startVelocity: 28,
      decay: 0.92,
      scalar: 0.85,
      origin: { x: 0.5, y: 0.65 },
      colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6"],
    });
  });
}
