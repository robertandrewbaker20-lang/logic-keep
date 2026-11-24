import confetti from "canvas-confetti";

export function burstWin() {
  const colors = ["#F4C95D", "#FF6B57", "#2EC4B6", "#7B5EA7", "#FFF6E8"];
  confetti({
    particleCount: 110,
    spread: 78,
    origin: { y: 0.62 },
    colors,
    scalar: 1.05,
  });
  window.setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
  }, 180);
}
