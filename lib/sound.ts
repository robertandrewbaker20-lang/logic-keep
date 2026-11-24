let ctx: AudioContext | null = null;
let muted = false;

export function setSoundMuted(next: boolean) {
  muted = next;
}

function audio(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = "triangle",
  gain = 0.1,
) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    c.currentTime + start + duration,
  );
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

export function playTap() {
  tone(620, 0, 0.07, "sine", 0.05);
}

export function playSlide() {
  tone(280, 0, 0.08, "sine", 0.04);
  tone(340, 0.04, 0.08, "sine", 0.03);
}

export function playSet() {
  tone(523, 0, 0.12, "triangle", 0.09);
  tone(784, 0.08, 0.16, "triangle", 0.08);
}

export function playWrong() {
  tone(180, 0, 0.16, "square", 0.04);
  tone(140, 0.08, 0.18, "square", 0.03);
}

export function playHint() {
  tone(880, 0, 0.1, "sine", 0.05);
  tone(1174, 0.1, 0.14, "sine", 0.05);
}

export function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((f, i) => tone(f, i * 0.09, 0.28, "triangle", 0.09));
}

export function playUnlock() {
  tone(392, 0, 0.12, "triangle", 0.07);
  tone(523, 0.1, 0.18, "triangle", 0.08);
  tone(659, 0.2, 0.22, "triangle", 0.08);
}
