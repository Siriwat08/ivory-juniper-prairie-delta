/* เสียงเตือน + การสั่นเครื่องสำหรับแจ้งเตือนในแอป (ทำงานเฉพาะเบราว์เซอร์) */

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function beepOnce(startAt: number, freq = 880, durMs = 180, volume = 0.22) {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const t0 = c.currentTime + startAt;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durMs / 1000 + 0.05);
}

/** เสียงเตือนระดับเฝ้าระวัง (บีบสั้น 1 ครั้ง) */
export function alertWatchBeep() {
  beepOnce(0, 760, 150, 0.15);
}

/** เสียงเตือนระดับต้องดำเนินการ (บีบ 3 ครั้ง เสียงสูง) + สั่นเครื่อง */
export function alertActBeep() {
  beepOnce(0, 960, 200);
  beepOnce(0.28, 960, 200);
  beepOnce(0.56, 1180, 320);
  vibrate();
}

export function vibrate(pattern: number[] = [350, 150, 350, 150, 700]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}
