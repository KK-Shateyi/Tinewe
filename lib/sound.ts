export function playAlertTone(
  frequency: number,
  duration: number,
  repeat = 1
): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;

  const context = new window.AudioContext();
  const start = context.currentTime;

  for (let index = 0; index < repeat; index += 1) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const toneStart = start + index * (duration + 0.08);
    const toneEnd = toneStart + duration;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, toneStart);
    gain.gain.setValueAtTime(0.0001, toneStart);
    gain.gain.exponentialRampToValueAtTime(0.18, toneStart + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(toneStart);
    oscillator.stop(toneEnd);
  }

  window.setTimeout(() => void context.close(), (duration + 0.08) * repeat * 1000 + 100);
}
