export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function xpLevel(xp: number): { level: number; label: string; nextXp: number } {
  const thresholds = [0, 100, 300, 700, 1500, 3000, 6000, 12000, 25000, 50000];
  const labels = [
    "Beginner", "Learner", "Coder", "Builder", "Developer",
    "Engineer", "Architect", "Expert", "Master", "Legend",
  ];
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i; break; }
  }
  return {
    level: level + 1,
    label: labels[level] ?? "Legend",
    nextXp: thresholds[level + 1] ?? thresholds[thresholds.length - 1],
  };
}
