import { useRef, useCallback } from "react";

/**
 * SOUND FILES — put these in your project:
 *
 *   public/
 *     sounds/
 *       counting.mp3   ← the ticking/countdown sound during betting phase
 *       flyaway.mp3    ← the whoosh when the plane flies away (crash)
 */

const SOUNDS = {
  counting: "/sounds/counting.mp3",
  flyaway:  "/sounds/flyaway.mp3",
};

export function useSoundEngine() {
  const ctxRef      = useRef(null);
  const buffersRef  = useRef({});       // decoded AudioBuffers
  const countingRef = useRef(null);     // currently playing counting node
  const soundOnRef  = useRef(true);
  const loadedRef   = useRef(false);

  // ── AudioContext ────────────────────────────────────────────────────────
  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch { return null; }
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // ── Preload both files once ─────────────────────────────────────────────
  const preload = useCallback(async () => {
    if (loadedRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      await Promise.all(
        Object.entries(SOUNDS).map(async ([key, path]) => {
          const res  = await fetch(path);
          const ab   = await res.arrayBuffer();
          buffersRef.current[key] = await ctx.decodeAudioData(ab);
        })
      );
      loadedRef.current = true;
    } catch (e) {
      console.warn("useSoundEngine: failed to load sound files.", e);
    }
  }, [getCtx]);

  // ── Helper: play a buffer ───────────────────────────────────────────────
  const playBuffer = useCallback((key, { loop = false, volume = 1 } = {}) => {
    const ctx = getCtx(); if (!ctx) return null;
    const buffer = buffersRef.current[key]; if (!buffer) return null;
    try {
      const src  = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer      = buffer;
      src.loop        = loop;
      gain.gain.value = volume;
      src.connect(gain); gain.connect(ctx.destination);
      src.start();
      return { src, gain };
    } catch { return null; }
  }, [getCtx]);

  // ── 1. COUNTING — loops during betting phase ────────────────────────────
  const startCounting = useCallback(async () => {
    if (!soundOnRef.current) return;
    await preload();
    if (countingRef.current) return; // already playing
    const node = playBuffer("counting", { loop: true, volume: 0.9 });
    if (node) countingRef.current = node;
  }, [preload, playBuffer]);

  const stopCounting = useCallback(() => {
    if (!countingRef.current) return;
    try {
      const { src, gain } = countingRef.current;
      const ctx = ctxRef.current;
      if (ctx) {
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
        setTimeout(() => { try { src.stop(); } catch {} }, 300);
      } else {
        src.stop();
      }
    } catch {}
    countingRef.current = null;
  }, []);

  // ── 2. FLY AWAY — one-shot when plane crashes ───────────────────────────
  const playFlyaway = useCallback(async () => {
    if (!soundOnRef.current) return;
    await preload();
    playBuffer("flyaway", { loop: false, volume: 1.0 });
  }, [preload, playBuffer]);

  // ── Master mute ─────────────────────────────────────────────────────────
  const setSoundOn = useCallback((val) => {
    soundOnRef.current = val;
    if (!val) stopCounting();
  }, [stopCounting]);

  return {
    preload,          // call on app mount to load files early
    startCounting,    // call when betting phase begins
    stopCounting,     // call when betting phase ends
    playFlyaway,      // call when plane flies away
    setSoundOn,       // true/false to mute/unmute
  };
}
