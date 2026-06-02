import { useRef, useCallback } from "react";

const SOUNDS = {
  counting: "/sounds/counting.mp3",
  flyaway:  "/sounds/flyaway.mp3",
};

export function useSoundEngine() {
  const ctxRef     = useRef(null);
  const buffersRef = useRef({});
  const humRef     = useRef(null);
  const soundOnRef = useRef(true);
  const loadedRef  = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const preload = useCallback(async () => {
    if (loadedRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      await Promise.all(
        Object.entries(SOUNDS).map(async ([key, path]) => {
          const res = await fetch(path);
          if (!res.ok) throw new Error(`Failed: ${path}`);
          const ab  = await res.arrayBuffer();
          buffersRef.current[key] = await ctx.decodeAudioData(ab);
        })
      );
      loadedRef.current = true;
      console.log("✅ Sounds loaded");
    } catch (e) { console.warn("Sound load error:", e.message); }
  }, [getCtx]);

  const startHum = useCallback(async () => {
    if (!soundOnRef.current) return;
    await preload();
    const ctx = getCtx(); if (!ctx) return;
    const buffer = buffersRef.current["counting"]; if (!buffer) return;
    try {
      if (humRef.current) { try { humRef.current.src.stop(); } catch {} humRef.current = null; }
      const src  = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buffer; src.loop = true;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6);
      src.connect(gain); gain.connect(ctx.destination);
      src.start();
      humRef.current = { src, gain };
    } catch (e) { console.warn("startHum:", e); }
  }, [preload, getCtx]);

  const updateHum = useCallback((mult) => {
    if (!humRef.current || !soundOnRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      const rate = Math.min(1 + (mult - 1) * 0.02, 1.8);
      humRef.current.src.playbackRate.setTargetAtTime(rate, ctx.currentTime, 0.4);
    } catch {}
  }, [getCtx]);

  const stopHum = useCallback(() => {
    if (!humRef.current) return;
    const ctx = ctxRef.current;
    try {
      if (ctx) {
        humRef.current.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
        const s = humRef.current.src;
        setTimeout(() => { try { s.stop(); } catch {} }, 500);
      } else { humRef.current.src.stop(); }
    } catch {}
    humRef.current = null;
  }, []);

  const playCrash = useCallback(async () => {
    if (!soundOnRef.current) return;
    await preload();
    const ctx = getCtx(); if (!ctx) return;
    const buffer = buffersRef.current["flyaway"]; if (!buffer) return;
    try {
      const src  = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buffer; gain.gain.value = 1.0;
      src.connect(gain); gain.connect(ctx.destination);
      src.start();
    } catch (e) { console.warn("playCrash:", e); }
  }, [preload, getCtx]);

  const playCashout = useCallback(() => {
    if (!soundOnRef.current) return;
    const ctx = getCtx(); if (!ctx) return;
    try {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.22, ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime + 0.5, 0.1);
      master.connect(ctx.destination);
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        const t   = ctx.currentTime + i * 0.08;
        osc.type = "sine"; osc.frequency.value = freq;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(1, t + 0.015);
        env.gain.setTargetAtTime(0, t + 0.06, 0.08);
        osc.connect(env); env.connect(master);
        osc.start(t); osc.stop(t + 0.4);
      });
    } catch (e) { console.warn("playCashout:", e); }
  }, [getCtx]);

  const setSoundOn = useCallback((val) => {
    soundOnRef.current = val;
    if (!val) stopHum();
  }, [stopHum]);

  return { startHum, updateHum, stopHum, playCrash, playCashout, setSoundOn, preload };
}
