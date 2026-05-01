/**
 * celebrate() — confetti burst fired every time a tutorial step is passed.
 * First step gets a bigger flash to hook the user. All steps feel rewarding.
 * Lazy-loads canvas-confetti so it does not bloat the initial bundle.
 */
export function celebrate(firstStep = false) {
  import("canvas-confetti").then((mod) => {
    const canvasConfetti = mod.default;

    if (firstStep) {
      // Bigger first-step burst — dopamine spike to hook the user
      canvasConfetti({
        particleCount: 120,
        spread: 100,
        startVelocity: 35,
        decay: 0.91,
        scalar: 1.0,
        origin: { x: 0.5, y: 0.65 },
        colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"],
      });
      // Side burst for extra oomph
      setTimeout(() => {
        canvasConfetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#6366f1", "#8b5cf6", "#10b981"],
        });
        canvasConfetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#f59e0b", "#ec4899", "#3b82f6"],
        });
      }, 150);
    } else {
      // Regular step pass — bigger than before (80 particles, wider spread)
      canvasConfetti({
        particleCount: 80,
        spread: 80,
        startVelocity: 30,
        decay: 0.92,
        scalar: 0.9,
        origin: { x: 0.5, y: 0.65 },
        colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6"],
      });
    }
  });
}
